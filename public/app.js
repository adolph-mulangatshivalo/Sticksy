// SVG Icon Library matching the Neo-Brutalist aesthetic
const ICONS = {
  tiktok: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3 15.67 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.34-6.33V9.05c1.3.93 2.88 1.48 4.59 1.54V7.14a4.85 4.85 0 0 1-.68-.45z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
  pinterest: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.332 1.357-.053.225-.174.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.537.535 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
  direct: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
  upload: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`,
  web: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path></svg>`
};

// Global App State
let currentMediaData = null;
let currentStickerData = null;
let activeVideoCrop = 'fit';
let activeCropRatio = 'free'; // 'free' = Freeform Crop (unconstrained), '1' = 1:1 Square
let cropperInstance = null;
let selectedFile = null;

// DOM Elements
const tabLink = document.getElementById('tabLink');
const tabUpload = document.getElementById('tabUpload');
const panelLink = document.getElementById('panelLink');
const panelUpload = document.getElementById('panelUpload');
const mediaUrl = document.getElementById('mediaUrl');
const btnPaste = document.getElementById('btnPaste');
const btnInspect = document.getElementById('btnInspect');
const inspectSpinner = document.getElementById('inspectSpinner');
const alertBox = document.getElementById('alertBox');

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

// Preview Card Elements
const previewCard = document.getElementById('previewCard');
const previewSkeleton = document.getElementById('previewSkeleton');
const mediaBadge = document.getElementById('mediaBadge');
const badgeIcon = document.getElementById('badgeIcon');
const badgeText = document.getElementById('badgeText');
const mediaTitle = document.getElementById('mediaTitle');

// Image Cropper Elements
const imageCropContainer = document.getElementById('imageCropContainer');
const cropperImage = document.getElementById('cropperImage');
const btnRatioFree = document.getElementById('btnRatioFree');
const btnRatioSquare = document.getElementById('btnRatioSquare');
const btnRotateLeft = document.getElementById('btnRotateLeft');
const btnResetCrop = document.getElementById('btnResetCrop');
const cropHintText = document.getElementById('cropHintText');

// Video Cropper & Trimmer Elements
const videoTrimContainer = document.getElementById('videoTrimContainer');
const videoPreviewFrame = document.getElementById('videoPreviewFrame');
const previewVideo = document.getElementById('previewVideo');
const videoLoadingOverlay = document.getElementById('videoLoadingOverlay');
const videoCropOverlay = document.getElementById('videoCropOverlay');
const videoCropBox = document.getElementById('videoCropBox');
const vShadeTop = document.getElementById('vShadeTop');
const vShadeBottom = document.getElementById('vShadeBottom');
const vShadeLeft = document.getElementById('vShadeLeft');
const vShadeRight = document.getElementById('vShadeRight');

let videoBufferTimer = null;
function showVideoLoader() {
  if (videoLoadingOverlay) videoLoadingOverlay.classList.remove('hidden');
}
function hideVideoLoader() {
  if (videoBufferTimer) {
    clearTimeout(videoBufferTimer);
    videoBufferTimer = null;
  }
  if (videoLoadingOverlay) videoLoadingOverlay.classList.add('hidden');
}

const btnVideoRatioFree = document.getElementById('btnVideoRatioFree');
const btnVideoRatioSquare = document.getElementById('btnVideoRatioSquare');
const btnVideoPlayPause = document.getElementById('btnVideoPlayPause');
const icPlayPause = document.getElementById('icPlayPause');
const txtPlayPause = document.getElementById('txtPlayPause');
const btnVideoResetCrop = document.getElementById('btnVideoResetCrop');
const videoCropHintText = document.getElementById('videoCropHintText');

// Visual Timeline Scrubber Elements
const timelineTrack = document.getElementById('timelineTrack');
const timelineFilmstrip = document.getElementById('timelineFilmstrip');
const timelineDimStart = document.getElementById('timelineDimStart');
const timelineDimEnd = document.getElementById('timelineDimEnd');
const timelineSelection = document.getElementById('timelineSelection');
const timelinePlayhead = document.getElementById('timelinePlayhead');
const timelineTimeStart = document.getElementById('timelineTimeStart');
const timelineTimeEnd = document.getElementById('timelineTimeEnd');
const timelineCurrentTime = document.getElementById('timelineCurrentTime');
const timelineGripStart = document.getElementById('timelineGripStart');
const timelineGripEnd = document.getElementById('timelineGripEnd');

const sliderStart = document.getElementById('sliderStart');
const sliderEnd = document.getElementById('sliderEnd');
const valStart = document.getElementById('valStart');
const valEnd = document.getElementById('valEnd');
const trimDurationBadge = document.getElementById('trimDurationBadge');

// Video Cropper State
let videoCropState = {
  box: { left: 0, top: 0, width: 0, height: 0 },
  ratio: 'free',
  activeHandle: null,
  startX: 0,
  startY: 0,
  startBox: null,
  isCustomCropped: false
};

// General Form Controls
const packName = document.getElementById('packName');
const btnConvert = document.getElementById('btnConvert');
const convertSpinner = document.getElementById('convertSpinner');
const progressTracker = document.getElementById('progressTracker');
const progressBar = document.getElementById('progressBar');
const progressStatus = document.getElementById('progressStatus');
const convertPercent = document.getElementById('convertPercent');

// Inspect Loading Elements (Shown while video/link is being fetched from platform)
const inspectLoadingWrap = document.getElementById('inspectLoadingWrap');
const inspectProgressBar = document.getElementById('inspectProgressBar');
const inspectProgressPercent = document.getElementById('inspectProgressPercent');
const inspectLoadingTitle = document.getElementById('inspectLoadingTitle');
const inspectLoadingSub = document.getElementById('inspectLoadingSub');

// Studio / Result Box 2 Elements (Strictly 2 boxes total: Link Box & Studio Box)
const studioEditorView = document.getElementById('studioEditorView');
const studioResultView = document.getElementById('studioResultView');
const studioHeaderTrimming = document.getElementById('studioHeaderTrimming');
const studioHeaderResult = document.getElementById('studioHeaderResult');
const resultCard = null;
const resultSkeleton = null;
const stickerSkeleton = document.getElementById('stickerSkeleton');
const resultStage = document.getElementById('resultStage');
const stickerSpecs = document.getElementById('stickerSpecs');
const resultStickerImg = document.getElementById('resultStickerImg');
const stickerCanvasContainer = document.getElementById('stickerCanvasContainer');
const holdCallout = document.getElementById('holdCallout');
const calloutText = document.getElementById('calloutText');
const btnOpenWhatsApp = document.getElementById('btnOpenWhatsApp');
const openWaBtnText = document.getElementById('openWaBtnText');
const btnCreateAnother = document.getElementById('btnCreateAnother');

// Tab Switching
tabLink.addEventListener('click', () => {
  tabLink.classList.add('active');
  tabUpload.classList.remove('active');
  panelLink.classList.add('active');
  panelUpload.classList.remove('active');
  if (selectedFile) {
    selectedFile = null;
    currentMediaData = null;
    previewCard.classList.add('hidden');
    if (fileInput) fileInput.value = '';
  }
});

tabUpload.addEventListener('click', () => {
  tabUpload.classList.add('active');
  tabLink.classList.remove('active');
  panelUpload.classList.add('active');
  panelLink.classList.remove('active');
  if (fileInput) fileInput.value = '';
});

// Paste from Clipboard
btnPaste.addEventListener('click', async () => {
  clearAlert();
  try {
    let text = '';
    if (navigator.clipboard && navigator.clipboard.readText) {
      text = await navigator.clipboard.readText();
    }
    text = (text || '').trim();
    if (text) {
      mediaUrl.value = text;
      inspectUrl(text);
    } else {
      mediaUrl.focus();
      showAlert('Clipboard is empty. Copy a link first!');
    }
  } catch (err) {
    mediaUrl.focus();
    showAlert('Tap inside the box and tap Paste.');
  }
});

// Enter key in input
mediaUrl.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    btnInspect.click();
  }
});

// Video Play / Pause Controls
if (btnVideoPlayPause) {
  btnVideoPlayPause.addEventListener('click', () => {
    if (!previewVideo) return;
    if (previewVideo.paused) {
      previewVideo.muted = true;
      previewVideo.play().catch(() => {});
    } else {
      previewVideo.pause();
    }
  });
}

if (previewVideo) {
  previewVideo.addEventListener('play', () => {
    if (txtPlayPause) txtPlayPause.textContent = 'Pause';
    if (icPlayPause) {
      icPlayPause.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
    }
  });
  previewVideo.addEventListener('pause', () => {
    if (txtPlayPause) txtPlayPause.textContent = 'Play';
    if (icPlayPause) {
      icPlayPause.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
    }
  });
}

// User gesture playback resume on mobile touch
document.addEventListener('pointerdown', () => {
  if (previewVideo && previewVideo.src && previewVideo.paused && !videoTrimContainer.classList.contains('hidden')) {
    previewVideo.muted = true;
    previewVideo.play().catch(() => { });
  }
}, { passive: true });

// Video Crop Ratio Buttons (Freeform vs 1:1 Square vs Reset)
if (btnVideoRatioFree) {
  btnVideoRatioFree.addEventListener('click', () => {
    videoCropState.ratio = 'free';
    videoCropState.isCustomCropped = false;
    btnVideoRatioFree.classList.add('active');
    btnVideoRatioSquare?.classList.remove('active');
    videoCropBox?.classList.remove('ratio-square');

    const rect = getVideoRenderedRect();
    if (rect) {
      videoCropState.box = { left: 0, top: 0, width: rect.width, height: rect.height };
      renderVideoCropBox();
    }

    if (videoCropHintText) {
      videoCropHintText.textContent = 'Freeform Video Crop active — covering whole media, drag handles to customize';
    }
  });
}

