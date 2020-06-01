/* eslint-disable */
import { remote as electron, desktopCapturer } from 'electron';

export default async function takeScreenshot() {
  const displays = electron.screen.getAllDisplays();

  const dataURLs = [];

  for (const display of displays) {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: {
        height: display.bounds.height,
        width: display.bounds.width
      }
    });

    const source = sources.find(source => source.display_id == display.id);
    dataURLs.push(source.thumbnail.toDataURL());
  }

  return dataURLs[0];
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
    wantedWidth,
    wantedHeight
  );
  return canvas.toDataURL('image/jpeg', 1.0);
}
