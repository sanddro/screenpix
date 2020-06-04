import { remote as electron, desktopCapturer } from 'electron';
import { getDisplaysSize } from './window';

async function base64ToImg(base64String) {
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.src = base64String;
  });
}

async function concatDisplayImages(displayImages) {
  const displaysSize = getDisplaysSize(displayImages.map(el => el.display));

  const canvas = document.createElement('canvas');

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  canvas.width = displaysSize.width;
  canvas.height = displaysSize.height;

  for (const elem of displayImages) {
    ctx.drawImage(
      await base64ToImg(elem.dataURL),
      elem.display.bounds.x,
      elem.display.bounds.y
    );
  }

  return canvas.toDataURL('image/png');
}

export default async function takeScreenshot() {
  const displays = electron.screen.getAllDisplays();

  const displayImages = [];

  for (const display of displays) {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: {
        height: display.bounds.height,
        width: display.bounds.width
      }
    });

    const source = sources.find(
      s => String(s.display_id) === String(display.id)
    );

    displayImages.push({ display, dataURL: source.thumbnail.toDataURL() });
  }

  const full = await concatDisplayImages(displayImages);

  return full;
}

export function resizeDataURL(fullImg, x, y, wantedWidth, wantedHeight) {
  if (!fullImg) return null;

  const canvas = document.createElement('canvas');

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  canvas.width = wantedWidth;
  canvas.height = wantedHeight;

  ctx.drawImage(
    fullImg,
    x,
    y,
    wantedWidth,
    wantedHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );
  return canvas.toDataURL('image/png');
}

export function downloadBase64Image(base64String) {
  const link = document.createElement('a');
  link.href = base64String;
  link.download = 'Screenshot.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getColorFromImage(img, p) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
  const pixelData = canvas.getContext('2d').getImageData(p.x - 1, p.y - 1, 1, 1)
    .data;
  return Array.from(pixelData)
    .map(a => a.toString(16))
    .slice(0, -1)
    .join('')
    .toUpperCase();
}
