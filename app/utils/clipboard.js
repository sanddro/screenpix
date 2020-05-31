import electron from 'electron';

export default function writeToClipboard(base64String) {
  electron.clipboard.writeImage(
    electron.nativeImage.createFromDataURL(base64String)
  );
}