if (btnVideoRatioSquare) {
  btnVideoRatioSquare.addEventListener('click', () => {
    videoCropState.ratio = '1';
    videoCropState.isCustomCropped = true;
    btnVideoRatioSquare.classList.add('active');
    btnVideoRatioFree?.classList.remove('active');
    videoCropBox?.classList.add('ratio-square');
    
    const rect = getVideoRenderedRect();
    if (rect) {
      const side = Math.max(30, Math.round(Math.min(rect.width, rect.height) * 0.90));
      const left = Math.round((rect.width - side) / 2);
      const top = Math.round((rect.height - side) / 2);
      videoCropState.box = { left, top, width: side, height: side };
      renderVideoCropBox();
    }
    
    if (videoCropHintText) {
      videoCropHintText.textContent = '1:1 Square Video Crop active — locked square, drag yellow corners to resize';
    }
  });
}

if (btnVideoResetCrop) {
  btnVideoResetCrop.addEventListener('click', () => {
    videoCropState.ratio = 'free';
    videoCropState.isCustomCropped = false;
    btnVideoRatioFree?.classList.add('active');
    btnVideoRatioSquare?.classList.remove('active');
    videoCropBox?.classList.remove('ratio-square');
    const rect = getVideoRenderedRect();
    if (rect) {
      videoCropState.box = { left: 0, top: 0, width: rect.width, height: rect.height };
      renderVideoCropBox();
    }
    if (videoCropHintText) {
      videoCropHintText.textContent = 'Crop reset to cover whole media';
    }
  });
}

// Setup pointer drag interactions for the Video Crop Box
function setupVideoCropInteractions() {
  if (!videoCropBox) return;

  const onPointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const handle = e.target.closest('.v-handle');
    videoCropState.activeHandle = handle ? handle.dataset.handle : 'move';
    videoCropState.startX = e.clientX;
    videoCropState.startY = e.clientY;
    videoCropState.startBox = { ...videoCropState.box };

    try { e.target.setPointerCapture(e.pointerId); } catch (err) {}
  };

  const onPointerMove = (e) => {
    if (!videoCropState.activeHandle || !videoCropState.startBox) return;
    e.preventDefault();

    const dx = e.clientX - videoCropState.startX;
    const dy = e.clientY - videoCropState.startY;
    const sb = videoCropState.startBox;
    const overlayW = videoCropOverlay?.offsetWidth || 300;
    const overlayH = videoCropOverlay?.offsetHeight || 300;

    let { left, top, width, height } = sb;
    const isSquare = videoCropState.ratio === '1';

    // Strictly enforce 1:1 Square geometry when in Square Crop mode (never freeform!)
    if (isSquare) {
      if (videoCropState.activeHandle === 'move') {
        left = Math.max(0, Math.min(sb.left + dx, overlayW - sb.width));
        top = Math.max(0, Math.min(sb.top + dy, overlayH - sb.height));
        videoCropState.box = { left, top, width: sb.width, height: sb.height };
      } else if (videoCropState.activeHandle === 'se') {
        const delta = (dx + dy) / 2;
        const maxSide = Math.min(overlayW - sb.left, overlayH - sb.top);
        const side = Math.max(40, Math.min(sb.width + delta, maxSide));
        videoCropState.box = { left: sb.left, top: sb.top, width: side, height: side };
      } else if (videoCropState.activeHandle === 'sw') {
        const delta = (-dx + dy) / 2;
        const maxSide = Math.min(sb.left + sb.width, overlayH - sb.top);
        const side = Math.max(40, Math.min(sb.width + delta, maxSide));
        videoCropState.box = { left: sb.left + (sb.width - side), top: sb.top, width: side, height: side };
      } else if (videoCropState.activeHandle === 'ne') {
        const delta = (dx - dy) / 2;
        const maxSide = Math.min(overlayW - sb.left, sb.top + sb.height);
        const side = Math.max(40, Math.min(sb.width + delta, maxSide));
        videoCropState.box = { left: sb.left, top: sb.top + (sb.height - side), width: side, height: side };
      } else if (videoCropState.activeHandle === 'nw') {
        const delta = (-dx - dy) / 2;
        const maxSide = Math.min(sb.left + sb.width, sb.top + sb.height);
        const side = Math.max(40, Math.min(sb.width + delta, maxSide));
        videoCropState.box = { left: sb.left + (sb.width - side), top: sb.top + (sb.height - side), width: side, height: side };
      }
      renderVideoCropBox();
      return;
    }

    // Freeform mode allows arbitrary rectangle resizing
    switch (videoCropState.activeHandle) {
      case 'move':
        left = Math.max(0, Math.min(sb.left + dx, overlayW - sb.width));
        top = Math.max(0, Math.min(sb.top + dy, overlayH - sb.height));
        break;

      case 'se':
        width = Math.max(30, Math.min(sb.width + dx, overlayW - sb.left));
        height = Math.max(30, Math.min(sb.height + dy, overlayH - sb.top));
        break;

      case 'sw':
        const maxDxSw = sb.width - 30;
        const clampedDxSw = Math.max(-sb.left, Math.min(dx, maxDxSw));
        left = sb.left + clampedDxSw;
        width = sb.width - clampedDxSw;
        height = Math.max(30, Math.min(sb.height + dy, overlayH - sb.top));
        break;

      case 'ne':
        width = Math.max(30, Math.min(sb.width + dx, overlayW - sb.left));
        const maxDyNe = sb.height - 30;
        const clampedDyNe = Math.max(-sb.top, Math.min(dy, maxDyNe));
        top = sb.top + clampedDyNe;
        height = sb.height - clampedDyNe;
        break;

      case 'nw':
        const maxDxNw = sb.width - 30;
        const clampedDxNw = Math.max(-sb.left, Math.min(dx, maxDxNw));
        left = sb.left + clampedDxNw;
        width = sb.width - clampedDxNw;

        const maxDyNw = sb.height - 30;
        const clampedDyNw = Math.max(-sb.top, Math.min(dy, maxDyNw));
        top = sb.top + clampedDyNw;
        height = sb.height - clampedDyNw;
        break;

      case 'n':
        const clampedDyN = Math.max(-sb.top, Math.min(dy, sb.height - 30));
        top = sb.top + clampedDyN;
        height = sb.height - clampedDyN;
        break;

      case 's':
        height = Math.max(30, Math.min(sb.height + dy, overlayH - sb.top));
        break;

      case 'w':
        const clampedDxW = Math.max(-sb.left, Math.min(dx, sb.width - 30));
        left = sb.left + clampedDxW;
        width = sb.width - clampedDxW;
        break;

      case 'e':
        width = Math.max(30, Math.min(sb.width + dx, overlayW - sb.left));
        break;
    }

    videoCropState.box = { left, top, width, height };
    renderVideoCropBox();
  };

  const onPointerUp = (e) => {
    if (videoCropState.activeHandle) {
      videoCropState.isCustomCropped = true;
    }
    videoCropState.activeHandle = null;
    videoCropState.startBox = null;
    try { e.target.releasePointerCapture(e.pointerId); } catch (err) {}
  };

  videoCropBox.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
}
setupVideoCropInteractions();

// Calculate exact rendered sub-rectangle of video inside videoPreviewFrame
function getVideoRenderedRect() {
  if (!previewVideo || !videoPreviewFrame) return null;
  // Guard against uninitialized video dimensions (e.g. 0x0 or WebKit 300x150 fallback before metadata)
  if (!previewVideo.videoWidth || !previewVideo.videoHeight || previewVideo.videoWidth <= 0 || previewVideo.videoHeight <= 0) {
    return null;
  }

  const frameRect = videoPreviewFrame.getBoundingClientRect();
  const vidRect = previewVideo.getBoundingClientRect();

  if (vidRect.width <= 0 || vidRect.height <= 0) return null;

  // Account for frame's native CSS borders so coordinates match absolute positioning padding-box
  const borderLeft = videoPreviewFrame.clientLeft || 0;
  const borderTop = videoPreviewFrame.clientTop || 0;

  const left = Math.max(0, Math.round(vidRect.left - frameRect.left - borderLeft));
  const top = Math.max(0, Math.round(vidRect.top - frameRect.top - borderTop));
  const width = Math.round(vidRect.width);
  const height = Math.round(vidRect.height);

  return { left, top, width, height };
}

// Initialize video crop overlay and match dimensions exactly to rendered video
function initVideoCropOverlay() {
  if (!previewVideo || !videoCropOverlay || !videoCropBox || !videoPreviewFrame) return;

  const applySize = () => {
    const rect = getVideoRenderedRect();
    if (!rect || rect.width <= 10 || rect.height <= 10) {
      // Dimensions not ready yet: retry when metadata or frames are available
      const retryEvents = ['loadedmetadata', 'loadeddata', 'canplay', 'playing'];
      const onReady = () => {
        retryEvents.forEach(evt => previewVideo.removeEventListener(evt, onReady));
        initVideoCropOverlay();
      };
      retryEvents.forEach(evt => previewVideo.addEventListener(evt, onReady, { once: true }));
      return;
    }

    videoCropOverlay.style.width = `${rect.width}px`;
    videoCropOverlay.style.height = `${rect.height}px`;
    videoCropOverlay.style.left = `${rect.left}px`;
    videoCropOverlay.style.top = `${rect.top}px`;

    // CRITICAL: If the user has already set a custom crop on this video, PRESERVE it!
    // Never reset when the video loops or on time updates!
    if (videoCropState.isCustomCropped && videoCropState.box && videoCropState.box.width > 0) {
      renderVideoCropBox();
      return;
    }

    if (videoCropState.ratio === '1') {
      videoCropBox.classList.add('ratio-square');
      const side = Math.max(30, Math.round(Math.min(rect.width, rect.height) * 0.90));
      const left = Math.round((rect.width - side) / 2);
      const top = Math.round((rect.height - side) / 2);
      videoCropState.box = { left, top, width: side, height: side };
    } else {
      videoCropBox.classList.remove('ratio-square');
      // Freeform: default to flush coverage of 100% of the active rendered video
      videoCropState.box = { left: 0, top: 0, width: rect.width, height: rect.height };
    }
    renderVideoCropBox();
  };

  requestAnimationFrame(applySize);
}

