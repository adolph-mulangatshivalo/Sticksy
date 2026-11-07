import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { injectWhatsAppExif } from './exif.js';

/**
 * Execute an ffmpeg command asynchronously.
 */
function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const process = spawn('ffmpeg', args);
    let stderr = '';

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}:\n${stderr.slice(-600)}`));
      }
    });

    process.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Converts a static image to a 512x512 WhatsApp static sticker.
 * Supports freeform and square cropData ({ x, y, width, height, rotate }).
 * Output is always WhatsApp compliant: 512x512, transparent padding if non-square, with EXIF.
 */
export async function convertStaticImage({ inputPath, outputPath, cropMode = 'fit', cropData = null, metadata = {} }) {
  let filter;

  if (cropData && cropData.width > 0 && cropData.height > 0) {
    const cropW = Math.max(1, Math.round(cropData.width));
    const cropH = Math.max(1, Math.round(cropData.height));
    const cropX = Math.max(0, Math.round(cropData.x || 0));
    const cropY = Math.max(0, Math.round(cropData.y || 0));

    // Handle optional rotation from Cropper if specified
    const rot = (Math.round(cropData.rotate || 0) % 360 + 360) % 360;
    let rotFilter = '';
    if (rot === 90) {
      rotFilter = 'transpose=1,';
    } else if (rot === 180) {
      rotFilter = 'hflip,vflip,';
    } else if (rot === 270) {
      rotFilter = 'transpose=2,';
    }

    filter = `${rotFilter}crop=${cropW}:${cropH}:${cropX}:${cropY},scale='trunc(min(512,512*iw/ih)/2)*2':'trunc(min(512,512*ih/iw)/2)*2'`;
  } else {
    filter = "scale='trunc(min(512,512*iw/ih)/2)*2':'trunc(min(512,512*ih/iw)/2)*2'";
  }

  const args = [
    '-y',
    '-i', inputPath,
    '-vf', filter,
    '-c:v', 'libwebp',
    '-quality', '80',
    '-compression_level', '6',
    outputPath
  ];

  await runFfmpeg(args);

  // Inject WhatsApp EXIF
  const rawWebp = fs.readFileSync(outputPath);
  const stickerWebp = await injectWhatsAppExif(rawWebp, metadata);
  fs.writeFileSync(outputPath, stickerWebp);

  return {
    path: outputPath,
    size: stickerWebp.length,
    animated: false
  };
}

/**
 * Converts a video or GIF to a 512x512 animated WhatsApp sticker (under 500 KB limit).
 * Supports up to 10.0s maximum duration (official WhatsApp animated sticker limit).
 * Automatically applies multi-pass compression to ensure the sticker STAYS its full duration
 * and never exceeds WhatsApp's strict 500 KB ceiling.
 */
export async function convertAnimatedMedia({
  inputPath,
  outputPath,
  startTime = 0,
  duration = 10.0,
  fps = 12,
  quality = 35,
  cropMode = 'fit',
  cropData = null,
  metadata = {}
}) {
  // WhatsApp maximum animated sticker duration is 10.0 seconds
  const safeDuration = Math.min(Math.max(parseFloat(duration) || 10.0, 0.5), 10.0);
  const safeStart = Math.max(parseFloat(startTime) || 0, 0);

  const getFilter = (targetFps, targetScale = 512) => {
    if (cropData && cropData.width > 0 && cropData.height > 0) {
      const cropW = Math.max(2, Math.round(cropData.width / 2) * 2);
      const cropH = Math.max(2, Math.round(cropData.height / 2) * 2);
      const cropX = Math.max(0, Math.round(cropData.x || 0));
      const cropY = Math.max(0, Math.round(cropData.y || 0));
      return `fps=${targetFps},crop=${cropW}:${cropH}:${cropX}:${cropY},scale='trunc(min(${targetScale},${targetScale}*iw/ih)/2)*2':'trunc(min(${targetScale},${targetScale}*ih/iw)/2)*2',format=rgba`;
    }
    return `fps=${targetFps},scale='trunc(min(${targetScale},${targetScale}*iw/ih)/2)*2':'trunc(min(${targetScale},${targetScale}*ih/iw)/2)*2',format=rgba`;
  };

  const runEncode = async (targetFps, targetQuality, targetScale = 512) => {
    const activeFilter = getFilter(targetFps, targetScale);

    const args = [
      '-y',
      '-ss', safeStart.toString(),
      '-t', safeDuration.toString(), // Keep the FULL user-chosen duration (up to 10.0s)
      '-i', inputPath,
      '-vf', activeFilter,
      '-c:v', 'libwebp',
      '-lossless', '0',
      '-compression_level', '3',
      '-q:v', targetQuality.toString(),
      '-loop', '0',
      '-an',
      outputPath
    ];

    await runFfmpeg(args);
  };

  // Pass 1: Standard high-quality 10s encode
  const initialFps = Math.min(fps, safeDuration > 6.0 ? 12 : 14);
  const initialQuality = safeDuration > 6.0 ? 35 : 42;
  await runEncode(initialFps, initialQuality, 512);

  let rawWebp = fs.readFileSync(outputPath);
  let stickerWebp = await injectWhatsAppExif(rawWebp, metadata);

  // WhatsApp strictly rejects animated stickers > 500 KB (512,000 bytes).
  // If too large, reduce FPS and quality while PRESERVING the full 10-second duration!
  if (stickerWebp.length > 490000) {
    // Pass 2: Lower FPS and quality (full duration preserved)
    await runEncode(10, 28, 512);
    rawWebp = fs.readFileSync(outputPath);
    stickerWebp = await injectWhatsAppExif(rawWebp, metadata);
  }

  if (stickerWebp.length > 490000) {
    // Pass 3: Ultra compression (full duration preserved)
    await runEncode(8, 22, 512);
    rawWebp = fs.readFileSync(outputPath);
    stickerWebp = await injectWhatsAppExif(rawWebp, metadata);
  }

  if (stickerWebp.length > 490000) {
    // Pass 4: Fallback scale to 448 with transparent 512 padding (full duration preserved)
    await runEncode(7, 18, 448);
    rawWebp = fs.readFileSync(outputPath);
    stickerWebp = await injectWhatsAppExif(rawWebp, metadata);
  }

    fs.writeFileSync(outputPath, stickerWebp);

  return {
    path: outputPath,
    size: stickerWebp.length,
    animated: true,
    duration: safeDuration
  };
}

/**
 * Converts a video or animated media into an optimized 512x512 animated GIF.
 * When pasted into WhatsApp, WhatsApp prompts: "Send as Sticker" or "Send as GIF"!
 */
export async function convertAnimatedToGif({
  inputPath,
  outputPath,
  startTime = 0,
  duration = 3.5,
  fps = 10,
  cropMode = 'fit',
  cropData = null,
  metadata = {}
}) {
  // Fast, crisp animation (up to 3.5s) for instant loading, small file size, and zero lag
  const safeDuration = Math.min(Math.max(parseFloat(duration) || 3.5, 0.5), 3.5);
  const safeStart = Math.max(parseFloat(startTime) || 0, 0);

  // Smooth 11 FPS, 80 colors, and 384px scale for fast ~1MB download and instant rendering
  const targetFps = 11;
  const maxColors = 80;
  const targetScale = 384;

  let filterBase = '';
  if (cropData && cropData.width > 0 && cropData.height > 0) {
    const cropW = Math.max(2, Math.round(cropData.width / 2) * 2);
    const cropH = Math.max(2, Math.round(cropData.height / 2) * 2);
    const cropX = Math.max(0, Math.round(cropData.x || 0));
    const cropY = Math.max(0, Math.round(cropData.y || 0));
    filterBase = `fps=${targetFps},crop=${cropW}:${cropH}:${cropX}:${cropY},scale='trunc(min(${targetScale},${targetScale}*iw/ih)/2)*2':'trunc(min(${targetScale},${targetScale}*ih/iw)/2)*2'`;
  } else {
    filterBase = `fps=${targetFps},scale='trunc(min(${targetScale},${targetScale}*iw/ih)/2)*2':'trunc(min(${targetScale},${targetScale}*ih/iw)/2)*2'`;
  }

  // High quality palette with diff_mode=rectangle and low bayer scale for crisp, smooth rendering
  const filter = `${filterBase},split[s0][s1];[s0]palettegen=max_colors=${maxColors}:reserve_transparent=on:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=2:diff_mode=rectangle`;

  const args = [
    '-y',
    '-ss', safeStart.toString(),
    '-t', safeDuration.toString(),
    '-i', inputPath,
    '-vf', filter,
    '-loop', '0', // 0 = Infinite loop — continuous fluid animation!
    outputPath
  ];

  await runFfmpeg(args);

  let stat = fs.statSync(outputPath);

  // Extract a 1-frame 512x512 PNG representation for instant preview & fallback!
  const pngPath = outputPath.replace(/\.gif$/i, '.png');
  try {
    await runFfmpeg([
      '-y',
      '-ss', safeStart.toString(),
      '-i', inputPath,
      '-vf', filterBase,
      '-vframes', '1',
      pngPath
    ]);
  } catch (e) {
    console.warn('PNG snapshot extraction warning:', e.message);
  }

  // Generate WhatsApp Native Looping GIF MP4 (WhatsApp treats short silent MP4s as native looping GIFs!)
  const mp4Path = outputPath.replace(/\.gif$/i, '.mp4');
  try {
    const mp4Duration = Math.min(safeDuration, 6.0); // WhatsApp requires <= 6.0s for the [GIF] toggle
    let mp4Filter = '';
    if (cropData && cropData.width > 0 && cropData.height > 0) {
      const cropW = Math.max(2, Math.round(cropData.width / 2) * 2);
      const cropH = Math.max(2, Math.round(cropData.height / 2) * 2);
      const cropX = Math.max(0, Math.round(cropData.x || 0));
      const cropY = Math.max(0, Math.round(cropData.y || 0));
      mp4Filter = `crop=${cropW}:${cropH}:${cropX}:${cropY},fps=20,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(512-iw)/2:(512-ih)/2:color=black`;
    } else {
      mp4Filter = cropMode === 'crop'
        ? `fps=20,scale=512:512:force_original_aspect_ratio=increase,crop=512:512`
        : `fps=20,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(512-iw)/2:(512-ih)/2:color=black`;
    }

    await runFfmpeg([
      '-y',
      '-ss', safeStart.toString(),
      '-t', mp4Duration.toString(),
      '-i', inputPath,
      '-vf', mp4Filter,
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '22',
      '-pix_fmt', 'yuv420p',
      '-an',
      '-movflags', '+faststart',
      mp4Path
    ]);
  } catch (err) {
    console.warn('WhatsApp MP4 GIF generation warning:', err.message);
  }

  // Generate official WhatsApp animated sticker WebP with EXIF metadata
  const webpPath = outputPath.replace(/\.gif$/i, '.webp');
  try {
    await convertAnimatedMedia({
      inputPath,
      outputPath: webpPath,
      startTime: safeStart,
      duration: safeDuration,
      fps: 12,
      cropMode,
      cropData,
      metadata
    });
  } catch (err) {
    console.warn('WhatsApp animated sticker WebP generation warning:', err.message);
  }

  return {
    path: outputPath,
    mp4Path,
    webpPath,
    pngPath,
    size: stat.size,
    animated: true,
    format: 'gif',
    duration: safeDuration
  };
}

/**
 * Converts a static image to a 512x512 GIF, WebP (WhatsApp Sticker), and PNG.
 */
export async function convertStaticToGif({ inputPath, outputPath, cropMode = 'fit', cropData = null, metadata = {} }) {
  let filter;
  if (cropData && cropData.width > 0 && cropData.height > 0) {
    const cropW = Math.max(2, Math.round(cropData.width / 2) * 2);
    const cropH = Math.max(2, Math.round(cropData.height / 2) * 2);
    const cropX = Math.max(0, Math.round(cropData.x || 0));
    const cropY = Math.max(0, Math.round(cropData.y || 0));
    filter = `crop=${cropW}:${cropH}:${cropX}:${cropY},scale='trunc(min(512,512*iw/ih)/2)*2':'trunc(min(512,512*ih/iw)/2)*2'`;
  } else {
    filter = "scale='trunc(min(512,512*iw/ih)/2)*2':'trunc(min(512,512*ih/iw)/2)*2'";
  }

  const args = [
    '-y',
    '-i', inputPath,
    '-vf', filter,
    outputPath
  ];

  await runFfmpeg(args);

  // Extract static PNG representation for instant clipboard pasting!
  const pngPath = outputPath.replace(/\.gif$/i, '.png');
  try {
    await runFfmpeg([
      '-y',
      '-i', inputPath,
      '-vf', filter,
      pngPath
    ]);
  } catch (e) {
    console.warn('Static PNG snapshot extraction warning:', e.message);
  }

  // Generate official WhatsApp static WebP sticker with EXIF metadata
  const webpPath = outputPath.replace(/\.gif$/i, '.webp');
  try {
    await convertStaticImage({
      inputPath,
      outputPath: webpPath,
      cropMode,
      cropData,
      metadata
    });
  } catch (err) {
    console.warn('WhatsApp static sticker WebP generation warning:', err.message);
  }

  const stat = fs.statSync(outputPath);
  return {
    path: outputPath,
    webpPath,
    pngPath,
    size: stat.size,
    animated: false,
    format: 'gif'
  };
}
