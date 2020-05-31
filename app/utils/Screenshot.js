/* eslint-disable */
import { remote as electron, desktopCapturer } from 'electron';

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
        maxHeight: display.bounds.height,
        minFrameRate: 60,
        maxFrameRate: 60
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

const capture = async (stream, canvas) => {
  const display = getDisplay();
  const width = display.bounds.width;
  const height = display.bounds.height;

  const track = stream.getVideoTracks()[0];
  const imageCapture = new ImageCapture(track);
  const bitmap = await imageCapture.grabFrame();
  canvas = canvas || document.createElement('canvaas');
  let context = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  clearCanvas(canvas);
  context.drawImage(bitmap, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 1.0);
};

export const clearCanvas = canvas => {
  let context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
};

export default async function takeScreenshot(canvas) {
  const stream = await getStream();
  return await capture(stream, canvas);
}

export function resizeDataURL(fullImgCanvas, x, y, wantedWidth, wantedHeight) {
  if (!fullImgCanvas) return null;

  const canvas = document.createElement('canvas');

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  canvas.width = wantedWidth;
  canvas.height = wantedHeight;

  ctx.drawImage(
    fullImgCanvas,
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