window.addEventListener('resize', () => {
  if (previewVideo && !videoTrimContainer?.classList.contains('hidden')) {
    initVideoCropOverlay();
  }
});

function renderVideoCropBox() {
  if (!videoCropOverlay || !videoCropBox) return;
  const overlayW = videoCropOverlay.offsetWidth;
  const overlayH = videoCropOverlay.offsetHeight;
  if (!overlayW || !overlayH) return;
  
  let { left, top, width, height } = videoCropState.box;
  
  left = Math.max(0, Math.min(left, overlayW - 20));
  top = Math.max(0, Math.min(top, overlayH - 20));
  width = Math.max(20, Math.min(width, overlayW - left));
  height = Math.max(20, Math.min(height, overlayH - top));
  
  videoCropState.box = { left, top, width, height };
  
  videoCropBox.style.left = `${left}px`;
  videoCropBox.style.top = `${top}px`;
  videoCropBox.style.width = `${width}px`;
  videoCropBox.style.height = `${height}px`;

  // Update outer dark shades to highlight the active crop area
  if (vShadeTop) {
    vShadeTop.style.top = '0px';
    vShadeTop.style.left = '0px';
    vShadeTop.style.width = `${overlayW}px`;
    vShadeTop.style.height = `${Math.max(0, top)}px`;
  }
  if (vShadeBottom) {
    const bTop = top + height;
    vShadeBottom.style.top = `${bTop}px`;
    vShadeBottom.style.left = '0px';
    vShadeBottom.style.width = `${overlayW}px`;
    vShadeBottom.style.height = `${Math.max(0, overlayH - bTop)}px`;
  }
  if (vShadeLeft) {
    vShadeLeft.style.top = `${top}px`;
    vShadeLeft.style.left = '0px';
    vShadeLeft.style.width = `${Math.max(0, left)}px`;
    vShadeLeft.style.height = `${height}px`;
  }
  if (vShadeRight) {
    const rLeft = left + width;
    vShadeRight.style.top = `${top}px`;
    vShadeRight.style.left = `${rLeft}px`;
    vShadeRight.style.width = `${Math.max(0, overlayW - rLeft)}px`;
    vShadeRight.style.height = `${height}px`;
  }
}

// Convert video crop box coordinates to native video pixel coordinates for FFmpeg
function getVideoCropData() {
  if (!previewVideo || !videoCropState.box || !videoCropState.box.width) return null;
  const rect = getVideoRenderedRect();
  if (!rect || !rect.width || !rect.height) return null;

  const natW = previewVideo.videoWidth;
  const natH = previewVideo.videoHeight;
  if (!natW || !natH) return null;

  const { left, top, width, height } = videoCropState.box;

  // If freeform and covering ~100% without custom adjustments, return null to keep entire video without crop/zoom!
  if (!videoCropState.isCustomCropped && videoCropState.ratio === 'free') {
    return null;
  }
  if (videoCropState.ratio === 'free' && left <= 3 && top <= 3 && width >= rect.width - 6 && height >= rect.height - 6) {
    return null;
  }

  const scaleX = natW / rect.width;
  const scaleY = natH / rect.height;

  const cropX = Math.max(0, Math.min(natW - 10, Math.round(left * scaleX)));
  const cropY = Math.max(0, Math.min(natH - 10, Math.round(top * scaleY)));
  const cropW = Math.max(10, Math.min(natW - cropX, Math.round(width * scaleX)));
  const cropH = Math.max(10, Math.min(natH - cropY, Math.round(height * scaleY)));

  return {
    x: cropX,
    y: cropY,
    width: cropW,
    height: cropH
  };
}

// Ratio Toggle: Freeform vs Square 1:1
btnRatioFree.addEventListener('click', () => {
  activeCropRatio = 'free';
  btnRatioFree.classList.add('active');
  btnRatioSquare.classList.remove('active');
  if (cropperInstance) {
    cropperInstance.setAspectRatio(NaN); // NaN unlocks aspect ratio for freeform crop!
    const canvasData = cropperInstance.getCanvasData();
    cropperInstance.setCropBoxData({
      left: canvasData.left,
      top: canvasData.top,
      width: canvasData.width,
      height: canvasData.height
    });
    if (cropHintText) {
      cropHintText.textContent = 'Freeform Crop active — covering whole picture, drag corners to crop';
    }
  }
});

btnRatioSquare.addEventListener('click', () => {
  activeCropRatio = '1';
  btnRatioSquare.classList.add('active');
  btnRatioFree.classList.remove('active');
  if (cropperInstance) {
    cropperInstance.setAspectRatio(1); // 1:1 square
    const canvasData = cropperInstance.getCanvasData();
    const side = Math.max(50, Math.round(Math.min(canvasData.width, canvasData.height) * 0.60));
    cropperInstance.setCropBoxData({
      left: canvasData.left + (canvasData.width - side) / 2,
      top: canvasData.top + (canvasData.height - side) / 2,
      width: side,
      height: side
    });
  }
  if (cropHintText) {
    cropHintText.textContent = '1:1 Square Crop active — locked square, WhatsApp standard';
  }
});

// Rotate & Reset Cropper Tools
btnRotateLeft.addEventListener('click', () => {
  if (cropperInstance) cropperInstance.rotate(90);
});

btnResetCrop.addEventListener('click', () => {
  if (cropperInstance) {
    cropperInstance.reset();
    if (activeCropRatio === 'free') {
      cropperInstance.setAspectRatio(NaN);
      const canvasData = cropperInstance.getCanvasData();
      cropperInstance.setCropBoxData({
        left: canvasData.left,
        top: canvasData.top,
        width: canvasData.width,
        height: canvasData.height
      });
    } else {
      cropperInstance.setAspectRatio(1);
    }
  }
});

// Inspect / Stick It Action
btnInspect.addEventListener('click', () => {
  const url = mediaUrl.value.trim();
  if (!url) {
    showAlert('Please paste a valid link first!');
    return;
  }
  inspectUrl(url);
});

let inspectProgressTimer = null;
let currentInspectCount = 0;

function startInspectProgress(url) {
  if (!inspectLoadingWrap) return;
  inspectLoadingWrap.classList.remove('hidden');

  let platformName = 'Platform';
  if (/tiktok\.com/i.test(url)) platformName = 'TikTok';
  else if (/pinterest\./i.test(url) || /pin\.it/i.test(url)) platformName = 'Pinterest';
  else if (/instagram\.com/i.test(url)) platformName = 'Instagram';
  else if (/facebook\.com|fb\.watch/i.test(url)) platformName = 'Facebook';

  // Dynamic media noun (Image vs Video vs GIF)
  const isDirectImg = /\.(jpg|jpeg|png|webp|avif|bmp|svg)($|\?)/i.test(url) || url.includes('/images/') || url.includes('pbs.twimg.com/media');
  const isDirectGif = /\.gif($|\?)/i.test(url) || url.includes('giphy.com') || url.includes('tenor.com');
  const isDirectVid = /\.(mp4|webm|mov|m3u8|gifv)($|\?)/i.test(url) || url.includes('/video/') || url.includes('/reel/') || url.includes('tiktok.com');
  const mediaNoun = isDirectImg ? 'image' : (isDirectGif ? 'GIF' : (isDirectVid ? 'video' : 'media'));

  currentInspectCount = 5;
  if (inspectProgressBar) inspectProgressBar.style.width = '5%';
  if (inspectProgressPercent) inspectProgressPercent.textContent = '5%';
  if (inspectLoadingTitle) inspectLoadingTitle.textContent = `Connecting to ${platformName}...`;
  if (inspectLoadingSub) inspectLoadingSub.textContent = `Resolving ${mediaNoun} stream and source`;

  if (inspectProgressTimer) clearInterval(inspectProgressTimer);

  const inspectStartTime = Date.now();
  // Smooth live numerical counter and visible filling progress bar
  inspectProgressTimer = setInterval(() => {
    const elapsed = (Date.now() - inspectStartTime) / 1000;
    let target = 5;

    if (elapsed < 1.5) {
      target = 5 + (elapsed / 1.5) * 40; // 5% -> 45%
      if (inspectLoadingTitle) inspectLoadingTitle.textContent = `Connecting to ${platformName}...`;
      if (inspectLoadingSub) inspectLoadingSub.textContent = `Contacting server and resolving direct ${mediaNoun}`;
    } else if (elapsed < 3.5) {
      target = 45 + ((elapsed - 1.5) / 2.0) * 32; // 45% -> 77%
      if (inspectLoadingTitle) inspectLoadingTitle.textContent = `Fetching ${mediaNoun} from ${platformName}...`;
      if (inspectLoadingSub) inspectLoadingSub.textContent = `Downloading full resolution ${mediaNoun} source`;
    } else if (elapsed < 6.5) {
      target = 77 + ((elapsed - 3.5) / 3.0) * 16; // 77% -> 93%
      if (inspectLoadingTitle) inspectLoadingTitle.textContent = `Inspecting ${mediaNoun} dimensions...`;
      if (inspectLoadingSub) inspectLoadingSub.textContent = `Analyzing aspect ratio and resolution specs`;
    } else {
      target = Math.min(97, 93 + ((elapsed - 6.5) / 8.0) * 4); // 93% -> 97%
      if (inspectLoadingTitle) inspectLoadingTitle.textContent = `Preparing ${mediaNoun} studio cropper...`;
      if (inspectLoadingSub) inspectLoadingSub.textContent = 'Almost ready to crop and style!';
    }

    currentInspectCount += Math.max(0.5, (target - currentInspectCount) * 0.35);
    const displayVal = Math.min(98, Math.max(5, Math.round(currentInspectCount)));

    if (inspectProgressBar) inspectProgressBar.style.width = `${displayVal}%`;
    if (inspectProgressPercent) inspectProgressPercent.textContent = `${displayVal}%`;
  }, 40);
}

