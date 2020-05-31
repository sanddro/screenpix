/* eslint-disable */
import { remote as electron, desktopCapturer } from 'electron';

// global.html2canvas = (canvas, obj) => {
//   obj.onrendered(canvas);
// };

const getDisplay = id => {
  return electron.screen.getPrimaryDisplay();
  return electron.screen.getAllDisplays().find(item => item.id === id);
};

async function getStream() {
  const sources = await desktopCapturer.getSources({
    types: ['screen']
  });

  const display = getDisplay();

  const mainScreenSource = sources[0];

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: mainScreenSource.id,
        minWidth: display.bounds.width,
        maxWidth: display.bounds.width,
        minHeight: display.bounds.height,
        maxHeight: display.bounds.height
      }
    }
  });
  return stream;
}

async function handleStream(stream) {
  const video = document.createElement('video');
  video.srcObject = stream;
  video.onloadedmetadata = e => video.play();
  return new Promise(resolve => {
    video.addEventListener('playing', () => {
      resolve(video);
    });
  });
}

const capture = async video => {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/jpeg', 1.0);
};

export default async function takeScreenshot() {
  const stream = await getStream();
  const video = await handleStream(stream);
  return await capture(video);
}

export function resizeDataURL(img, x, y, wantedWidth, wantedHeight) {
  if (!img) return null;

  const canvas = document.createElement('canvas');

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  canvas.width = wantedWidth;
  canvas.height = wantedHeight;

  ctx.drawImage(
    img,
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
