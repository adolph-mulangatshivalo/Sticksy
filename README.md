# Sticksy

> Turn any social media link or file into a WhatsApp sticker in seconds.

**Live Site:** [https://sticksy-kw3v.onrender.com](https://sticksy-kw3v.onrender.com)

Sticksy is a free web app that turns videos, photos, and GIFs into WhatsApp stickers. Paste a link from your favorite social media platform or upload a file from your phone or computer. Trim the exact part you want, crop it, and send it straight to WhatsApp.

---

## Features

- **Link to Sticker:** Works with links from Facebook, Instagram, TikTok, YouTube Shorts, X (Twitter), Pinterest, GIPHY, and Tenor.
- **Direct File Upload:** Upload your own videos, GIFs, or photos (`.mp4`, `.mov`, `.webm`, `.gif`, `.png`, `.jpg`, `.webp`).
- **Video Trimmer:** Use the slider to pick the exact start time and length you want.
- **Filmstrip Preview:** See video thumbnails in the timeline as you drag the slider.
- **Crop & Adjust:** Fit the full video or crop it into a 1:1 square. Adjust speed, quality, and frames per second.
- **WhatsApp Ready:** Automatically compressed to stay under WhatsApp limits (< 500 KB for animated stickers, < 100 KB for static stickers).
- **One-Tap Sharing:** Use the green "Send to WhatsApp" button to open WhatsApp and save the sticker to your favorites.
- **Mobile Friendly & Installable:** Works as a Progressive Web App (PWA). You can install it on your phone home screen and share links to it directly from other apps.
- **Privacy First:** No sign-up required. Your files are temporary and get deleted automatically after 10 minutes.

---

## Supported Platforms

| Platform | Supported Content |
| :--- | :--- |
| **Facebook** | Reels, Videos, Watch, mobile share links (`fb.watch`, `/share/r/`, `/share/v/`) |
| **Instagram** | Reels, Posts, Videos, mobile links |
| **TikTok** | Videos (clean with no watermark), photo slideshows |
| **YouTube** | Shorts, standard videos |
| **X / Twitter** | Video clips, GIFs, photos |
| **Pinterest** | Video pins, photo pins |
| **GIPHY & Tenor** | Animated GIFs and video clips |
| **Direct Media** | Direct web links to `.mp4`, `.gif`, `.png`, `.jpg`, `.webp` |
| **Device Upload** | Files from your phone gallery, camera, or desktop |

---

## How to Use It

1. **Paste a link or upload a file.** Sticksy shows a live preview right away.
2. **Trim and crop.** Pick your favorite few seconds, choose your crop, and adjust speed or quality if needed.
3. **Create and save.** Tap **Create Sticker**. Once ready, tap **Send to WhatsApp** or **Download**.
4. **In WhatsApp:** Tap the sticker in your chat and tap **Add to Favorites** so you can use it anytime.

---

## Running Locally

### Prerequisites

Make sure you have these installed on your computer:

- **Node.js** (version 18 or newer)
- **Python 3**
- **FFmpeg** (installed and added to your system PATH)
- **yt-dlp** (`pip install yt-dlp`)

### Quick Start

1. Clone this repository:
   ```bash
   git clone https://github.com/adolph-mulangatshivalo/Sticksy.git
   cd Sticksy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and go to:
   ```
   http://localhost:3000
   ```

---

## Running with Docker

You can build and run Sticksy inside a Docker container without manually installing FFmpeg or Python on your host machine:

```bash
# Build the image
docker build -t sticksy .

# Run the container
docker run -p 3000:3000 sticksy
```

Open `http://localhost:3000` in your browser.

---

## Deploying to the Cloud for Free

Sticksy is ready to run on any cloud host that supports Docker or Node.js.

### Deploying on Render (Free)

1. Fork or push this repository to your GitHub account.
2. Sign in to [Render](https://render.com) and click **New +** ➔ **Web Service**.
3. Connect your GitHub repository.
4. Select **Docker** as the environment.
5. Set the Port to `3000`.
6. Click **Deploy Web Service**.

### Keeping the Free Server Awake 24/7

Free hosting platforms like Render put services to sleep after 15 minutes of inactivity. Sticksy includes a built-in health check route at `/health`.

To keep your site awake without paying anything:
1. Create a free account at [UptimeRobot](https://uptimerobot.com).
2. Click **Add New Monitor**.
3. Choose **HTTP(s)** monitor type.
4. Enter your URL: `https://your-app-name.onrender.com/health`
5. Set the check interval to **5 or 8 minutes**.
6. Save. UptimeRobot will ping the app regularly so it never sleeps.

---

## Project Structure

```
├── public/                 # Frontend assets (HTML, CSS, JS, PWA icons)
│   ├── index.html          # Main user interface
│   ├── style.css           # Neo-brutalist responsive styling
│   ├── app.js              # Client logic, trimming, Cropper.js, share handler
│   ├── sw.js               # Service worker for offline caching and PWA installs
│   └── manifest.json       # Web app manifest with share-target integration
├── server/                 # Backend API
│   ├── index.js            # Express server, routes, and proxies
│   ├── downloader.js       # Fast extractors for Facebook, Instagram, TikTok, etc.
│   ├── converter.js        # FFmpeg pipeline for GIF and WebP stickers
│   ├── exif.js             # WhatsApp sticker metadata injector
│   └── cleanup.js          # Automatically deletes old temporary files
├── Dockerfile              # Container configuration with FFmpeg, Python, and Node
└── package.json            # Project dependencies and start scripts
```

---

## Privacy & Security

- **No accounts or logins:** You do not need to sign in or share personal information.
- **Zero permanent storage:** Uploaded and converted files are stored in a temporary folder and permanently deleted after 10 minutes.
- **No API keys required:** The app runs without relying on paid third-party API keys.

---

## Author

Created by **Adolph** ([adolphusmulanga723@gmail.com](mailto:adolphusmulanga723@gmail.com)).

## License

This project is licensed under the MIT License.