function finishInspectProgress() {
  if (inspectProgressTimer) {
    clearInterval(inspectProgressTimer);
    inspectProgressTimer = null;
  }

  // Rapidly count up to 100%
  let tick = Math.max(currentInspectCount, 92);
  const finishInterval = setInterval(() => {
    tick += 2;
    if (tick >= 100) {
      tick = 100;
      clearInterval(finishInterval);
      if (inspectProgressBar) inspectProgressBar.style.width = '100%';
      if (inspectProgressPercent) inspectProgressPercent.textContent = '100%';
      if (inspectLoadingTitle) inspectLoadingTitle.textContent = 'Video fetched successfully!';
      if (inspectLoadingSub) inspectLoadingSub.textContent = 'Ready to crop and customize';

      setTimeout(() => {
        if (inspectLoadingWrap) inspectLoadingWrap.classList.add('hidden');
        if (inspectProgressBar) inspectProgressBar.style.width = '0%';
        if (inspectProgressPercent) inspectProgressPercent.textContent = '0%';
      }, 400);
    } else {
      if (inspectProgressBar) inspectProgressBar.style.width = `${tick}%`;
      if (inspectProgressPercent) inspectProgressPercent.textContent = `${tick}%`;
    }
  }, 15);
}

function resetInspectProgress() {
  if (inspectProgressTimer) {
    clearInterval(inspectProgressTimer);
    inspectProgressTimer = null;
  }
  if (inspectLoadingWrap) inspectLoadingWrap.classList.add('hidden');
  if (inspectProgressBar) inspectProgressBar.style.width = '0%';
  if (inspectProgressPercent) inspectProgressPercent.textContent = '0%';
}

async function inspectUrl(url) {
  clearAlert();
  setInspectLoading(true);
  startInspectProgress(url);

  // Immediately reveal previewCard with skeleton while fetch is resolving
  previewCard.classList.remove('hidden');
  if (previewSkeleton) previewSkeleton.classList.remove('hidden');
  imageCropContainer.classList.add('hidden');
  videoTrimContainer.classList.add('hidden');
  if (studioResultView) studioResultView.classList.add('hidden');
  if (studioEditorView) studioEditorView.classList.remove('hidden');
  if (studioHeaderResult) studioHeaderResult.classList.add('hidden');
  if (studioHeaderTrimming) studioHeaderTrimming.classList.remove('hidden');
  const isImgUrl = /\.(jpg|jpeg|png|webp|avif|bmp|svg)($|\?)/i.test(url) || url.includes('/images/') || url.includes('pbs.twimg.com/media');
  const isVidUrl = /\.(mp4|webm|mov|m3u8|gifv)($|\?)/i.test(url) || url.includes('/video/') || url.includes('/reel/') || url.includes('tiktok.com');
  mediaTitle.textContent = isImgUrl ? 'Extracting image...' : (isVidUrl ? 'Extracting video...' : 'Extracting media...');

  try {
    const res = await fetch('/api/inspect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to inspect link.');
    }

    finishInspectProgress();
    currentMediaData = { ...data, sourceUrl: url };
    displayPreview(currentMediaData);
  } catch (err) {
    resetInspectProgress();
    if (previewSkeleton) previewSkeleton.classList.add('hidden');
    previewCard.classList.add('hidden');
    showAlert(err.message);
  } finally {
    setInspectLoading(false);
  }
}

// File Drag & Drop / Selection
dropZone.addEventListener('click', (e) => {
  if (e.target !== fileInput) {
    fileInput.click();
  }
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files && e.target.files[0]) {
    handleFileUpload(e.target.files[0]);
  }
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    handleFileUpload(e.dataTransfer.files[0]);
  }
});

function handleFileUpload(file) {
  if (!file) return;
  selectedFile = file;
  const ext = (file.name || '').split('.').pop().toLowerCase();
  const isGif = file.type === 'image/gif' || ext === 'gif';
  const isVideo = (!isGif) && (file.type.startsWith('video/') || ['mp4', 'mov', 'webm', 'mkv', 'avi', 'm4v', '3gp'].includes(ext));
  const previewUrl = URL.createObjectURL(file);

  currentMediaData = {
    title: file.name || 'Uploaded Media',
    thumbnail: previewUrl,
    videoUrl: isVideo ? previewUrl : null,
    type: isVideo ? 'video' : (isGif ? 'gif' : 'image'),
    duration: isVideo ? 5 : (isGif ? 3 : null),
    platform: { id: 'upload', name: 'File' },
    previewBlobUrl: previewUrl,
    isFileUpload: true
  };

  displayPreview(currentMediaData);
}

// Display Preview, Cropper, and Trimmer
function displayPreview(info) {
  clearAlert();
  if (studioEditorView) studioEditorView.classList.remove('hidden');
  if (studioResultView) studioResultView.classList.add('hidden');
  if (studioHeaderTrimming) studioHeaderTrimming.classList.remove('hidden');
  if (studioHeaderResult) studioHeaderResult.classList.add('hidden');

  const platformId = info.platform?.id || 'web';
  badgeIcon.innerHTML = ICONS[platformId] || ICONS.web;
  badgeText.textContent = info.platform?.name || 'Media';
  mediaTitle.textContent = info.title || 'Extracted Media';

  // Destroy previous cropper instance if active
  if (cropperInstance) {
    cropperInstance.destroy();
    cropperInstance = null;
  }

  if (info.type === 'video') {
    // 1. SETUP VIDEO TRIMMER
    imageCropContainer.classList.add('hidden');
    if (previewSkeleton) previewSkeleton.classList.remove('hidden');
    videoTrimContainer.classList.add('hidden');
    previewCard.classList.remove('hidden');

    const rawVideoSrc = info.videoUrl || info.previewBlobUrl || '';
    let videoSrc = rawVideoSrc;
    if (rawVideoSrc && rawVideoSrc.startsWith('http') && !info.isFileUpload) {
      videoSrc = `/api/proxy-video?url=${encodeURIComponent(rawVideoSrc)}`;
    }

    let videoUiRevealed = false;
    const revealVideoUi = () => {
      if (videoUiRevealed) return;
      if (!previewVideo.videoWidth || previewVideo.videoWidth <= 0) return;
      videoUiRevealed = true;
      hideVideoLoader();
      if (previewSkeleton) previewSkeleton.classList.add('hidden');
      videoTrimContainer.classList.remove('hidden');
      const dur = previewVideo.duration || info.duration || 5.0;
      initVideoTrimmer(dur);
      initVideoCropOverlay();
      if (videoSrc) generateVideoFilmstrip(videoSrc, dur);
      autoScrollToCropper();
    };

    if (videoSrc) {
      showVideoLoader();
      videoCropState.isCustomCropped = false;
      previewVideo.removeAttribute('crossorigin');
      previewVideo.muted = true;
      previewVideo.defaultMuted = true;
      previewVideo.setAttribute('muted', '');
      previewVideo.setAttribute('playsinline', '');
      previewVideo.setAttribute('webkit-playsinline', '');
      previewVideo.setAttribute('autoplay', '');
      previewVideo.loop = true;
      previewVideo.src = videoSrc;
      previewVideo.load();

      const attemptPlay = () => {
        previewVideo.muted = true;
        const p = previewVideo.play();
        if (p !== undefined) {
          p.then(() => {
            hideVideoLoader();
            revealVideoUi();
            if (txtPlayPause) txtPlayPause.textContent = 'Pause';
            if (icPlayPause) {
              icPlayPause.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
            }
          }).catch(e => {
            console.log('Autoplay deferred:', e);
            hideVideoLoader();
            revealVideoUi();
            if (txtPlayPause) txtPlayPause.textContent = 'Play';
            if (icPlayPause) {
              icPlayPause.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
            }
          });
        }
      };

      previewVideo.onloadedmetadata = () => {
        attemptPlay();
      };
      previewVideo.ondurationchange = () => {
        if (!videoUiRevealed && previewVideo.videoWidth > 0 && !isNaN(previewVideo.duration)) {
          revealVideoUi();
        }
      };
      previewVideo.oncanplay = () => {
        revealVideoUi();
        attemptPlay();
      };
      previewVideo.onloadeddata = () => {
        revealVideoUi();
        attemptPlay();
      };
      previewVideo.onplaying = () => {
        revealVideoUi();
      };
      setTimeout(() => {
        if (!videoUiRevealed && previewVideo.videoWidth > 0) {
          revealVideoUi();
        }
      }, 2500);
      previewVideo.onwaiting = () => {
        if (previewVideo.seeking) return;
        if (!videoBufferTimer) {
          videoBufferTimer = setTimeout(() => {
            if (previewVideo.paused || previewVideo.readyState < 3) {
              showVideoLoader();
            }
          }, 1500);
        }
      };
      attemptPlay();
      // Fast fallback safeguard: loader & skeleton transition
      setTimeout(revealVideoUi, 800);
    } else {
      revealVideoUi();
    }
  } else {
    // 2. SETUP IMAGE OR GIF CROPPER (With Freeform & 1:1 Square Crop)
    videoTrimContainer.classList.add('hidden');
    if (previewSkeleton) previewSkeleton.classList.remove('hidden');
    imageCropContainer.classList.add('hidden');
    previewCard.classList.remove('hidden');

    // Use proxy for URL-based images to allow full CORS canvas export
    let imgSrc = info.previewBlobUrl || info.thumbnail || '';
    if (!info.isFileUpload && info.thumbnail && info.thumbnail.startsWith('http')) {
      imgSrc = `/api/proxy-image?url=${encodeURIComponent(info.thumbnail)}`;
    }

    if (info.isFileUpload || imgSrc.startsWith('blob:') || imgSrc.startsWith('data:')) {
      cropperImage.removeAttribute('crossorigin');
    } else {
      cropperImage.crossOrigin = 'anonymous';
    }
    cropperImage.src = imgSrc;

    cropperImage.onerror = () => {
      console.warn('Image load error on cropper');
      if (previewSkeleton) previewSkeleton.classList.add('hidden');
      imageCropContainer.classList.remove('hidden');
    };

    cropperImage.onload = () => {
      if (previewSkeleton) previewSkeleton.classList.add('hidden');
      imageCropContainer.classList.remove('hidden');
      if (cropperInstance) cropperInstance.destroy();

      // Initialize Cropper.js
      const isFree = activeCropRatio === 'free';
      cropperInstance = new Cropper(cropperImage, {
        aspectRatio: isFree ? NaN : 1, // NaN = Freeform, 1 = 1:1 Square
        viewMode: 1,
        dragMode: 'crop',
        autoCropArea: 1, // Start by covering 100% of the picture!
        responsive: true,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        ready() {
          if (activeCropRatio === 'free') {
            // Guarantee it covers the full dimensions of the picture
            const canvasData = cropperInstance.getCanvasData();
            cropperInstance.setCropBoxData({
              left: canvasData.left,
              top: canvasData.top,
              width: canvasData.width,
              height: canvasData.height
            });
          }
          autoScrollToCropper();
        }
      });
      window.cropper = cropperInstance;
    };

    // Safety fallback: only if image load stalls completely after 4s
    setTimeout(() => {
      if (previewSkeleton && !previewSkeleton.classList.contains('hidden')) {
        previewSkeleton.classList.add('hidden');
        imageCropContainer.classList.remove('hidden');
      }
    }, 4000);
  }

  if (studioResultView) studioResultView.classList.add('hidden');
  if (studioEditorView) studioEditorView.classList.remove('hidden');
  if (studioHeaderResult) studioHeaderResult.classList.add('hidden');
  if (studioHeaderTrimming) studioHeaderTrimming.classList.remove('hidden');
  previewCard.classList.remove('hidden');
  autoScrollToCropper();
}

