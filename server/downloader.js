import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Clean URL from input string (handling whitespace, share sheet text, quotes).
 */
export function cleanUrlInput(raw) {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  const match = trimmed.match(/https?:\/\/[^\s"'<>]+/i);
  return match ? match[0] : trimmed;
}

/**
 * Detect platform from URL.
 */
export function detectPlatform(url) {
  const lower = url.toLowerCase();
  if (lower.includes('tiktok.com')) return { id: 'tiktok', name: 'TikTok', icon: '🎵' };
  if (lower.includes('instagram.com')) return { id: 'instagram', name: 'Instagram', icon: '📸' };
  if (lower.includes('pinterest.com') || lower.includes('pin.it')) return { id: 'pinterest', name: 'Pinterest', icon: '📌' };
  if (lower.includes('facebook.com') || lower.includes('fb.watch')) return { id: 'facebook', name: 'Facebook', icon: '📘' };
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return { id: 'youtube', name: 'YouTube', icon: '▶️' };
  if (lower.includes('twitter.com') || lower.includes('x.com')) return { id: 'twitter', name: 'X / Twitter', icon: '🐦' };
  if (lower.includes('reddit.com') || lower.includes('v.redd.it')) return { id: 'reddit', name: 'Reddit', icon: '🤖' };
  if (lower.includes('giphy.com')) return { id: 'giphy', name: 'GIPHY', icon: '✨' };
  if (lower.includes('tenor.com')) return { id: 'tenor', name: 'Tenor', icon: '🎭' };
  if (/\.(jpg|jpeg|png|webp|gif|mp4|webm|mov|gifv|m3u8)($|\?)/i.test(lower)) return { id: 'direct', name: 'Direct Media', icon: '🔗' };
  return { id: 'web', name: 'Web Link', icon: '🌐' };
}

/**
 * Check if the URL points directly to an image or video file.
 */
function isDirectMediaUrl(url) {
  return /\.(jpg|jpeg|png|webp|gif|mp4|webm|mov|gifv|m3u8)($|\?)/i.test(url);
}

/**
 * Download a direct media URL using native fetch.
 */
export async function downloadDirectMedia(url, outputPath) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to download media: HTTP ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));
  return outputPath;
}

/**
 * Fast extractor for Giphy links.
 */
export async function extractGiphyDirect(url) {
  try {
    const match = url.match(/(?:gifs\/|media\/)(?:[a-zA-Z0-9_-]+-)?([a-zA-Z0-9]+)(?:$|\/|\?)/i);
    if (!match) return null;
    const id = match[1];
    const mp4Url = `https://media.giphy.com/media/${id}/giphy.mp4`;
    const gifUrl = `https://media.giphy.com/media/${id}/giphy.gif`;
    
    // Quick test if MP4 exists on Giphy CDN
    const r = await fetch(mp4Url, { method: 'HEAD' });
    if (r.ok) {
      return {
        title: 'GIPHY Animation',
        thumbnail: gifUrl,
        videoUrl: mp4Url,
        type: 'video',
        duration: 3.5,
        isGif: false,
        platform: { id: 'giphy', name: 'GIPHY', icon: '✨' }
      };
    }
  } catch (e) {
    // fallback
  }
  return null;
}

/**
 * Fast extractor for Tenor links.
 */
export async function extractTenorDirect(url) {
  try {
    if (!url.includes('tenor.com/view/')) return null;
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    if (!r.ok) return null;
    const html = await r.text();
    const ogVideo = html.match(/property="og:video(?::secure_url)?"\s+content="([^"]+)"/i) || html.match(/content="([^"]+)"\s+property="og:video(?::secure_url)?"/i);
    const ogImg = html.match(/property="og:image"\s+content="([^"]+)"/i) || html.match(/content="([^"]+)"\s+property="og:image"/i);
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(' - Discover & Share GIFs', '').trim() : 'Tenor GIF';
    
    if (ogVideo && ogVideo[1]) {
      return {
        title,
        thumbnail: (ogImg && ogImg[1]) || ogVideo[1],
        videoUrl: ogVideo[1],
        type: 'video',
        duration: 3.5,
        platform: { id: 'tenor', name: 'Tenor', icon: '🎭' }
      };
    }
  } catch (e) {
    // fallback
  }
  return null;
}

