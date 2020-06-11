// eslint-disable-next-line import/prefer-default-export
export function timeStampToRecordingTime(ts) {
  if (!ts && ts !== 0) return null;

  let mins = 0;
  let secs = 0;
  let milSecs = 0;

  mins = Math.floor(ts / 60000);
  secs = Math.floor((ts - mins * 60000) / 1000);
  milSecs = Math.floor((ts - mins * 60000 - secs * 1000) / 10);

  const res = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}:${
    milSecs < 10 ? '0' : ''
  }${milSecs}`;

  return res;
}
