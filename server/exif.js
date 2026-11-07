import webpmux from 'node-webpmux';

/**
 * Injects WhatsApp-compliant EXIF metadata into a WebP buffer.
 * WhatsApp requires this chunk so it recognizes the file as an interactive sticker
 * and enables "Add to Favorites" and custom pack info.
 *
 * @param {Buffer} webpBuffer - Raw WebP image/animation buffer
 * @param {Object} metadata - Sticker metadata
 * @param {string} [metadata.pack='StickerSync'] - Sticker pack name
 * @param {string} [metadata.author='StickerSync App'] - Creator / publisher name
 * @param {string[]} [metadata.emojis=['🔥', '✨']] - Associated emojis
 * @returns {Promise<Buffer>} - WebP buffer with EXIF chunk embedded
 */
export async function injectWhatsAppExif(webpBuffer, metadata = {}) {
  const packName = (metadata.pack || 'Sticksy Pack').trim();
  const authorName = (metadata.author || 'Sticksy').trim();
  const emojis = Array.isArray(metadata.emojis) && metadata.emojis.length > 0 ? metadata.emojis : ['🔥', '✨'];

  const img = new webpmux.Image();
  await img.load(webpBuffer);

  const jsonPayload = {
    'sticker-pack-id': `com.sticksy.${Date.now()}`,
    'sticker-pack-name': packName,
    'sticker-pack-publisher': authorName,
    'emojis': emojis
  };

  // Standard TIFF Little-Endian Header + IFD structure for WhatsApp sticker EXIF tag 0x5341 ("SA" / sticker metadata)
  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2A, 0x00, // II* (Little-endian TIFF)
    0x08, 0x00, 0x00, 0x00, // Offset to first IFD (8)
    0x01, 0x00,             // Number of directory entries (1)
    0x41, 0x57,             // Tag 'WA' (WhatsApp)
    0x07, 0x00,             // Type: UNDEFINED (7)
    0x00, 0x00, 0x00, 0x00, // Length placeholder (bytes 14-17)
    0x16, 0x00, 0x00, 0x00  // Value offset (22 bytes from start of TIFF header)
  ]);

  const jsonBuff = Buffer.from(JSON.stringify(jsonPayload), 'utf-8');
  const exif = Buffer.concat([exifAttr, jsonBuff]);

  // Write the actual JSON byte length at offset 14 (4 bytes, little-endian)
  exif.writeUInt32LE(jsonBuff.length, 14);

  img.exif = exif;
  return await img.save(null);
}

