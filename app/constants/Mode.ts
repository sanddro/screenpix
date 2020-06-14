import { remote } from 'electron';

function isMain(): boolean {
  return process && (!process.type || process.type !== 'renderer');
}

export function getMode(): Mode {
  return isMain()
    ? (global as any).shared.mode
    : remote.getGlobal('shared').mode;
}

export function setMode(mode: Mode) {
  if (isMain()) (global as any).shared.mode = mode;
  else remote.getGlobal('shared').mode = mode;
}

export enum Mode {
  colorPicker,
  screenshot,
  gif
}
