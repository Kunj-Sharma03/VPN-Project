const { createWorker } = require('tesseract.js');
const fs = require('fs');
const { clipboard } = require('electron');
const path = require('path');
const os = require('os');

const tempPath = path.join(os.tmpdir(), 'clipboard-ocr.png');

/**
 * Generic OCR function supporting language input
 */
async function performOCR(imagePath, lang = 'eng') {
  const worker = await createWorker(lang);
  try {
    const { data: { text } } = await worker.recognize(imagePath);
    return text;
  } finally {
    await worker.terminate();
  }
}

/**
 * Extract image from clipboard, save to temp, and perform OCR
 */
async function performClipboardOCR(customPath = tempPath, lang = 'eng') {
  const image = clipboard.readImage();
  if (image.isEmpty()) {
    throw new Error('Clipboard does not contain an image.');
  }

  try {
    fs.writeFileSync(customPath, image.toPNG());
    return await performOCR(customPath, lang);
  } catch (err) {
    throw new Error(`Failed to read image from clipboard: ${err.message}`);
  }
}

module.exports = {
  performOCR,
  performClipboardOCR
};
