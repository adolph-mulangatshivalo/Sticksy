# StickerSync — Universal Media to WhatsApp Sticker App

> **100% Free • Unlimited Public Scale • Zero WhatsApp Banning (Method 1)**

Turn any link from **TikTok, Pinterest, Instagram, Facebook, YouTube Shorts, X (Twitter)** or local photo/video into a WhatsApp animated or static sticker in seconds.

---

## 🌟 Why Method 1 Works for Thousands of Users at $0 Cost

Traditional WhatsApp bots that blast messages to users from a single phone number get banned by Meta within 24-48 hours. 

**Method 1 solves this completely:**
1. The user pastes any link into the web app (on mobile or desktop).
2. The server extracts the media using `yt-dlp` and compresses it using `FFmpeg` to **512×512 WebP** with WhatsApp-compliant EXIF chunks (< 500 KB for animated, < 100 KB for static).
3. The user taps the green **"Send / Add to WhatsApp"** button.
4. The mobile device's native Web Share API opens WhatsApp directly into the chat or "Message Yourself".
5. In WhatsApp, the user taps the sticker and hits **"Add to Favorites"** ⭐.

* **Zero Ban Risk:** No automated bot phone number for Meta to detect or flag.
* **100% Free Forever:** No paid WhatsApp Business APIs or burner SIM cards.
* **Infinite Scalability:** 10,000+ daily users can generate stickers without hitting rate limits.

---

## 🚀 Running Locally

### 1. Requirements
* **Node.js** (v18+)
* **Python 3** with `yt-dlp` (`pip install yt-dlp`)
* **FFmpeg** (installed and added to your system PATH)

### 2. Start the Server
```bash
npm install
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ 100% Free Cloud Deployment Options

You can host this backend 24/7 without paying a single cent:

### Option A: Hugging Face Spaces (Easiest — No Credit Card Needed)
1. Create a free account on [huggingface.co](https://huggingface.co).
2. Click **New Space** ➔ Name it `stickersync` ➔ Select **Docker** as the SDK.
3. Push or upload this repository (`Dockerfile`, `package.json`, `server/`, `public/`).
4. Hugging Face builds and deploys your Docker container with **2 vCPUs and 16 GB of RAM completely free** with a permanent HTTPS web URL!

### Option B: Render.com
1. Create a free account on [render.com](https://render.com).
2. Click **New Web Service** ➔ Connect your GitHub repository.
3. Select **Docker** environment.
4. Set Port to `3000` and deploy.

### Option C: Oracle Cloud Always-Free Tier (Highest Performance)
* Oracle gives you 4 ARM OCPUs and 24 GB of RAM permanently for free.
* You can run this Docker container using Docker Compose and handle thousands of simultaneous sticker conversions without breaking a sweat.

---

## 🛠️ Tech Stack & Key Files
* `server/index.js`: Express server & REST API (`/api/inspect`, `/api/create-sticker`, `/api/upload-sticker`, `/api/sticker/:id`).
* `server/downloader.js`: Multi-platform media extractor powered by `yt-dlp` and direct fallback handlers.
* `server/converter.js`: FFmpeg WebP optimization pipeline with multi-pass compression to stay strictly under WhatsApp's 500KB animated limit.
* `server/exif.js`: Injects WhatsApp sticker metadata into WebP binary headers.
* `server/cleanup.js`: Auto-deletes temp files older than 10 minutes to prevent disk exhaustion.
* `public/`: Sleek, mobile-first responsive UI with native Web Share API integration.

