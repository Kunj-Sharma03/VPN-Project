const { expect } = require('chai');
const path = require('path');
const fs = require('fs');
const { performOCR, performClipboardOCR } = require('../ocr-handler');

describe('OCR Module Tests', () => {

  it('should extract text from sample image', async () => {
    const sampleImage = path.join(__dirname, '..', 'assets', 'sample.jpg');
    const result = await performOCR(sampleImage);
    expect(result).to.be.a('string');
    expect(result.length).to.be.greaterThan(0);
  });

  it('should throw error for non-existent file', async () => {
    try {
      await performOCR('nonexistent.jpg');
    } catch (err) {
      expect(err).to.exist;
      expect(err.message).to.include('ENOENT');
    }
  });

  it('should return error if clipboard is empty', async () => {
    try {
      await performClipboardOCR();
    } catch (err) {
     expect(err.message).to.match(/Clipboard does not contain an image|Cannot read/i);
    }
  });

  it('should calculate OCR accuracy (example)', () => {
    const expected = 'Hello World';
    const actual = 'H3llo Wor1d';
    const accuracy = calculateAccuracy(expected, actual);
    expect(accuracy).to.be.below(100);
  });

});

// Helper
function calculateAccuracy(expected, actual) {
  const distance = levenshtein(expected, actual);
  return ((expected.length - distance) / expected.length) * 100;
}

function levenshtein(a, b) {
  const dp = Array(a.length + 1).fill().map(() => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }

  return dp[a.length][b.length];
}