/**
 * Smoothly auto-scrolls down to where the sticker and crop box are located.
 */
function autoScrollToCropper() {
  setTimeout(() => {
    const target = document.getElementById('previewCard');
    if (target && !target.classList.contains('hidden')) {
      const targetY = window.pageYOffset + target.getBoundingClientRect().top - 20;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    }
  }, 120);
}

// Filmstrip Generator State
let currentFilmstripVideoSrc = null;
let filmstripAbortController = null;

/**
 * Extracts and displays video frames along the scrubber track so user can see what they are trimming.
 */
async function generateVideoFilmstrip(videoSrc, duration) {
  if (!timelineFilmstrip || !videoSrc) return;
  if (currentFilmstripVideoSrc === videoSrc && timelineFilmstrip.children.length > 0) {
    return;
  }
  currentFilmstripVideoSrc = videoSrc;

  if (filmstripAbortController) {
    filmstripAbortController.abort = true;
  }
  const currentGen = { abort: false };
  filmstripAbortController = currentGen;

  // Insert initial placeholder strip
  timelineFilmstrip.innerHTML = '';
  const FRAME_COUNT = 8;
  const frameElements = [];
  for (let i = 0; i < FRAME_COUNT; i++) {
    const slot = document.createElement('div');
    slot.className = 'filmstrip-slot';
    slot.innerHTML = '<div class="filmstrip-placeholder"></div>';
    timelineFilmstrip.appendChild(slot);
    frameElements.push(slot);
  }

  // Helper to render the filmstrip image strip
  const applyFilmstripImage = (imgUrl) => {
    if (currentGen.abort) return;
    const stripImg = document.createElement('img');
    stripImg.className = 'timeline-filmstrip-strip';
    stripImg.style.width = '100%';
    stripImg.style.height = '100%';
    stripImg.style.objectFit = 'fill';
    stripImg.style.display = 'block';
    stripImg.alt = '';
    stripImg.src = imgUrl;
    stripImg.onload = () => {
      if (currentGen.abort) return;
      timelineFilmstrip.innerHTML = '';
      timelineFilmstrip.appendChild(stripImg);
    };
  };

  // 1. If it's a web/platform URL, use server FFmpeg generator (takes 30ms, 100% reliable)
  const rawUrl = currentMediaData?.sourceUrl || currentMediaData?.videoUrl;
  const safeDur = Math.max(0.5, parseFloat(duration) || 5.0);
  if (rawUrl && rawUrl.startsWith('http') && !currentMediaData.isFileUpload) {
    applyFilmstripImage(`/api/video-filmstrip?url=${encodeURIComponent(rawUrl)}&duration=${encodeURIComponent(safeDur)}`);
    return;
  }

  // 2. If it's a file upload, use instant client canvas extraction (0 upload bandwidth, instant 150ms preview)
  if (currentMediaData?.isFileUpload) {
    runClientCanvasFilmstrip(videoSrc, duration, currentGen, frameElements);
    return;
  }

  // 3. Fallback for remote video or server filmstrip
  runClientCanvasFilmstrip(videoSrc, duration, currentGen, frameElements);
}