/**
 * Fast & reliable TikTok extractor using TikWM API (bypasses TikTok IP restrictions).
 */
export async function extractTikTokDirect(url) {
  try {
    const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.code === 0 && json.data) {
      const data = json.data;
      const isVideo = Boolean(data.play || data.hdplay || data.wmplay);
      const isPhotoSlideshow = Array.isArray(data.images) && data.images.length > 0;
      
      if (isVideo) {
        return {
          title: data.title || 'TikTok Video',
          thumbnail: data.cover || data.origin_cover || null,
          videoUrl: data.play || data.hdplay || data.wmplay,
          type: 'video',
          duration: data.duration ? Math.min(Math.round(data.duration), 60) : 5,
          platform: { id: 'tiktok', name: 'TikTok', icon: '🎵' }
        };
      } else if (isPhotoSlideshow) {
        return {
          title: data.title || 'TikTok Photo',
          thumbnail: data.images[0],
          videoUrl: null,
          type: 'image',
          platform: { id: 'tiktok', name: 'TikTok', icon: '🎵' }
        };
      }
    }
  } catch (e) {
    // fallback
  }
  return null;
}

/**
 * Helper to decode JWT payloads from FastDL tokens.
 */
function decodeJwtUrl(token) {
  if (!token) return null;
  const match = token.match(/token=([^"'\s&]+)/);
  const rawToken = match ? match[1] : token;
  try {
    const parts = rawToken.split('.');
    if (parts.length >= 2) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      if (payload && payload.url) return payload.url;
    }
  } catch (e) {}
  return null;
}

/**
 * Fast & reliable Instagram extractor using FastDL API (extracts direct Meta CDN MP4 & JPEG links).
 */
export async function extractInstagramDirect(url) {
  try {
    const res = await fetch('https://fastdl.to/api/ajaxSearch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': 'https://fastdl.to',
        'Referer': 'https://fastdl.to/'
      },
      body: new URLSearchParams({ q: url, t: 'media', lang: 'en' }).toString()
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json || !json.data) return null;
    
    const html = json.data;
    const isVideo = html.includes('icon-dlvideo') || html.includes('Download Video') || html.includes('.mp4');
    
    const videoHrefMatch = html.match(/href="([^"]+)"[^>]*title="Download Video"/i) || html.match(/href="([^"]+)"[^>]*class="[^"]*abutton[^"]*"/i);
    const imgMatch = html.match(/<img[^>]+src="([^"]+)"/i) || html.match(/href="([^"]+)"[^>]*title="Download Thumbnail"/i);
    
    const rawVideo = videoHrefMatch ? videoHrefMatch[1] : null;
    const rawThumb = imgMatch ? imgMatch[1] : null;

    const videoUrl = isVideo ? (decodeJwtUrl(rawVideo) || rawVideo) : null;
    const thumbnail = decodeJwtUrl(rawThumb) || rawThumb || videoUrl;

    if (videoUrl || thumbnail) {
      return {
        title: 'Instagram ' + (isVideo ? 'Video' : 'Photo'),
        thumbnail,
        videoUrl,
        type: isVideo ? 'video' : 'image',
        duration: isVideo ? 5 : null,
        platform: { id: 'instagram', name: 'Instagram', icon: '📸' }
      };
    }
  } catch (e) {
    // fallback
  }
  return null;
}

/**
 * Fast Twitter / X extractor using FxTwitter API.
 */
export async function extractTwitterDirect(url) {
  try {
    const match = url.match(/(?:status|statuses)\/(\d+)/i);
    if (!match) return null;
    const tweetId = match[1];

    const res = await fetch(`https://api.fxtwitter.com/status/${tweetId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!res.ok) return null;
    const json = await res.json();
    const tweet = json.tweet;
    if (!tweet) return null;

    const title = tweet.text ? (tweet.text.slice(0, 50) + (tweet.text.length > 50 ? '...' : '')) : 'X / Twitter Post';

    if (tweet.media && Array.isArray(tweet.media.videos) && tweet.media.videos.length > 0) {
      const vid = tweet.media.videos[0];
      return {
        title,
        thumbnail: vid.thumbnail_url || (tweet.media.photos && tweet.media.photos[0]?.url) || null,
        videoUrl: vid.url,
        type: 'video',
        duration: vid.duration ? Math.round(vid.duration) : 5,
        platform: { id: 'twitter', name: 'X / Twitter', icon: '🐦' }
      };
    }

    if (tweet.media && Array.isArray(tweet.media.photos) && tweet.media.photos.length > 0) {
      return {
        title,
        thumbnail: tweet.media.photos[0].url,
        videoUrl: null,
        type: 'image',
        platform: { id: 'twitter', name: 'X / Twitter', icon: '🐦' }
      };
    }
  } catch (e) {
    // fallback
  }
  return null;
}

/**
 * Fallback extractor for Pinterest image or video pins.
 */
async function extractPinterestDirect(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      redirect: 'follow'
    });
    const html = await res.text();

    const ogVideoMatch = html.match(/property="og:video(:secure_url)?"\s+content="([^"]+)"/i) || html.match(/content="([^"]+)"\s+property="og:video(:secure_url)?"/i);
    const videoTagMatch = html.match(/<video[^>]+src="([^"]+)"/i) || html.match(/"(https:[^"]+v1\.pinimg\.com\/videos\/[^"]+\.mp4)"/i);
    const videoUrl = (ogVideoMatch && ogVideoMatch[2]) || (videoTagMatch && videoTagMatch[1]) || null;

    const ogMatch = html.match(/property="og:image"\s+content="([^"]+)"/i) || html.match(/content="([^"]+)"\s+property="og:image"/i);
    const thumbnail = ogMatch && ogMatch[1] ? ogMatch[1] : null;

    if (videoUrl) {
      return { type: 'video', videoUrl, thumbnail };
    }
    if (thumbnail) {
      return { type: 'image', thumbnail };
    }
  } catch (e) {
    // ignore
  }
  return null;
}

/**
 * Fallback extractor for Pinterest pins using python pinterest_downloader.
 */
export async function extractPinterestWithPython(url) {
  return new Promise((resolve) => {
    const pyScript = `
import json, sys, urllib.request
try:
    from pinterest_downloader import Pinterest
    p = Pinterest()
    res = p.get_pin(sys.argv[1])
    if res.get('ok'):
        pin = res.get('pin', {})
        media = res.get('media', {})
        v_url = None
        dur = None
        formats = media.get('video_formats') or (pin.get('video', {}).get('formats') if pin.get('video') else None) or []
        
        # 1. Prefer direct MP4 format if already listed
        for f in formats:
            u = f.get('url') or ''
            if '.mp4' in u and not v_url:
                v_url = u
                dur = (f.get('duration') or 0) / 1000
                break

        # 2. Grab first format if no mp4 yet
        if not v_url and len(formats) > 0:
            v_url = formats[0].get('url')
            dur = (formats[0].get('duration') or 0) / 1000

        # 3. If HLS m3u8 on pinimg.com, resolve direct full-length MP4/CMAF single file
        if v_url and '.m3u8' in v_url and 'pinimg.com' in v_url:
            exp_mp4 = v_url.replace('/videos/iht/hls/', '/videos/iht/expMp4/').replace('.m3u8', '_720w.mp4')
            cmfv_url = v_url.replace('.m3u8', '_720w.cmfv')
            for candidate in [exp_mp4, cmfv_url]:
                try:
                    head_req = urllib.request.Request(candidate, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}, method='HEAD')
                    with urllib.request.urlopen(head_req, timeout=0.6) as r:
                        if r.status == 200:
                            v_url = candidate
                            break
                except Exception:
                    pass

        print(json.dumps({
            'title': pin.get('title') or pin.get('grid_title') or 'Pinterest Pin',
            'thumbnail': media.get('poster') or media.get('url') or (pin.get('images', {}).get('orig', {}).get('url')),
            'videoUrl': v_url,
            'duration': round(dur, 2) if dur and dur > 0 else None,
            'type': 'video' if v_url else 'image'
        }))
    else:
        print(json.dumps({'error': res.get('error', {}).get('message')}))
except Exception as e:
    print(json.dumps({'error': str(e)}))
`;
    const proc = spawn('python', ['-c', pyScript, url]);
    let out = '';
    proc.stdout.on('data', d => { out += d.toString(); });
    proc.on('close', () => {
      try {
        const data = JSON.parse(out.trim());
        if (data && !data.error && (data.videoUrl || data.thumbnail)) {
          resolve(data);
          return;
        }
      } catch (e) {}
      resolve(null);
    });
    proc.on('error', () => resolve(null));
  });
}

/**
 * Universal OpenGraph and page media extractor for any web link, article, or photo page.
 */
export async function extractOpenGraphDirect(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/*,*/*;q=0.8'
      },
      redirect: 'follow'
    });
    clearTimeout(timeout);
    if (!res.ok) return null;

    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    if (contentType.startsWith('image/')) {
      return {
        title: 'Direct Image',
        thumbnail: url,
        videoUrl: null,
        type: 'image',
        platform: detectPlatform(url)
      };
    }
    if (contentType.startsWith('video/')) {
      return {
        title: 'Direct Video',
        thumbnail: url,
        videoUrl: url,
        type: 'video',
        duration: 5,
        platform: detectPlatform(url)
      };
    }

    const html = await res.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Web Media';

    const ogVideoMatch = html.match(/property="og:video(?::secure_url)?"\s+content="([^"]+)"/i) || html.match(/content="([^"]+)"\s+property="og:video(?::secure_url)?"/i);
    const ogImgMatch = html.match(/property="og:image(?::secure_url)?"\s+content="([^"]+)"/i) || html.match(/content="([^"]+)"\s+property="og:image(?::secure_url)?"/i) || html.match(/name="twitter:image"\s+content="([^"]+)"/i);

    const videoUrl = ogVideoMatch ? ogVideoMatch[1] : null;
    const thumbnail = ogImgMatch ? ogImgMatch[1] : videoUrl;

    if (videoUrl) {
      return {
        title,
        thumbnail,
        videoUrl,
        type: 'video',
        duration: 5,
        platform: detectPlatform(url)
      };
    }
    if (thumbnail) {
      return {
        title,
        thumbnail,
        videoUrl: null,
        type: 'image',
        platform: detectPlatform(url)
      };
    }
  } catch (e) {
    // ignore
  }
  return null;
}

/**
 * Fast inspection of URL to preview thumbnail, title, and media type before converting.
 */
export async function inspectMedia(rawUrl) {
  const url = cleanUrlInput(rawUrl);
  const platform = detectPlatform(url);

  // 1. Direct media URL (MP4, GIF, WebM, MOV, JPG, PNG, WebP)
  if (isDirectMediaUrl(url)) {
    const isGif = /\.gif($|\?)/i.test(url);
    const isVid = /\.(mp4|webm|mov|m3u8|gifv)($|\?)/i.test(url);
    return {
      title: isGif ? 'Animated GIF' : (isVid ? 'Video' : 'Photo / Image'),
      thumbnail: url,
      videoUrl: (isVid || isGif) ? url : null,
      type: isGif ? 'gif' : (isVid ? 'video' : 'image'),
      isGif,
      duration: isVid ? null : (isGif ? 3.0 : null),
      platform
    };
  }

  // Fast HEAD check for direct image / video CDNs without explicit file extensions
  if (platform.id === 'web' || platform.id === 'direct') {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const headResp = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      clearTimeout(timeout);
      const ct = (headResp.headers.get('content-type') || '').toLowerCase();
      if (ct.startsWith('image/gif')) {
        return {
          title: 'Animated GIF',
          thumbnail: url,
          videoUrl: url,
          type: 'gif',
          isGif: true,
          duration: 3.0,
          platform
        };
      }
      if (ct.startsWith('image/')) {
        return {
          title: 'Direct Image',
          thumbnail: url,
          videoUrl: null,
          type: 'image',
          platform
        };
      }
      if (ct.startsWith('video/')) {
        return {
          title: 'Video',
          thumbnail: url,
          videoUrl: url,
          type: 'video',
          duration: null,
          platform
        };
      }
    } catch (e) {
      // ignore
    }
  }

  // 2. Fast Giphy extractor (instant HEAD check, returns under 250ms)
  if (platform.id === 'giphy') {
    const giphyData = await extractGiphyDirect(url);
    if (giphyData) return giphyData;
  }

  // 3. Fast Tenor extractor (OpenGraph tags, returns under 350ms)
  if (platform.id === 'tenor') {
    const tenorData = await extractTenorDirect(url);
    if (tenorData) return tenorData;
  }

  // 4. Fast & watermark-free TikTok extractor
  if (platform.id === 'tiktok') {
    const tiktokData = await extractTikTokDirect(url);
    if (tiktokData) return tiktokData;
  }

  // 5. Fast Instagram extractor
  if (platform.id === 'instagram') {
    const igData = await extractInstagramDirect(url);
    if (igData) return igData;
  }

  // 6. Fast X / Twitter extractor
  if (platform.id === 'twitter') {
    const twitterData = await extractTwitterDirect(url);
    if (twitterData) return twitterData;
  }

  // 7. Fast Pinterest extractor (instant HTML regex first, Python fallback)
  if (platform.id === 'pinterest') {
    const directPin = await extractPinterestDirect(url);
    if (directPin) {
      return {
        title: 'Pinterest ' + (directPin.type === 'video' ? 'Video Pin' : 'Image Pin'),
        thumbnail: directPin.thumbnail,
        videoUrl: directPin.videoUrl || null,
        type: directPin.type,
        duration: directPin.type === 'video' ? 5 : null,
        platform
      };
    }
    const pinData = await extractPinterestWithPython(url);
    if (pinData) {
      return {
        title: pinData.title || 'Pinterest Pin',
        thumbnail: pinData.thumbnail,
        videoUrl: pinData.videoUrl || null,
        type: pinData.type || (pinData.videoUrl ? 'video' : 'image'),
        duration: pinData.duration || null,
        platform,
        fallbackUrl: pinData.videoUrl || pinData.thumbnail
      };
    }
  }

  // 8. Universal OpenGraph tag extractor (Instant 250ms check before heavy yt-dlp)
  const ogData = await extractOpenGraphDirect(url);
  if (ogData && (ogData.videoUrl || ogData.thumbnail)) {
    return ogData;
  }

  // 9. Execute yt-dlp metadata dump as fallback for YouTube, Facebook, Reddit, etc.
  return new Promise((resolve, reject) => {
    const proc = spawn('python', ['-m', 'yt_dlp', '--js-runtimes', 'node', '--dump-single-json', '--no-warnings', '--no-playlist', url]);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    proc.on('close', async (code) => {
      if (code === 0 && stdout.trim()) {
        try {
          const info = JSON.parse(stdout);
          const ext = (info.ext || '').toLowerCase();
          const isDirectImgExt = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'svg', 'heic'].includes(ext) ||
            /\.(jpg|jpeg|png|webp|bmp)($|\?)/i.test(info.url || '');

          const hasRealVideoFormat = Array.isArray(info.formats) && info.formats.some(f =>
            f.vcodec && f.vcodec !== 'none' && f.vcodec !== 'unknown' &&
            f.url && !/\.(jpg|jpeg|png|webp)($|\?)/i.test(f.url)
          );

          const isVideo = !isDirectImgExt && (
            hasRealVideoFormat ||
            ['mp4', 'webm', 'mov', 'm3u8', 'flv', 'mkv'].includes(ext) ||
            /\.(mp4|webm|mov|m3u8)($|\?)/i.test(info.url || '') ||
            (Boolean(info.is_video) && Boolean(info.duration && info.duration > 0))
          );
          
          let videoUrl = null;
          let thumb = info.thumbnail || (info.thumbnails && info.thumbnails[0]?.url) || null;
          if (isVideo) {
            if (info.url && typeof info.url === 'string') {
              videoUrl = info.url;
            } else if (Array.isArray(info.formats)) {
              // Prefer h264 progressive formats for maximum browser playback compatibility
              const h264Progressive = info.formats.filter(f => f.url && f.vcodec && (f.vcodec.startsWith('avc') || f.vcodec.startsWith('h264')) && f.acodec && f.acodec !== 'none');
              if (h264Progressive.length > 0) {
                videoUrl = h264Progressive[h264Progressive.length - 1].url;
              } else {
                const progressive = info.formats.filter(f => f.url && f.vcodec && f.vcodec !== 'none' && f.acodec && f.acodec !== 'none');
                if (progressive.length > 0) {
                  videoUrl = progressive[progressive.length - 1].url;
                } else {
                  const anyVideo = info.formats.filter(f => f.url && f.vcodec && f.vcodec !== 'none');
                  if (anyVideo.length > 0) {
                    videoUrl = anyVideo[anyVideo.length - 1].url;
                  } else if (info.formats.length > 0) {
                    videoUrl = info.formats[info.formats.length - 1]?.url || null;
                  }
                }
              }
            }
          } else {
            thumb = info.url || thumb || url;
          }

          resolve({
            title: info.title || 'Extracted Media',
            thumbnail: thumb,
            videoUrl: isVideo ? videoUrl : null,
            type: isVideo ? 'video' : 'image',
            duration: isVideo ? (info.duration || 5) : null,
            platform
          });
          return;
        } catch (err) {
          // parse failed
        }
      }

      // 9. If yt-dlp failed, check Pinterest direct fallback
      if (platform.id === 'pinterest') {
        const pinData = await extractPinterestWithPython(url);
        if (pinData) {
          resolve({
            title: pinData.title || 'Pinterest Pin',
            thumbnail: pinData.thumbnail,
            videoUrl: pinData.videoUrl || null,
            type: pinData.type || (pinData.videoUrl ? 'video' : 'image'),
            duration: pinData.videoUrl ? 5 : null,
            platform,
            fallbackUrl: pinData.videoUrl || pinData.thumbnail
          });
          return;
        }
      }

      // 10. Universal OpenGraph fallback (works for any web page, article, Facebook post, or Reddit post)
      const ogData = await extractOpenGraphDirect(url);
      if (ogData) {
        resolve(ogData);
        return;
      }

      reject(new Error(stderr.slice(-300) || 'Unable to extract media from this URL. Please verify the link.'));
    });

    proc.on('error', (err) => reject(err));
  });
}

/**
 * Downloads the media from URL into destination directory.
 * Returns the downloaded local file path.
 */
export async function downloadMedia(rawUrl, tempDir, filePrefix) {
  const url = cleanUrlInput(rawUrl);
  const platform = detectPlatform(url);

  // 1. Direct media download
  if (isDirectMediaUrl(url)) {
    const ext = url.split('.').pop().split(/[?#]/)[0].toLowerCase() || 'mp4';
    const outPath = path.join(tempDir, `${filePrefix}_input.${ext}`);
    await downloadDirectMedia(url, outPath);
    return outPath;
  }

  // 2. Fast Giphy direct download
  if (platform.id === 'giphy') {
    const giphyData = await extractGiphyDirect(url);
    if (giphyData && giphyData.videoUrl) {
      const outPath = path.join(tempDir, `${filePrefix}_input.mp4`);
      await downloadDirectMedia(giphyData.videoUrl, outPath);
      return outPath;
    }
  }

  // 3. Fast Tenor direct download
  if (platform.id === 'tenor') {
    const tenorData = await extractTenorDirect(url);
    if (tenorData && tenorData.videoUrl) {
      const outPath = path.join(tempDir, `${filePrefix}_input.mp4`);
      await downloadDirectMedia(tenorData.videoUrl, outPath);
      return outPath;
    }
  }

  // 4. Fast & watermark-free TikTok download
  if (platform.id === 'tiktok') {
    const tiktokData = await extractTikTokDirect(url);
    if (tiktokData) {
      if (tiktokData.videoUrl) {
        const outPath = path.join(tempDir, `${filePrefix}_input.mp4`);
        await downloadDirectMedia(tiktokData.videoUrl, outPath);
        return outPath;
      } else if (tiktokData.thumbnail) {
        const outPath = path.join(tempDir, `${filePrefix}_input.jpg`);
        await downloadDirectMedia(tiktokData.thumbnail, outPath);
        return outPath;
      }
    }
  }

  // 5. Fast Instagram download
  if (platform.id === 'instagram') {
    const igData = await extractInstagramDirect(url);
    if (igData) {
      if (igData.videoUrl) {
        const outPath = path.join(tempDir, `${filePrefix}_input.mp4`);
        await downloadDirectMedia(igData.videoUrl, outPath);
        return outPath;
      } else if (igData.thumbnail) {
        const outPath = path.join(tempDir, `${filePrefix}_input.jpg`);
        await downloadDirectMedia(igData.thumbnail, outPath);
        return outPath;
      }
    }
  }

  // 6. Fast X / Twitter download
  if (platform.id === 'twitter') {
    const twitterData = await extractTwitterDirect(url);
    if (twitterData) {
      if (twitterData.videoUrl) {
        const outPath = path.join(tempDir, `${filePrefix}_input.mp4`);
        await downloadDirectMedia(twitterData.videoUrl, outPath);
        return outPath;
      } else if (twitterData.thumbnail) {
        const outPath = path.join(tempDir, `${filePrefix}_input.jpg`);
        await downloadDirectMedia(twitterData.thumbnail, outPath);
        return outPath;
      }
    }
  }

  // 7. Pinterest download
  if (platform.id === 'pinterest') {
    const directPin = await extractPinterestDirect(url);
    if (directPin) {
      if (directPin.videoUrl) {
        const outPath = path.join(tempDir, `${filePrefix}_input.mp4`);
        await downloadDirectMedia(directPin.videoUrl, outPath);
        return outPath;
      } else if (directPin.thumbnail) {
        const outPath = path.join(tempDir, `${filePrefix}_input.jpg`);
        await downloadDirectMedia(directPin.thumbnail, outPath);
        return outPath;
      }
    }
    const pinData = await extractPinterestWithPython(url);
    if (pinData) {
      if (pinData.videoUrl) {
        const outPath = path.join(tempDir, `${filePrefix}_input.mp4`);
        let downloadUrl = pinData.videoUrl;
        if (downloadUrl.includes('pinimg.com') && downloadUrl.includes('.m3u8')) {
          downloadUrl = downloadUrl.replace('/videos/iht/hls/', '/videos/iht/expMp4/').replace(/\.m3u8($|\?)/, '_720w.mp4$1');
        }
        if (downloadUrl.includes('.m3u8')) {
          await new Promise((res, rej) => {
            const ffmpeg = spawn('ffmpeg', ['-y', '-i', downloadUrl, '-c', 'copy', '-movflags', 'faststart', outPath]);
            ffmpeg.on('close', code => code === 0 ? res(outPath) : rej(new Error('Pinterest video download failed')));
            ffmpeg.on('error', rej);
          });
          return outPath;
        } else {
          await downloadDirectMedia(downloadUrl, outPath);
          return outPath;
        }
      } else if (pinData.thumbnail) {
        const outPath = path.join(tempDir, `${filePrefix}_input.jpg`);
        await downloadDirectMedia(pinData.thumbnail, outPath);
        return outPath;
      }
    }
  }

  // 8. Fast OpenGraph media direct download before yt-dlp
  const ogData = await extractOpenGraphDirect(url);
  if (ogData) {
    if (ogData.videoUrl) {
      const outPath = path.join(tempDir, `${filePrefix}_input.mp4`);
      await downloadDirectMedia(ogData.videoUrl, outPath);
      return outPath;
    } else if (ogData.thumbnail) {
      const outPath = path.join(tempDir, `${filePrefix}_input.jpg`);
      await downloadDirectMedia(ogData.thumbnail, outPath);
      return outPath;
    }
  }

  // 9. yt-dlp download with fast format selection (720p or lower is ideal for 512x512 stickers)
  try {
    const outTemplate = path.join(tempDir, `${filePrefix}_input.%(ext)s`);
    const args = [
      '-m', 'yt_dlp',
      '--js-runtimes', 'node',
      '--no-playlist',
      '--no-warnings',
      '-f', 'b[height<=720]/bestvideo[height<=720]/best[height<=720]/best',
      '-o', outTemplate,
      url
    ];

    await new Promise((resolve, reject) => {
      const proc = spawn('python', args);
      let stderr = '';
      proc.stderr.on('data', (d) => { stderr += d.toString(); });
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(stderr.slice(-300) || 'yt-dlp download failed'));
      });
      proc.on('error', (err) => reject(err));
    });

    const files = fs.readdirSync(tempDir);
    const match = files.find(f => f.startsWith(`${filePrefix}_input.`));
    if (match) {
      return path.join(tempDir, match);
    }
  } catch (err) {
    // 9. If yt-dlp download failed, try OpenGraph media download fallback
    const ogData = await extractOpenGraphDirect(url);
    if (ogData) {
      const targetUrl = ogData.videoUrl || ogData.thumbnail;
      if (targetUrl) {
        const isVid = Boolean(ogData.videoUrl);
        const ext = isVid ? 'mp4' : 'jpg';
        const outPath = path.join(tempDir, `${filePrefix}_input.${ext}`);
        await downloadDirectMedia(targetUrl, outPath);
        return outPath;
      }
    }
    throw err;
  }

  throw new Error('No media file could be downloaded.');
}
