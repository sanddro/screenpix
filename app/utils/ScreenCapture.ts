// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import gifshot from 'gifshot';
import { remote as electron, desktopCapturer, Point } from 'electron';
import { getDisplaysSize } from './window';

async function base64ToImg(base64String: string): Promise<HTMLImageElement> {
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.src = base64String;
  });
}

async function concatDisplayImages(displayImages: any[]): Promise<string> {
  const displaysSize = getDisplaysSize(displayImages.map(el => el.display));

  const canvas = document.createElement('canvas');

  const ctx: any = canvas.getContext('2d');

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

    const source: any = sources.find(
      s => String(s.display_id) === String(display.id)
    );

    displayImages.push({ display, dataURL: source.thumbnail.toDataURL() });
  }

  const full = await concatDisplayImages(displayImages);

  return full;
}

export function resizeDataURL(
  fullImg: HTMLImageElement,
  x: number,
  y: number,
  wantedWidth: number,
  wantedHeight: number
) {
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

export function downloadBase64Image(base64String: string, name: string) {
  const link = document.createElement('a');
  link.href = base64String;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getColorFromImage(img: HTMLImageElement, p: Point) {
  const canvas: any = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
  const pixelData = canvas.getContext('2d').getImageData(p.x - 1, p.y - 1, 1, 1)
    .data;
  return Array.from(pixelData)
    .map((a: any) => a.toString(16))
    .slice(0, -1)
    .join('')
    .toUpperCase();
}

export class GifCapturer {
  private stream: MediaStream | null = null;

  private videoElement: HTMLVideoElement | null = null;

  private chunks: any[] = [];

  private x = 0;

  private y = 0;

  private width = 0;

  private height = 0;

  private async getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
      types: ['screen']
    });
    return inputSources[0];
  }

  private async getMediaStream() {
    const source = await this.getVideoSources();

    return (navigator as any).mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: source.id
        }
      }
    });
  }

  private async base64toImage(base64String: string): Promise<HTMLImageElement> {
    return new Promise(resolve => {
      const image = document.createElement('img');
      image.onload = () => resolve(image);
      image.src = base64String;
    });
  }

  private async createGif(images: any, size: any) {
    return new Promise(resolve => {
      gifshot.createGIF(
        {
          images,
          gifWidth: size.width,
          gifHeight: size.height,
          interval: 0,
          frameDuration: 2,
          numWorkers: 1
        },
        (obj: any) => {
          resolve(obj.image);
        }
      );
    });
  }

  public async startGifRecording(
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.stream = await this.getMediaStream();

    this.videoElement = document.createElement('video');
    this.videoElement.muted = true;

    this.chunks = [];

    const canvas = document.createElement('canvas');
    const ctx: CanvasRenderingContext2D = canvas.getContext(
      '2d'
    ) as CanvasRenderingContext2D;

    this.videoElement.onloadedmetadata = () => {
      canvas.width = width;
      canvas.height = height;
    };

    this.videoElement.srcObject = this.stream;
    this.videoElement.play();

    this.videoElement.ontimeupdate = () => {
      if (!this.videoElement) return;

      ctx.drawImage(
        this.videoElement as HTMLVideoElement,
        x,
        y,
        width,
        height,
        0,
        0,
        width,
        height
      );

      this.chunks.push(canvas.toDataURL('image/png'));
    };
  }

  public async stopGifRecording() {
    const tracks = this.stream?.getVideoTracks();
    tracks?.forEach(track => {
      track.stop();
    });

    (this.videoElement as HTMLVideoElement).srcObject = null;
    this.videoElement = null;

    const chunkImages = [];
    for (const chunk of this.chunks) {
      const img = await this.base64toImage(chunk);
      chunkImages.push(img);
    }

    console.log('creating gif started', chunkImages.length);
    const gifDataUrl: any = await this.createGif(chunkImages, {
      width: this.width,
      height: this.height
    });
    console.log('creating gif ended');

    return gifDataUrl;
  }
}
