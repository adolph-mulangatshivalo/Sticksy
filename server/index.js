import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import multer from 'multer';

import { inspectMedia, downloadMedia, detectPlatform, cleanUrlInput } from './downloader.js';
import { convertAnimatedMedia, convertStaticImage, convertAnimatedToGif, convertStaticToGif } from './converter.js';
import { startPeriodicCleanup } from './cleanup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const tempDir = path.join(rootDir, 'temp');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Start auto-cleanup every 2 minutes for files older than 10 minutes
startPeriodicCleanup(tempDir, 10 * 60 * 1000, 2 * 60 * 1000);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Multer for direct file uploads
const upload = multer({
  dest: tempDir,
  limits: { fileSize: 40 * 1024 * 1024 } // 40 MB max upload
});

// PWA Manifest and Service Worker headers
app.get('/manifest.json', (req, res, next) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  next();
});

app.get('/sw.js', (req, res, next) => {
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});

// PWA Share Target endpoint (supports both GET and POST)
app.all('/share-target', upload.single('media'), (req, res) => {
  const sharedUrl = req.body?.url || req.query?.url;
  const sharedText = req.body?.text || req.query?.text;
  const sharedTitle = req.body?.title || req.query?.title;

  const combined = `${sharedUrl || ''} ${sharedText || ''} ${sharedTitle || ''}`;
  const match = combined.match(/(https?:\/\/[^\s"'<>()[\]{}]+)/i);
  if (match) {
    const link = match[1].replace(/[.,;:!?)]+$/, '');
    return res.redirect(303, `/?url=${encodeURIComponent(link)}`);
  }

  res.redirect(303, '/');
});

// Serve frontend static assets with aggressive no-cache headers for instant updates
app.use(express.static(path.join(rootDir, 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('.css') || filePath.endsWith('.json')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// Health check endpoint for cloud hosting
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Request Logger
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API ${req.method}] ${req.path}`, req.body?.url ? `url: ${req.body.url}` : '');
  }
  next();
});

/**
 * 1. Inspect URL for instant preview (title, thumbnail, video/image indicator)
 */
app.post('/api/inspect', async (req, res) => {
  try {
    const rawUrl = req.body?.url;
    const url = cleanUrlInput(rawUrl);
    if (!url || !url.startsWith('http')) {
      return res.status(400).json({ error: 'Please enter a valid link starting with http:// or https://' });
    }

    const info = await inspectMedia(url);
    console.log(`[API Inspect Success] type: ${info.type}, title: ${info.title}, videoUrl: ${info.videoUrl ? 'yes' : 'no'}`);
    res.json(info);
  } catch (err) {
    console.error('Inspect error:', err.message);
    let userMsg = err.message || 'Failed to fetch media.';
    if (userMsg.includes('No video formats found') || userMsg.includes('format is not available')) {
      userMsg = 'No video found at this link. If this is a photo, please make sure the post is public or try another link!';
    } else if (userMsg.includes('404') || userMsg.includes('Not Found')) {
      userMsg = 'This post could not be found or may be private. Please check the link and try another!';
    } else if (userMsg.includes('login') || userMsg.includes('sign in')) {
      userMsg = 'This post requires a login to view. Please try a public post or direct link!';
    } else if (userMsg.includes('yt-dlp') || userMsg.includes('ERROR:')) {
      userMsg = 'Unable to extract media from this link. Please verify that the post is public and try again.';
    }
    res.status(500).json({ error: userMsg });
  }
});

/**
 * Image Proxy to bypass CORS restrictions for client-side Cropper.js
 */
app.get('/api/proxy-image', async (req, res) => {
  const { url } = req.query;
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return res.status(400).send('Valid image URL required');
  }

  try {
    const parsed = new URL(url);
    let referer = undefined;
    if (parsed.hostname.includes('tiktokcdn') || parsed.hostname.includes('tikwm') || parsed.hostname.includes('tiktok')) {
      referer = 'https://www.tiktok.com/';
    } else if (parsed.hostname.includes('cdninstagram') || parsed.hostname.includes('fbcdn.net') || parsed.hostname.includes('instagram')) {
      referer = 'https://www.instagram.com/';
    } else if (parsed.hostname.includes('pinimg.com') || parsed.hostname.includes('pinterest')) {
      referer = 'https://www.pinterest.com/';
    } else if (parsed.hostname.includes('twimg.com') || parsed.hostname.includes('twitter') || parsed.hostname.includes('x.com')) {
      referer = 'https://twitter.com/';
    }

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    };
    if (referer) headers['Referer'] = referer;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      return res.status(response.status).send('Failed to fetch image');
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).send(err.message || 'Image proxy failed');
  }
});

/**
 * Video Proxy to stream video files with Range headers and bypass cross-origin/CDN restrictions.
 * Automatically transcodes GIFs and HLS (.m3u8) streams to fast-start MP4 so <video> elements play them seamlessly on loop!
 */
app.get('/api/proxy-video', async (req, res) => {
  const { url } = req.query;
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return res.status(400).send('Valid video URL required');
  }

  try {
    let activeUrl = url;

    const isGif = /\.gif($|\?)/i.test(activeUrl);
    const isM3u8 = /\.m3u8($|\?)/i.test(activeUrl);

    if (isGif || isM3u8) {
      const crypto = await import('crypto');
      const hash = crypto.createHash('md5').update(activeUrl).digest('hex');
      const cachedMp4 = path.join(tempDir, `cache_${hash}.mp4`);

      if (!fs.existsSync(cachedMp4)) {
        const { spawn } = await import('child_process');

        if (isGif) {
          const gifTemp = path.join(tempDir, `cache_${hash}.gif`);
          if (!fs.existsSync(gifTemp)) {
            const gifResp = await fetch(activeUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });
            const buf = await gifResp.arrayBuffer();
            fs.writeFileSync(gifTemp, Buffer.from(buf));
          }

          await new Promise((resolve, reject) => {
            const ffmpeg = spawn('ffmpeg', [
              '-y',
              '-i', gifTemp,
              '-movflags', 'faststart',
              '-pix_fmt', 'yuv420p',
              '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
              '-c:v', 'libx264',
              '-preset', 'ultrafast',
              cachedMp4
            ]);
            ffmpeg.on('close', code => code === 0 ? resolve() : reject(new Error('GIF conversion failed')));
            ffmpeg.on('error', reject);
          });
        } else {
          // isM3u8
          await new Promise((resolve, reject) => {
            const ffmpeg = spawn('ffmpeg', [
              '-y',
              '-protocol_whitelist', 'file,http,https,tcp,tls,crypto',
              '-i', activeUrl,
              '-c', 'copy',
              '-movflags', 'faststart',
              cachedMp4
            ]);
            ffmpeg.on('close', code => code === 0 ? resolve() : reject(new Error('M3U8 conversion failed')));
            ffmpeg.on('error', reject);
          });
        }
      }

      const stat = fs.statSync(cachedMp4);
      const fileSize = stat.size;
      const range = req.headers.range;

      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Access-Control-Allow-Origin', '*');

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        });
        fs.createReadStream(cachedMp4, { start, end }).pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        });
        fs.createReadStream(cachedMp4).pipe(res);
      }
      return;
    }

    const parsed = new URL(activeUrl);
    let referer = undefined;
    if (parsed.hostname.includes('tiktokcdn') || parsed.hostname.includes('tikwm') || parsed.hostname.includes('tiktok')) {
      referer = 'https://www.tiktok.com/';
    } else if (parsed.hostname.includes('cdninstagram') || parsed.hostname.includes('fbcdn.net') || parsed.hostname.includes('instagram')) {
      referer = 'https://www.instagram.com/';
    } else if (parsed.hostname.includes('pinimg.com') || parsed.hostname.includes('pinterest')) {
      referer = 'https://www.pinterest.com/';
    } else if (parsed.hostname.includes('twimg.com') || parsed.hostname.includes('twitter') || parsed.hostname.includes('x.com')) {
      referer = 'https://twitter.com/';
    }

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    };
    if (referer) headers['Referer'] = referer;

    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    const response = await fetch(activeUrl, { headers });
    res.status(response.status);

    const forwardHeaders = ['content-type', 'content-length', 'content-range', 'accept-ranges'];
    forwardHeaders.forEach(h => {
      const val = response.headers.get(h);
      if (val) res.setHeader(h, val);
    });

    if (!res.getHeader('content-type')) {
      res.setHeader('content-type', 'video/mp4');
    }
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (!response.body) {
      return res.end();
    }

    Readable.fromWeb(response.body).pipe(res);
  } catch (err) {
    console.error('Video proxy error:', err.message);
    if (!res.headersSent) {
      res.status(500).send(err.message || 'Video proxy failed');
    }
  }
});

/**
 * Fast Video Filmstrip Generator (Extracts 8 frames in 30ms for the scrubber line)
 */
app.get('/api/video-filmstrip', async (req, res) => {
  const { url } = req.query;
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return res.status(400).send('Valid video URL required');
  }

  const duration = Math.max(0.5, parseFloat(req.query.duration) || 10.0);

  try {
    const crypto = await import('crypto');
    const hash = crypto.createHash('md5').update(`${url}_${duration.toFixed(1)}`).digest('hex');
    const filmstripJpg = path.join(tempDir, `filmstrip_${hash}.jpg`);

    if (!fs.existsSync(filmstripJpg)) {
      const inputVideo = await downloadMedia(url, tempDir, `temp_fs_${hash}`);
      const { spawn } = await import('child_process');
      const fpsVal = Math.max(0.1, 8 / duration);
      await new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
          '-y',
          '-i', inputVideo,
          '-vf', `fps=${fpsVal.toFixed(2)},scale=80:48,tile=8x1`,
          '-frames:v', '1',
          '-update', '1',
          filmstripJpg
        ]);
        ffmpeg.on('close', code => code === 0 ? resolve() : reject(new Error('Filmstrip generation failed')));
        ffmpeg.on('error', reject);
      });
      // Cleanup temp download
      try { if (fs.existsSync(inputVideo)) fs.unlinkSync(inputVideo); } catch (_) {}
    }

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    fs.createReadStream(filmstripJpg).pipe(res);
  } catch (err) {
    console.error('Filmstrip error:', err.message);
    res.status(500).send(err.message || 'Filmstrip failed');
  }
});

app.post('/api/upload-filmstrip', upload.single('media'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const filmstripJpg = `${req.file.path}_filmstrip.jpg`;
  const duration = Math.max(0.5, parseFloat(req.body.duration) || 10.0);
  const fpsVal = Math.max(0.1, 8 / duration);
  try {
    const { spawn } = await import('child_process');
    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-y',
        '-i', req.file.path,
        '-vf', `fps=${fpsVal.toFixed(2)},scale=80:48,tile=8x1`,
        '-frames:v', '1',
        '-update', '1',
        filmstripJpg
      ]);
      ffmpeg.on('close', code => code === 0 ? resolve() : reject(new Error('Upload filmstrip failed')));
      ffmpeg.on('error', reject);
    });
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Access-Control-Allow-Origin', '*');
    fs.createReadStream(filmstripJpg).pipe(res);
  } catch (e) {
    res.status(500).send('Filmstrip error');
  }
});

/**
 * 2. Create sticker from URL
 */
app.post('/api/create-sticker', async (req, res) => {
  const filePrefix = `sticker_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let downloadedPath = null;

  try {
    const {
      url: rawUrl,
      startTime = 0,
      duration = 10.0,
      cropMode = 'fit',
      cropData = null,
      packName = 'Sticksy Pack',
      authorName = 'Sticksy'
    } = req.body;

    const url = cleanUrlInput(rawUrl);

    let parsedCropData = null;
    if (cropData) {
      try {
        parsedCropData = typeof cropData === 'string' ? JSON.parse(cropData) : cropData;
      } catch (e) {
        parsedCropData = null;
      }
    }

    if (!url || !url.startsWith('http')) {
      return res.status(400).json({ error: 'Please provide a valid URL starting with http:// or https://' });
    }

    // Step 1: Download media
    downloadedPath = await downloadMedia(url.trim(), tempDir, filePrefix);

    const ext = path.extname(downloadedPath).toLowerCase();
    const isVideo = ['.mp4', '.webm', '.mov', '.gif', '.mkv', '.avi'].includes(ext);

    const outputStickerPath = path.join(tempDir, `${filePrefix}_sticker.webp`);
    const outputGifPath = path.join(tempDir, `${filePrefix}_sticker.gif`);
    let result;

    const metadata = {
      pack: packName || 'StickerSync',
      author: authorName || 'StickerSync App'
    };

    // Step 2: Convert to WhatsApp 512x512 GIF, MP4, and WebP
    if (isVideo) {
      result = await convertAnimatedToGif({
        inputPath: downloadedPath,
        outputPath: outputGifPath,
        startTime: parseFloat(startTime) || 0,
        duration: parseFloat(duration) || 10.0,
        cropMode,
        cropData: parsedCropData,
        metadata
      });
    } else {
      result = await convertStaticToGif({
        inputPath: downloadedPath,
        outputPath: outputGifPath,
        cropMode,
        cropData: parsedCropData,
        metadata
      });
    }

    // Clean up input media immediately to save disk
    try {
      if (fs.existsSync(downloadedPath)) {
        fs.unlinkSync(downloadedPath);
      }
    } catch (e) {
      // ignore
    }

    const stickerId = `${filePrefix}_sticker`;
    res.json({
      success: true,
      id: stickerId,
      sizeBytes: result.size,
      sizeKb: (result.size / 1024).toFixed(1),
      animated: isVideo,
      duration: result.duration || null,
      format: 'gif',
      viewUrl: `/api/sticker/${stickerId}.gif`,
      gifUrl: `/api/sticker/${stickerId}.gif`,
      mp4Url: `/api/sticker/${stickerId}.mp4`,
      webpUrl: `/api/sticker/${stickerId}.webp`,
      pngUrl: `/api/sticker/${stickerId}.png`,
      downloadUrl: `/api/sticker/${stickerId}.gif?download=1`
    });
  } catch (err) {
    console.error('Create sticker error:', err);
    // Cleanup if failed
    if (downloadedPath && fs.existsSync(downloadedPath)) {
      try { fs.unlinkSync(downloadedPath); } catch (e) {}
    }
    res.status(500).json({ error: err.message || 'Failed to create sticker' });
  }
});

/**
 * 3. Upload file directly from phone/device and convert to sticker
 */
app.post('/api/upload-sticker', upload.single('media'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No media file uploaded' });
  }

  const uploadedPath = req.file.path;
  const filePrefix = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const outputStickerPath = path.join(tempDir, `${filePrefix}_sticker.webp`);
  const outputGifPath = path.join(tempDir, `${filePrefix}_sticker.gif`);

  try {
    const {
      startTime = 0,
      duration = 10.0,
      cropMode = 'fit',
      cropData = null,
      packName = 'Sticksy Pack',
      authorName = 'Sticksy'
    } = req.body;

    let parsedCropData = null;
    if (cropData) {
      try {
        parsedCropData = typeof cropData === 'string' ? JSON.parse(cropData) : cropData;
      } catch (e) {
        parsedCropData = null;
      }
    }

    const mime = (req.file.mimetype || '').toLowerCase();
    const isVideo = mime.startsWith('video/') || mime.includes('gif');

    const metadata = {
      pack: packName || 'StickerSync',
      author: authorName || 'StickerSync App'
    };

    let result;
    if (isVideo) {
      result = await convertAnimatedToGif({
        inputPath: uploadedPath,
        outputPath: outputGifPath,
        startTime: parseFloat(startTime) || 0,
        duration: parseFloat(duration) || 10.0,
        cropMode,
        cropData: parsedCropData,
        metadata
      });
    } else {
      result = await convertStaticToGif({
        inputPath: uploadedPath,
        outputPath: outputGifPath,
        cropMode,
        cropData: parsedCropData,
        metadata
      });
    }

    // Clean up uploaded original file
    try {
      if (fs.existsSync(uploadedPath)) fs.unlinkSync(uploadedPath);
    } catch (e) {}

    const stickerId = `${filePrefix}_sticker`;
    res.json({
      success: true,
      id: stickerId,
      sizeBytes: result.size,
      sizeKb: (result.size / 1024).toFixed(1),
      animated: isVideo,
      duration: result.duration || null,
      format: 'gif',
      viewUrl: `/api/sticker/${stickerId}.gif`,
      gifUrl: `/api/sticker/${stickerId}.gif`,
      mp4Url: `/api/sticker/${stickerId}.mp4`,
      webpUrl: `/api/sticker/${stickerId}.webp`,
      pngUrl: `/api/sticker/${stickerId}.png`,
      downloadUrl: `/api/sticker/${stickerId}.gif?download=1`
    });
  } catch (err) {
    console.error('Upload sticker error:', err);
    try {
      if (fs.existsSync(uploadedPath)) fs.unlinkSync(uploadedPath);
    } catch (e) {}
    res.status(500).json({ error: err.message || 'Failed to process uploaded file' });
  }
});

/**
 * 4. Serve the generated sticker
 */
app.get('/api/sticker/:id', async (req, res) => {
  const safeId = path.basename(req.params.id);
  const baseName = safeId.replace(/\.(webp|gif|png|mp4)$/i, '');
  const wantsMp4 = safeId.endsWith('.mp4') || req.query.format === 'mp4';
  const wantsWebp = safeId.endsWith('.webp') || req.query.format === 'webp';
  const wantsGif = safeId.endsWith('.gif') || req.query.format === 'gif';
  const wantsPng = safeId.endsWith('.png') || req.query.format === 'png';

  const mp4Path = path.join(tempDir, `${baseName}.mp4`);
  const gifPath = path.join(tempDir, `${baseName}.gif`);
  const webpPath = path.join(tempDir, `${baseName}.webp`);
  const pngPath = path.join(tempDir, `${baseName}.png`);

  let targetPath = null;
  let contentType = 'image/gif';
  let ext = 'gif';

  if (wantsMp4) {
    if (fs.existsSync(mp4Path)) {
      targetPath = mp4Path;
    } else if (fs.existsSync(gifPath)) {
      // Auto-transcode GIF to WhatsApp MP4 on demand if needed
      try {
        const { spawn } = await import('child_process');
        await new Promise((resolve) => {
          const ffmpeg = spawn('ffmpeg', [
            '-y',
            '-i', gifPath,
            '-c:v', 'libx264',
            '-pix_fmt', 'yuv420p',
            '-an',
            '-movflags', '+faststart',
            mp4Path
          ]);
          ffmpeg.on('close', resolve);
          ffmpeg.on('error', () => resolve());
        });
        if (fs.existsSync(mp4Path)) targetPath = mp4Path;
      } catch (e) {}
    }
    if (targetPath) {
      contentType = 'video/mp4';
      ext = 'mp4';
    }
  }

  if (!targetPath && wantsPng) {
    if (fs.existsSync(pngPath)) {
      targetPath = pngPath;
    } else if (fs.existsSync(gifPath)) {
      // Auto-extract PNG frame on demand if needed
      try {
        const { spawn } = await import('child_process');
        await new Promise((resolve) => {
          const ffmpeg = spawn('ffmpeg', ['-y', '-i', gifPath, '-vframes', '1', pngPath]);
          ffmpeg.on('close', resolve);
          ffmpeg.on('error', () => resolve());
        });
        if (fs.existsSync(pngPath)) targetPath = pngPath;
      } catch (e) {}
    }
    if (targetPath) {
      contentType = 'image/png';
      ext = 'png';
    }
  }

  if (!targetPath) {
    if (wantsGif && fs.existsSync(gifPath)) {
      targetPath = gifPath;
      contentType = 'image/gif';
      ext = 'gif';
    } else if (wantsWebp && fs.existsSync(webpPath)) {
      targetPath = webpPath;
      contentType = 'image/webp';
      ext = 'webp';
    } else if (fs.existsSync(gifPath)) {
      targetPath = gifPath;
      contentType = 'image/gif';
      ext = 'gif';
    } else if (fs.existsSync(mp4Path)) {
      targetPath = mp4Path;
      contentType = 'video/mp4';
      ext = 'mp4';
    } else if (fs.existsSync(webpPath)) {
      targetPath = webpPath;
      contentType = 'image/webp';
      ext = 'webp';
    } else if (fs.existsSync(pngPath)) {
      targetPath = pngPath;
      contentType = 'image/png';
      ext = 'png';
    }
  }

  if (!targetPath || !fs.existsSync(targetPath)) {
    return res.status(404).json({ error: 'Sticker not found or expired. Please generate it again.' });
  }

  const stat = fs.statSync(targetPath);
  const fileSize = stat.size;

  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.query.download === '1') {
    res.setHeader('Content-Disposition', `attachment; filename="sticker.${ext}"`);
  } else {
    res.setHeader('Content-Disposition', `inline; filename="sticker.${ext}"`);
  }

  // Support HTTP 206 Range requests for video/mp4 streaming
  const range = req.headers.range;
  if (contentType === 'video/mp4' && range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    });
    fs.createReadStream(targetPath, { start, end }).pipe(res);
  } else {
    res.setHeader('Content-Length', fileSize);
    fs.createReadStream(targetPath).pipe(res);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(`🚀 Sticksy Server running on http://localhost:${PORT}`);
  console.log(`⚡ Every link deserves a sticker.`);
  console.log(`=========================================`);
});