// Client canvas extraction fallback
async function runClientCanvasFilmstrip(videoSrc, duration, currentGen, frameElements) {
  const offVideo = document.createElement('video');
  offVideo.muted = true;
  offVideo.playsInline = true;
  offVideo.setAttribute('muted', '');
  offVideo.setAttribute('playsinline', '');
  offVideo.preload = 'auto';
  offVideo.src = videoSrc;

  const canvas = document.createElement('canvas');
  canvas.width = 80;
  canvas.height = 48;
  const ctx = canvas.getContext('2d');

  await new Promise((resolve) => {
    if (offVideo.readyState >= 1) return resolve();
    offVideo.onloadedmetadata = () => resolve();
    offVideo.onerror = () => resolve();
    setTimeout(resolve, 2000);
  });

  if (currentGen.abort) return;
  const totalDur = (offVideo.duration && !isNaN(offVideo.duration) && offVideo.duration > 0)
    ? offVideo.duration
    : (duration || 5.0);

  const FRAME_COUNT = frameElements.length || 8;
  for (let i = 0; i < FRAME_COUNT; i++) {
    if (currentGen.abort) return;
    const targetTime = Math.min(totalDur - 0.05, Math.max(0.05, ((i + 0.5) / FRAME_COUNT) * totalDur));
    try {
      await new Promise((resolve) => {
        const onSeeked = () => {
          offVideo.removeEventListener('seeked', onSeeked);
          resolve();
        };
        offVideo.addEventListener('seeked', onSeeked, { once: true });
        offVideo.currentTime = targetTime;
        setTimeout(resolve, 400);
      });
      if (currentGen.abort) return;
      ctx.drawImage(offVideo, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
      const img = document.createElement('img');
      img.className = 'filmstrip-frame';
      img.src = dataUrl;
      img.alt = '';
      if (frameElements[i]) {
        frameElements[i].innerHTML = '';
        frameElements[i].appendChild(img);
      }
    } catch (_) {}
  }
  offVideo.removeAttribute('src');
  offVideo.load();
}

// Track duration and position
let videoTotalDuration = 5.0;

function updateTimelineVisuals() {
  const total = videoTotalDuration || (previewVideo && !isNaN(previewVideo.duration) && previewVideo.duration > 0 ? previewVideo.duration : 5.0) || 5.0;
  const s = parseFloat(sliderStart.value) || 0;
  const e = parseFloat(sliderEnd.value) || Math.min(total, 5.0);
  const cur = previewVideo && !isNaN(previewVideo.currentTime) ? previewVideo.currentTime : s;

  const startPct = Math.max(0, Math.min(100, (s / total) * 100));
  const endPct = Math.max(0, Math.min(100, (e / total) * 100));
  const curPct = Math.max(0, Math.min(100, (cur / total) * 100));

  if (timelineDimStart) timelineDimStart.style.width = `${startPct}%`;
  if (timelineDimEnd) timelineDimEnd.style.width = `${Math.max(0, 100 - endPct)}%`;
  if (timelineSelection) {
    timelineSelection.style.left = `${startPct}%`;
    timelineSelection.style.width = `${Math.max(0, endPct - startPct)}%`;
  }
  if (timelinePlayhead) {
    timelinePlayhead.style.left = `${curPct}%`;
  }
  if (timelineTimeStart) timelineTimeStart.textContent = `${s.toFixed(1)}s`;
  if (timelineTimeEnd) timelineTimeEnd.textContent = `${total.toFixed(1)}s`;
  if (timelineCurrentTime) timelineCurrentTime.textContent = `Position: ${cur.toFixed(1)}s`;
}

// Setup timeline track click and draggable grip interactions
function setupTimelineInteractions() {
  if (!timelineTrack) return;

  timelineTrack.addEventListener('click', (e) => {
    if (e.target.closest('.timeline-grip')) return;
    const rect = timelineTrack.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const total = videoTotalDuration || (previewVideo && !isNaN(previewVideo.duration) ? previewVideo.duration : 5.0) || 5.0;
    const targetTime = pct * total;
    if (previewVideo && !isNaN(previewVideo.duration)) {
      previewVideo.currentTime = targetTime;
    }
    if (timelinePlayhead) timelinePlayhead.style.left = `${pct * 100}%`;
    if (timelineCurrentTime) timelineCurrentTime.textContent = `Position: ${targetTime.toFixed(1)}s`;
  });

  let activeDragHandle = null;

  const onPointerDown = (handle, e) => {
    e.preventDefault();
    e.stopPropagation();
    activeDragHandle = handle;
    try { e.target.setPointerCapture(e.pointerId); } catch (_) {}
  };

  if (timelineGripStart) {
    timelineGripStart.addEventListener('pointerdown', (e) => onPointerDown('start', e));
  }
  if (timelineGripEnd) {
    timelineGripEnd.addEventListener('pointerdown', (e) => onPointerDown('end', e));
  }

  window.addEventListener('pointermove', (e) => {
    if (!activeDragHandle || !timelineTrack) return;
    const rect = timelineTrack.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const total = videoTotalDuration || 5.0;
    const newTime = Math.round(pct * total * 10) / 10;

    if (activeDragHandle === 'start') {
      const curEnd = parseFloat(sliderEnd.value);
      const clampedStart = Math.max(0, Math.min(newTime, Math.max(0, curEnd - 0.5)));
      sliderStart.value = clampedStart;
      if (curEnd - clampedStart > 5.0) {
        sliderEnd.value = Math.min(total, clampedStart + 5.0);
      }
      if (previewVideo && !isNaN(previewVideo.duration)) {
        previewVideo.currentTime = clampedStart;
      }
    } else if (activeDragHandle === 'end') {
      const curStart = parseFloat(sliderStart.value);
      const clampedEnd = Math.max(Math.min(total, curStart + 0.5), Math.min(total, newTime));
      sliderEnd.value = clampedEnd;
      if (clampedEnd - curStart > 5.0) {
        sliderStart.value = Math.max(0, clampedEnd - 5.0);
      }
      if (previewVideo && !isNaN(previewVideo.duration)) {
        previewVideo.currentTime = clampedEnd;
      }
    }
    updateTrimDisplay();
    updateTimelineVisuals();
  });

  const onPointerUp = (e) => {
    if (activeDragHandle) {
      activeDragHandle = null;
      try { e.target.releasePointerCapture(e.pointerId); } catch (_) {}
    }
  };

  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
}
setupTimelineInteractions();

// Initialize Video Trimmer with Dual Sliders (Strictly up to 5.0s sticker standard)
function initVideoTrimmer(totalDuration) {
  const total = Math.max(parseFloat(totalDuration) || 5.0, 1.0);
  videoTotalDuration = total;

  sliderStart.max = Math.max(total - 0.5, 0.1);
  if (parseFloat(sliderStart.value) > total - 0.5) {
    sliderStart.value = 0;
  }

  sliderEnd.max = total;
  // Maximum number of seconds allowed is 5.0s
  sliderStart.value = 0;
  sliderEnd.value = Math.min(total, 5.0);

  updateTrimDisplay();
  updateTimelineVisuals();

  sliderStart.oninput = () => {
    let s = parseFloat(sliderStart.value);
    let e = parseFloat(sliderEnd.value);

    // Enforce 0.5s min and 5.0s max for animated stickers
    if (e - s < 0.5) {
      e = Math.min(s + 0.5, total);
      sliderEnd.value = e;
    }
    if (e - s > 5.0) {
      e = Math.min(s + 5.0, total);
      sliderEnd.value = e;
    }

    if (previewVideo && !isNaN(previewVideo.duration)) {
      previewVideo.currentTime = s;
      if (previewVideo.paused) previewVideo.play().catch(() => { });
    }
    updateTrimDisplay();
    updateTimelineVisuals();
  };

  sliderEnd.oninput = () => {
    let s = parseFloat(sliderStart.value);
    let e = parseFloat(sliderEnd.value);

    if (e - s < 0.5) {
      s = Math.max(e - 0.5, 0);
      sliderStart.value = s;
    }
    if (e - s > 5.0) {
      s = Math.max(e - 5.0, 0);
      sliderStart.value = s;
    }

    if (previewVideo && !isNaN(previewVideo.duration)) {
      // Seek to exact end boundary frame so user sees cut-off frame
      previewVideo.currentTime = Math.max(s, e - 0.1);
      if (previewVideo.paused) previewVideo.play().catch(() => { });
    }
    updateTrimDisplay();
    updateTimelineVisuals();
  };

  // The trimmed video loops continuously between start and end
  previewVideo.ontimeupdate = () => {
    const s = parseFloat(sliderStart.value) || 0;
    const e = parseFloat(sliderEnd.value) || Math.min(previewVideo.duration || 5.0, 5.0);

    if (e > s && (previewVideo.currentTime >= e || previewVideo.currentTime < s - 0.2)) {
      previewVideo.currentTime = s;
      if (previewVideo.paused) {
        previewVideo.play().catch(() => { });
      }
    }

    const cur = previewVideo.currentTime;
    const curPct = Math.max(0, Math.min(100, (cur / total) * 100));
    if (timelinePlayhead) timelinePlayhead.style.left = `${curPct}%`;
    if (timelineCurrentTime) timelineCurrentTime.textContent = `Position: ${cur.toFixed(1)}s`;
  };

  previewVideo.onended = () => {
    const s = parseFloat(sliderStart.value) || 0;
    previewVideo.currentTime = s;
    previewVideo.play().catch(() => { });
  };
}

function updateTrimDisplay() {
  const s = parseFloat(sliderStart.value) || 0;
  const e = parseFloat(sliderEnd.value) || 5.0;
  const dur = Math.max(0.1, e - s);

  valStart.textContent = `${s.toFixed(1)}s`;
  valEnd.textContent = `${e.toFixed(1)}s`;
  trimDurationBadge.textContent = `${dur.toFixed(1)}s / 5.0s Max`;
}

// Convert to WhatsApp Sticker Action
btnConvert.addEventListener('click', async () => {
  if (!currentMediaData) return;

  setConvertLoading(true);
  startProgressSimulation();

  // WIPE ANY PREVIOUS STICKER IMAGE IMMEDIATELY
  if (resultStickerImg) {
    resultStickerImg.removeAttribute('src');
    resultStickerImg.src = '';
    resultStickerImg.classList.add('hidden');
  }
  if (stickerSkeleton) {
    stickerSkeleton.classList.remove('hidden');
  }

  try {
    let res, data;
    const isVideo = currentMediaData.type === 'video';
    const pack = (packName?.value || 'Sticksy Pack').trim();

    const startTime = isVideo ? parseFloat(sliderStart?.value) || 0 : 0;
    const duration = isVideo ? Math.min(parseFloat(sliderEnd?.value) - startTime, 5.0) : 5.0;

    // FOR ANIMATED GIFS: Send original media + cropData to backend FFmpeg to preserve multi-frame animation
    const isGif = currentMediaData.type === 'gif';
    if (isGif && cropperInstance) {
      const cropData = cropperInstance.getData(true);
      if (currentMediaData.isFileUpload && selectedFile) {
        const formData = new FormData();
        formData.append('media', selectedFile);
        formData.append('cropMode', 'fit');
        formData.append('cropData', JSON.stringify(cropData));
        formData.append('packName', pack);
        formData.append('authorName', 'Sticksy');

        res = await fetch('/api/upload-sticker', {
          method: 'POST',
          body: formData
        });
      } else {
        res = await fetch('/api/create-sticker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: currentMediaData.sourceUrl,
            cropMode: 'fit',
            cropData,
            packName: pack,
            authorName: 'Sticksy'
          })
        });
      }
    } else if (!isVideo && cropperInstance) {
      let clientCroppedBlob = null;

      // Try client-side canvas render first (preserves natural aspect ratio without distorting or padding)
      try {
        const croppedCanvas = cropperInstance.getCroppedCanvas();
        if (croppedCanvas) {
          const maxDim = 512;
          let targetW, targetH;
          if (activeCropRatio === '1') {
            targetW = maxDim;
            targetH = maxDim;
          } else {
            const ratio = croppedCanvas.width / croppedCanvas.height;
            if (ratio >= 1) {
              targetW = maxDim;
              targetH = Math.max(2, Math.round(maxDim / ratio));
            } else {
              targetH = maxDim;
              targetW = Math.max(2, Math.round(maxDim * ratio));
            }
          }
          targetW = Math.max(2, Math.round(targetW / 2) * 2);
          targetH = Math.max(2, Math.round(targetH / 2) * 2);

          const outCanvas = document.createElement('canvas');
          outCanvas.width = targetW;
          outCanvas.height = targetH;
          const ctx = outCanvas.getContext('2d');
          ctx.drawImage(croppedCanvas, 0, 0, targetW, targetH);

          clientCroppedBlob = await new Promise(resolve => outCanvas.toBlob(resolve, 'image/png'));
        }
      } catch (canvasErr) {
        console.warn('Direct canvas export tainted or unavailable, relying on server FFmpeg cropData:', canvasErr);
      }

      // If client canvas export succeeded, upload directly
      if (clientCroppedBlob) {
        const formData = new FormData();
        formData.append('media', clientCroppedBlob, 'cropped_sticker.png');
        formData.append('cropMode', 'fit');
        formData.append('packName', pack);
        formData.append('authorName', 'Sticksy');

        res = await fetch('/api/upload-sticker', {
          method: 'POST',
          body: formData
        });
      } else {
        // Fallback: send crop coordinates to server
        const cropData = cropperInstance.getData(true);
        if (currentMediaData.isFileUpload && selectedFile) {
          const formData = new FormData();
          formData.append('media', selectedFile);
          formData.append('cropMode', 'fit');
          formData.append('cropData', JSON.stringify(cropData));
          formData.append('packName', pack);
          formData.append('authorName', 'Sticksy');

          res = await fetch('/api/upload-sticker', {
            method: 'POST',
            body: formData
          });
        } else {
          res = await fetch('/api/create-sticker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: currentMediaData.sourceUrl,
              cropMode: 'fit',
              cropData,
              packName: pack,
              authorName: 'Sticksy'
            })
          });
        }
      }
    } else {
      // FOR VIDEOS: Send duration, start time, and video cropData
      const videoCrop = getVideoCropData();
      const cropMode = videoCrop ? 'crop' : 'fit';

      if (currentMediaData.isFileUpload && selectedFile) {
        const formData = new FormData();
        formData.append('media', selectedFile);
        formData.append('startTime', startTime);
        formData.append('duration', duration);
        formData.append('cropMode', cropMode);
        if (videoCrop) {
          formData.append('cropData', JSON.stringify(videoCrop));
        }
        formData.append('packName', pack);
        formData.append('authorName', 'Sticksy');

        res = await fetch('/api/upload-sticker', {
          method: 'POST',
          body: formData
        });
      } else {
        res = await fetch('/api/create-sticker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: currentMediaData.sourceUrl,
            startTime,
            duration,
            cropMode,
            cropData: videoCrop,
            packName: pack,
            authorName: 'Sticksy'
          })
        });
      }
    }

    data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create sticker.');
    }

    currentStickerData = data;
    displayResult(currentStickerData);
  } catch (err) {
    showAlert(err.message);
  } finally {
    setConvertLoading(false);
    stopProgressSimulation();
  }
});

