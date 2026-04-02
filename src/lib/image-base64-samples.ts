const BASE64_IMAGE_PREFIX = /^data:image\/[a-zA-Z0-9.+-]+;base64,/i;
const BASE64_BODY_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;

const BMP_WIDTH = 512;
const BMP_HEIGHT = 512;
const BMP_HEADER_SIZE = 54;
const BMP_BYTES_PER_PIXEL = 3;
const BMP_ROW_SIZE = Math.ceil((BMP_WIDTH * BMP_BYTES_PER_PIXEL) / 4) * 4;
const BMP_IMAGE_SIZE = BMP_ROW_SIZE * BMP_HEIGHT;
const BMP_FILE_SIZE = BMP_HEADER_SIZE + BMP_IMAGE_SIZE;

function writeUInt16LE(buffer: Uint8Array, offset: number, value: number) {
  buffer[offset] = value & 0xff;
  buffer[offset + 1] = (value >> 8) & 0xff;
}

function writeUInt32LE(buffer: Uint8Array, offset: number, value: number) {
  buffer[offset] = value & 0xff;
  buffer[offset + 1] = (value >> 8) & 0xff;
  buffer[offset + 2] = (value >> 16) & 0xff;
  buffer[offset + 3] = (value >> 24) & 0xff;
}

function toBase64(bytes: Uint8Array) {
  let binary = '';
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function randomChannel(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomColor() {
  return {
    r: randomChannel(20, 220),
    g: randomChannel(20, 220),
    b: randomChannel(20, 220),
  };
}

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function mixColor(
  base: { r: number; g: number; b: number },
  target: { r: number; g: number; b: number },
  ratio: number
) {
  return {
    r: clampChannel(base.r + (target.r - base.r) * ratio),
    g: clampChannel(base.g + (target.g - base.g) * ratio),
    b: clampChannel(base.b + (target.b - base.b) * ratio),
  };
}

function setPixel(bytes: Uint8Array, x: number, y: number, color: { r: number; g: number; b: number }) {
  const rowOffset = BMP_HEADER_SIZE + y * BMP_ROW_SIZE;
  const pixelOffset = rowOffset + x * BMP_BYTES_PER_PIXEL;
  bytes[pixelOffset] = color.b;
  bytes[pixelOffset + 1] = color.g;
  bytes[pixelOffset + 2] = color.r;
}

function fillRect(
  bytes: Uint8Array,
  startX: number,
  startY: number,
  width: number,
  height: number,
  color: { r: number; g: number; b: number }
) {
  const endX = Math.min(BMP_WIDTH, startX + width);
  const endY = Math.min(BMP_HEIGHT, startY + height);

  for (let y = Math.max(0, startY); y < endY; y++) {
    for (let x = Math.max(0, startX); x < endX; x++) {
      setPixel(bytes, x, y, color);
    }
  }
}

function createBmpBase64() {
  const bytes = new Uint8Array(BMP_FILE_SIZE);
  const baseColor = randomColor();
  const accentColor = randomColor();
  const highlightColor = mixColor(baseColor, { r: 255, g: 255, b: 255 }, 0.35);
  const stripeWidth = randomChannel(36, 96);
  const stripeOffset = randomChannel(0, stripeWidth - 1);
  const bandHeight = randomChannel(80, 180);
  const bandTop = randomChannel(40, BMP_HEIGHT - bandHeight - 40);
  const blockCount = randomChannel(3, 6);

  bytes[0] = 0x42;
  bytes[1] = 0x4d;
  writeUInt32LE(bytes, 2, BMP_FILE_SIZE);
  writeUInt32LE(bytes, 10, BMP_HEADER_SIZE);
  writeUInt32LE(bytes, 14, 40);
  writeUInt32LE(bytes, 18, BMP_WIDTH);
  writeUInt32LE(bytes, 22, BMP_HEIGHT);
  writeUInt16LE(bytes, 26, 1);
  writeUInt16LE(bytes, 28, 24);
  writeUInt32LE(bytes, 34, BMP_IMAGE_SIZE);

  for (let y = 0; y < BMP_HEIGHT; y++) {
    const verticalRatio = y / (BMP_HEIGHT - 1);
    const rowColor = mixColor(baseColor, highlightColor, verticalRatio * 0.45);

    for (let x = 0; x < BMP_WIDTH; x++) {
      let pixelColor = rowColor;
      const stripeIndex = Math.floor((x + stripeOffset) / stripeWidth);
      if (stripeIndex % 2 === 0) {
        pixelColor = mixColor(rowColor, accentColor, 0.18);
      }

      setPixel(bytes, x, y, pixelColor);
    }
  }

  fillRect(bytes, 0, bandTop, BMP_WIDTH, bandHeight, mixColor(accentColor, { r: 0, g: 0, b: 0 }, 0.25));

  for (let i = 0; i < blockCount; i++) {
    const blockColor = randomColor();
    const blockWidth = randomChannel(48, 120);
    const blockHeight = randomChannel(48, 120);
    const blockX = randomChannel(0, BMP_WIDTH - blockWidth);
    const blockY = randomChannel(0, BMP_HEIGHT - blockHeight);
    fillRect(bytes, blockX, blockY, blockWidth, blockHeight, mixColor(blockColor, accentColor, 0.3));
  }

  return toBase64(bytes);
}

export function getRandomImageBase64Sample() {
  return createBmpBase64();
}

export function isBase64ImageValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  if (BASE64_IMAGE_PREFIX.test(trimmed)) {
    return true;
  }

  const normalized = trimmed.replace(/\s+/g, '');
  return normalized.length >= 100 && normalized.length % 4 === 0 && BASE64_BODY_PATTERN.test(normalized);
}

export function normalizeBase64ImageValue(value: string) {
  const trimmed = value.trim();
  const withoutPrefix = BASE64_IMAGE_PREFIX.test(trimmed)
    ? trimmed.replace(BASE64_IMAGE_PREFIX, '')
    : trimmed;

  return withoutPrefix.replace(/\s+/g, '');
}
