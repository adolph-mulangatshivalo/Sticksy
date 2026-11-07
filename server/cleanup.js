import fs from 'fs';
import path from 'path';

/**
 * Sweeps the temporary directory and removes files older than maxAgeMs.
 * Ensures the free-tier server's disk never runs out of space.
 */
export function startPeriodicCleanup(tempDir, maxAgeMs = 10 * 60 * 1000, intervalMs = 2 * 60 * 1000) {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const runCleanup = () => {
    try {
      const now = Date.now();
      const files = fs.readdirSync(tempDir);
      for (const file of files) {
        if (file === '.gitkeep') continue;
        const fullPath = path.join(tempDir, file);
        try {
          const stats = fs.statSync(fullPath);
          if (now - stats.mtimeMs > maxAgeMs) {
            fs.unlinkSync(fullPath);
          }
        } catch (err) {
          // File might have already been deleted or locked
        }
      }
    } catch (err) {
      console.error('Cleanup error:', err.message);
    }
  };

  // Run on start and then periodically
  runCleanup();
  const timer = setInterval(runCleanup, intervalMs);
  return () => clearInterval(timer);
}