// Display Result Card
function displayResult(sticker) {
  if (!currentStickerData) {
    currentStickerData = { ...sticker };
  } else {
    Object.assign(currentStickerData, sticker);
  }

  const formatLabel = sticker.format === 'gif' ? 'Animated GIF' : (sticker.animated ? 'Animated WebP' : 'Static Image');
  const durText = sticker.duration ? ` • ${sticker.duration.toFixed(1)}s` : '';
  stickerSpecs.textContent = `512×512 • ${sticker.sizeKb} KB • ${formatLabel}${durText}`;

  // Pre-prepare clipboard data immediately so copying is instantaneous
  currentStickerData.cachedGifBlob = null;
  currentStickerData.cachedMp4Blob = null;

  // Show skeleton while GIF/image bytes are fetching and decoding
  if (stickerSkeleton) stickerSkeleton.classList.remove('hidden');
  if (resultStickerImg) resultStickerImg.classList.add('hidden');

  let revealed = false;
  const revealResultStage = () => {
    if (revealed) return;
    revealed = true;
    if (stickerSkeleton) stickerSkeleton.classList.add('hidden');
    if (resultStickerImg) resultStickerImg.classList.remove('hidden');
    if (resultStage) resultStage.classList.remove('hidden');
  };

  // 1. Immediately set the image src so the browser starts loading and displaying it RIGHT AWAY!
  const directUrl = `${sticker.gifUrl || sticker.viewUrl}#stickers.gif`;
  resultStickerImg.onload = () => revealResultStage();
  resultStickerImg.onerror = () => revealResultStage();
  resultStickerImg.src = directUrl;

  // Safety fallback: if onload is slow or delayed, NEVER stay stuck!
  setTimeout(revealResultStage, 900);

  if (resultStickerImg.complete && resultStickerImg.naturalWidth > 0) {
    revealResultStage();
  }

  // 2. Pre-cache GIF blob quietly in background for instantaneous clipboard copying and update src with local blob
  (async () => {
    try {
      const gifUrl = sticker.gifUrl || sticker.viewUrl;
      const gifResp = await fetch(gifUrl);
      if (gifResp.ok) {
        currentStickerData.cachedGifBlob = await gifResp.blob();
        console.log('[Sticker] GIF blob cached for clipboard (' + currentStickerData.cachedGifBlob.size + ' bytes)');
        const localBlobUrl = URL.createObjectURL(currentStickerData.cachedGifBlob);
        resultStickerImg.src = `${localBlobUrl}#stickers.gif`;
      }
    } catch (e) {
      console.warn('Background GIF blob caching warning:', e);
    }
  })();

  // Box 2 switches view in-place from Trimming/Crop to Sticker Result!
  if (studioEditorView) studioEditorView.classList.add('hidden');
  if (studioHeaderTrimming) studioHeaderTrimming.classList.add('hidden');
  if (studioResultView) studioResultView.classList.remove('hidden');
  if (studioHeaderResult) studioHeaderResult.classList.remove('hidden');
  if (previewSkeleton) previewSkeleton.classList.add('hidden');
  previewCard.classList.remove('hidden');

  setTimeout(() => {
    previewCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 80);
}

// Function: Copy pure animated GIF to clipboard
async function copyGifToClipboard() {
  let gifBlob = currentStickerData?.cachedGifBlob;
  const gifUrl = currentStickerData?.gifUrl || currentStickerData?.viewUrl || resultStickerImg?.src;
  if (!gifBlob && gifUrl) {
    try {
      const resp = await fetch(gifUrl);
      if (resp.ok) {
        gifBlob = await resp.blob();
        currentStickerData.cachedGifBlob = gifBlob;
      }
    } catch (e) {}
  }

  let copied = false;

  // 1. Modern Async Clipboard API: pure image/gif write (never write text/html or URL snippet!)
  if (navigator.clipboard && window.ClipboardItem && gifBlob) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/gif': gifBlob })
      ]);
      copied = true;
      console.log('[Clipboard] Copied pure animated GIF via Async Clipboard API');
    } catch (errA) {
      console.warn('[Clipboard] Direct image/gif write notice:', errA.message);
    }
  }

  // 2. Native DOM selection fallback (triggers browser native image copy)
  if (!copied && resultStickerImg) {
    try {
      const range = document.createRange();
      range.selectNode(resultStickerImg);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      copied = document.execCommand('copy');
      sel.removeAllRanges();
      if (copied) console.log('[Clipboard] Copied via native DOM image selection');
    } catch (errB) {
      console.warn('[Clipboard] DOM copy notice:', errB.message);
    }
  }

  return true;
}

// Helper: Launch native WhatsApp application (Android direct app launcher intent, iOS & Desktop whatsapp://)
function openWhatsAppApp() {
  const ua = navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua);

  if (isAndroid) {
    // Android native launcher intent: opens WhatsApp cleanly to chats list without "send" intent errors!
    window.location.href = 'intent:#Intent;package=com.whatsapp;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;end;';
    return;
  }

  // iOS (iPhone/iPad), Windows Desktop App, and macOS Desktop App
  // whatsapp:// triggers the registered native WhatsApp client directly
  try {
    const a = document.createElement('a');
    a.href = 'whatsapp://';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (_) {
    window.location.href = 'whatsapp://';
  }
}

// 1. Interactive Tactile Hold Animations on Sticker Canvas (Zero Emojis)
let isHoldingSticker = false;
let holdTimerId = null;

function triggerHoldVisualsStart() {
  isHoldingSticker = true;
  if (stickerCanvasContainer) stickerCanvasContainer.classList.add('holding');
  if (holdCallout) holdCallout.classList.add('active-holding');
  if (calloutText) {
    calloutText.textContent = 'Release and tap Copy image';
  }
  if (navigator.vibrate) {
    try { navigator.vibrate(30); } catch (e) {}
  }
}

function triggerHoldVisualsEnd() {
  isHoldingSticker = false;
  if (holdTimerId) clearTimeout(holdTimerId);
  if (stickerCanvasContainer) stickerCanvasContainer.classList.remove('holding');
  if (holdCallout) holdCallout.classList.remove('active-holding');
  if (calloutText) {
    calloutText.textContent = 'Hold the GIF and tap Copy image';
  }
}

if (stickerCanvasContainer) {
  // Mobile Touch Events: Show tactile feedback when user holds their finger
  stickerCanvasContainer.addEventListener('touchstart', () => {
    holdTimerId = setTimeout(triggerHoldVisualsStart, 160);
  }, { passive: true });

  stickerCanvasContainer.addEventListener('touchend', triggerHoldVisualsEnd);
  stickerCanvasContainer.addEventListener('touchcancel', triggerHoldVisualsEnd);

  // Desktop Mouse Events: Tactile feedback on press
  stickerCanvasContainer.addEventListener('mousedown', () => {
    triggerHoldVisualsStart();
  });

  stickerCanvasContainer.addEventListener('mouseup', triggerHoldVisualsEnd);
  stickerCanvasContainer.addEventListener('mouseleave', triggerHoldVisualsEnd);
}



// Tap on Callout to Copy Directly
if (holdCallout) {
  holdCallout.addEventListener('click', async () => {
    const ok = await copyGifToClipboard();
    if (ok) {
      if (stickerCanvasContainer) {
        stickerCanvasContainer.classList.add('copied-burst');
        setTimeout(() => stickerCanvasContainer.classList.remove('copied-burst'), 1200);
      }
      holdCallout.classList.add('success-copied');
      if (calloutText) calloutText.textContent = 'GIF copied! Tap below to open WhatsApp';
      showAlert('GIF copied to clipboard! Tap Open WhatsApp below to paste.');
      setTimeout(() => {
        holdCallout.classList.remove('success-copied');
        if (calloutText) calloutText.textContent = 'Hold the GIF and tap Copy image';
      }, 5000);
    }
  });
}

// 2. Global Copy Event: When user selects "Copy image" from browser menu
// (DOES NOT automatically open WhatsApp - prompts user to tap the button!)
document.addEventListener('copy', (e) => {
  // Visual Celebration Burst on Canvas & Callout (No duplicate HTML snippet injected!)
  if (stickerCanvasContainer) {
    stickerCanvasContainer.classList.add('copied-burst');
    setTimeout(() => stickerCanvasContainer.classList.remove('copied-burst'), 1200);
  }
  if (holdCallout) {
    holdCallout.classList.add('success-copied');
  }
  if (calloutText) {
    calloutText.textContent = 'GIF copied! Tap below to open WhatsApp';
  }

  showAlert('GIF copied to clipboard! Tap Open WhatsApp below to paste.');

  // Reset visual badge after 5 seconds
  setTimeout(() => {
    if (holdCallout) holdCallout.classList.remove('success-copied');
    if (calloutText) {
      calloutText.textContent = 'Hold the GIF and tap Copy image';
    }
  }, 5000);
});

// 3. Button: "Open WhatsApp & Paste This GIF" (Strictly opens WhatsApp, zero clipboard copy, zero alerts)
if (btnOpenWhatsApp) {
  btnOpenWhatsApp.addEventListener('click', () => {
    if (openWaBtnText) {
      openWaBtnText.textContent = 'Opening WhatsApp...';
    }
    openWhatsAppApp();
    setTimeout(() => {
      if (openWaBtnText) {
        openWaBtnText.textContent = 'Open WhatsApp & Paste This GIF';
      }
    }, 1500);
  });
}

