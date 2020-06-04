import electron from 'electron';

export function writeImageToClipboard(base64String) {
  electron.clipboard.writeImage(
    electron.nativeImage.createFromDataURL(base64String)
  );
}

export function writeTextToClipboard(text) {
  electron.clipboard.writeText(text);
}
