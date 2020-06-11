import React, { useState } from 'react';
import { ipcRenderer } from 'electron';
import styles from './GifCapture.scss';
import Toolbar from '../toolbar/Toolbar';
import Dimensions from '../dimensions/Dimensions';
import Resizer, { BorderColor } from '../resizer/Resizer';
import useClickThrough from '../../hooks/ClickThrough';
import { GifCapturer } from '../../utils/ScreenCapture';
import { timeStampToRecordingTime } from '../../utils/Time';

let gifCapturer: any = null;

export default function GifCapture({ onCapture }: any) {
  const [size, setSize]: any = useState(null);
  const [topLeft, setTopLeft]: any = useState(null);
  const [isSelected, setIsSelected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime]: any = useState(null);
  const [recordingTimeInterval, setRecordingTimeInterval]: any = useState();
  const [savingGif, setSavingGif] = useState(false);

  useClickThrough();

  const bottomRight = {
    x: size && topLeft ? topLeft.x + size.width : undefined,
    y: size && topLeft ? topLeft.y + size.height : undefined
  };

  const onResizerChange = (newSize: any, newTopLeft: any) => {
    setSize(newSize);
    setTopLeft(newTopLeft);
  };

  const onSelectStart = () => setIsSelected(false);
  const onSelectedEnd = () => setIsSelected(true);

  const onRecord = async () => {
    setIsRecording(true);
    gifCapturer = new GifCapturer();
    gifCapturer.startGifRecording(
      topLeft.x + 3,
      topLeft.y + 3,
      size.width - 6,
      size.height - 6
    );

    const startDate = new Date();

    setRecordingTime(0);

    setRecordingTimeInterval(
      setInterval(() => {
        setRecordingTime(new Date().getTime() - startDate.getTime());
      }, 100)
    );
  };

  const onStop = async () => {
    if (!isRecording) return;
    setIsRecording(false);
    clearInterval(recordingTimeInterval);
    setSavingGif(true);
    const gif = await gifCapturer.stopGifRecording();
    setSavingGif(false);
    onCapture(gif);
  };

  let borders: any = {
    borderLeftWidth: document.body.offsetWidth / 2,
    borderRightWidth: document.body.offsetWidth / 2,
    borderBottomWidth: document.body.offsetHeight / 2,
    borderTopWidth: document.body.offsetHeight / 2
  };

  if (size && topLeft) {
    borders = {
      borderLeftWidth: topLeft.x,
      borderTopWidth: topLeft.y
    };
    borders.borderRightWidth =
      document.body.offsetWidth - borders.borderLeftWidth - size.width;

    borders.borderBottomWidth =
      document.body.offsetHeight - borders.borderTopWidth - size.height;
  }

  if (savingGif) return <></>;

  return (
    <div className={styles.wrapper} data-click-through={isRecording}>
      <Resizer
        draggable={!isRecording}
        resizable={!isRecording}
        reselectable={!isRecording}
        clickThrough={isRecording}
        onChange={onResizerChange}
        onSelectStart={onSelectStart}
        onSelectEnd={onSelectedEnd}
        borderColor={isRecording ? BorderColor.green : BorderColor.white}
      >
        {size && topLeft && (
          <Dimensions
            width={size?.width}
            height={size?.height}
            topLeft={topLeft}
          />
        )}
        <Toolbar
          hidden={!isSelected}
          width={size?.width}
          height={size?.height}
          bottomRight={bottomRight}
          recordingTime={timeStampToRecordingTime(recordingTime)}
          onRecord={onRecord}
          onStop={onStop}
          showCopy={false}
          showSave={false}
          showRecord={!isRecording}
          showStop={isRecording}
        />
      </Resizer>
    </div>
  );
}