// "Stick Another Link" Reset
btnCreateAnother.addEventListener('click', () => {
  // Wipe previous sticker image and data IMMEDIATELY
  if (resultStickerImg) {
    resultStickerImg.removeAttribute('src');
    resultStickerImg.src = '';
    resultStickerImg.classList.add('hidden');
  }
  if (stickerSkeleton) {
    stickerSkeleton.classList.remove('hidden');
  }
  currentStickerData = null;
  currentMediaData = null;
  selectedFile = null;

  previewCard.classList.add('hidden');
  if (studioResultView) studioResultView.classList.add('hidden');
  if (studioEditorView) studioEditorView.classList.remove('hidden');
  if (studioHeaderResult) studioHeaderResult.classList.add('hidden');
  if (studioHeaderTrimming) studioHeaderTrimming.classList.remove('hidden');
  if (previewSkeleton) previewSkeleton.classList.add('hidden');
  if (resultStage) resultStage.classList.remove('hidden');
  if (timelineFilmstrip) timelineFilmstrip.innerHTML = '';
  if (filmstripAbortController) filmstripAbortController.abort = true;
  currentFilmstripVideoSrc = null;

  hideVideoLoader();
  if (previewVideo) {
    previewVideo.pause();
    previewVideo.src = '';
  }
  mediaUrl.value = '';
  if (fileInput) fileInput.value = '';

  if (cropperInstance) {
    cropperInstance.destroy();
    cropperInstance = null;
  }

  // Switch to Link tab and focus the input immediately
  tabLink.click();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => {
    mediaUrl.focus();
  }, 150);
});

// UI Helpers
function showAlert(msg) {
  alertBox.textContent = msg;
  alertBox.classList.remove('hidden');
}

function clearAlert() {
  alertBox.textContent = '';
  alertBox.classList.add('hidden');
}

function setInspectLoading(loading) {
  btnInspect.disabled = loading;
  const svg = btnInspect.querySelector('svg');
  if (loading) {
    if (svg) svg.classList.add('hidden');
    btnInspect.querySelector('.btn-text').textContent = 'Fetching...';
    inspectSpinner.classList.remove('hidden');
  } else {
    if (svg) svg.classList.remove('hidden');
    btnInspect.querySelector('.btn-text').textContent = 'Stick It!';
    inspectSpinner.classList.add('hidden');
  }
}

function setConvertLoading(loading) {
  btnConvert.disabled = loading;
  const svg = btnConvert.querySelector('svg');
  if (loading) {
    if (svg) svg.classList.add('hidden');
    btnConvert.querySelector('.btn-text').textContent = 'Creating Sticker...';
    convertSpinner.classList.remove('hidden');
    progressTracker.classList.remove('hidden');
  } else {
    if (svg) svg.classList.remove('hidden');
    btnConvert.querySelector('.btn-text').textContent = 'Create WhatsApp Sticker';
    convertSpinner.classList.add('hidden');
  }
}

let progressTimer = null;
let currentConvertCount = 0;

function startProgressSimulation() {
  currentConvertCount = 6;
  progressBar.style.width = '6%';
  if (convertPercent) convertPercent.textContent = '6%';
  progressStatus.textContent = 'Cropping & extracting frames...';

  if (progressTimer) clearInterval(progressTimer);

  const startTime = Date.now();
  progressTimer = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;

    let target = 6;
    if (elapsed < 1.5) {
      target = 6 + (elapsed / 1.5) * 42; // 6% -> 48%
      progressStatus.textContent = 'Cropping & extracting frames...';
    } else if (elapsed < 3.5) {
      target = 48 + ((elapsed - 1.5) / 2.0) * 32; // 48% -> 80%
      progressStatus.textContent = 'Encoding animated sticker GIF...';
    } else if (elapsed < 6.0) {
      target = 80 + ((elapsed - 3.5) / 2.5) * 15; // 80% -> 95%
      progressStatus.textContent = 'Optimizing palette & looping frames...';
    } else {
      target = Math.min(98, 95 + ((elapsed - 6.0) / 10) * 3);
      progressStatus.textContent = 'Finalizing sticker...';
    }

    if (currentConvertCount < target) {
      currentConvertCount += Math.max(1, Math.round((target - currentConvertCount) * 0.35));
    }

    const clamped = Math.min(Math.round(currentConvertCount), 98);
    progressBar.style.width = `${clamped}%`;
    if (convertPercent) convertPercent.textContent = `${clamped}%`;
  }, 45);
}

function stopProgressSimulation() {
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }

  // Smoothly finish to 100%
  let tick = Math.max(currentConvertCount, 95);
  const finishInt = setInterval(() => {
    tick += 2;
    if (tick >= 100) {
      tick = 100;
      clearInterval(finishInt);
      progressBar.style.width = '100%';
      if (convertPercent) convertPercent.textContent = '100%';
      progressStatus.textContent = 'Done! Sticker Ready';
      setTimeout(() => {
        progressTracker.classList.add('hidden');
        progressBar.style.width = '0%';
        if (convertPercent) convertPercent.textContent = '0%';
      }, 500);
    } else {
      progressBar.style.width = `${tick}%`;
      if (convertPercent) convertPercent.textContent = `${tick}%`;
    }
  }, 15);
}

// ==========================================
// PROGRESSIVE WEB APP (PWA) & SHARE TARGET
// ==========================================

// Register Service Worker & force update check
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('Sticksy PWA ServiceWorker active:', reg.scope);
        reg.update();
      })
      .catch(err => console.warn('ServiceWorker registration error:', err));
  });
}

// Handle PWA Installation Prompt (Native Android prompt & iOS step-by-step instructions)
let deferredPrompt = null;
const btnPwaInstall = document.getElementById('btnPwaInstall');
const iosInstallModal = document.getElementById('iosInstallModal');
const btnIosModalClose = document.getElementById('btnIosModalClose');
const btnIosModalGotIt = document.getElementById('btnIosModalGotIt');

const isIosDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent);
const isStandaloneMode = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;

// On iOS devices, show "Install App" button in navbar if not already installed as standalone
if (isIosDevice && !isStandaloneMode && btnPwaInstall) {
  btnPwaInstall.classList.remove('hidden');
}

function showIosInstallModal() {
  if (iosInstallModal) {
    iosInstallModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function hideIosInstallModal() {
  if (iosInstallModal) {
    iosInstallModal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

if (btnIosModalClose) btnIosModalClose.addEventListener('click', hideIosInstallModal);
if (btnIosModalGotIt) btnIosModalGotIt.addEventListener('click', hideIosInstallModal);
if (iosInstallModal) {
  iosInstallModal.addEventListener('click', (e) => {
    if (e.target === iosInstallModal) hideIosInstallModal();
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (btnPwaInstall) {
    btnPwaInstall.classList.remove('hidden');
  }
});

if (btnPwaInstall) {
  btnPwaInstall.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA install choice: ${outcome}`);
      deferredPrompt = null;
      btnPwaInstall.classList.add('hidden');
      return;
    }
    // If on iPhone or fallback, show the beautiful step-by-step instructions
    showIosInstallModal();
  });
}

window.addEventListener('appinstalled', () => {
  console.log('Sticksy PWA installed successfully!');
  if (btnPwaInstall) btnPwaInstall.classList.add('hidden');
});

// URL Extraction Helper for Shared Intents
function extractUrlFromText(text) {
  if (!text || typeof text !== 'string') return null;
  // Match any http/https URL
  const match = text.match(/(https?:\/\/[^\s"'<>()[\]{}]+)/i);
  if (!match) return null;
  let url = match[1];
  // Strip trailing punctuation (.,;:!?)) common in shared social captions
  url = url.replace(/[.,;:!?)]+$/, '');
  return url;
}

// Show incoming share notification banner
function showShareBanner(url) {
  const banner = document.getElementById('shareBanner');
  const bannerUrl = document.getElementById('shareBannerUrl');
  if (banner && bannerUrl) {
    bannerUrl.textContent = url;
    banner.classList.remove('hidden');
    // Auto-hide after 8 seconds
    setTimeout(() => {
      banner.classList.add('hidden');
    }, 8000);
  }
}

// Process Incoming Shared Video Link or Shortcut
function handleIncomingShare() {
  const params = new URLSearchParams(window.location.search);

  // 1. Check for shared video links (from TikTok, Pinterest, Instagram, YouTube, etc.)
  const sharedUrl = params.get('url');
  const sharedText = params.get('text');
  const sharedTitle = params.get('title');
  const sharedLink = params.get('link');

  const foundUrl = extractUrlFromText(sharedUrl) ||
                   extractUrlFromText(sharedText) ||
                   extractUrlFromText(sharedLink) ||
                   extractUrlFromText(sharedTitle);

  if (foundUrl) {
    console.log('[PWA Share Target] Received video URL:', foundUrl);
    
    // Switch to Link Tab
    if (tabLink) tabLink.click();

    // Populate the input field
    mediaUrl.value = foundUrl;

    // Show visual indicator banner
    showShareBanner(foundUrl);

    // Clean browser address bar without reload
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);

    // Automatically inspect and fetch video!
    setTimeout(() => {
      inspectUrl(foundUrl);
    }, 200);
    return;
  }

  // 2. Check for App Shortcuts
  const action = params.get('action');
  if (action === 'upload') {
    if (tabUpload) tabUpload.click();
    window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
  } else if (action === 'paste') {
    if (tabLink) tabLink.click();
    window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
  }
}

// Run share detection on page load
window.addEventListener('DOMContentLoaded', handleIncomingShare);
// Also run immediately in case DOMContentLoaded already fired
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  handleIncomingShare();
}

// Expose key UI functions to window for testability & integration
window.displayPreview = displayPreview;
window.displayResult = displayResult;
window.startInspectProgress = startInspectProgress;
window.finishInspectProgress = finishInspectProgress;
window.startProgressSimulation = startProgressSimulation;
window.stopProgressSimulation = stopProgressSimulation;
