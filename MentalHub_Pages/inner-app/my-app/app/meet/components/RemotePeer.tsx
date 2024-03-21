'use client';

import { Audio, Video } from '@huddle01/react/components';
import {
  useRemoteAudio,
  useRemoteScreenShare,
  useRemoteVideo,
} from '@huddle01/react/hooks';
import React, { useEffect, useRef } from 'react';

type Props = {
  peerId: string;
};

const RemotePeer = ({ peerId }: Props) => {
  const { stream } = useRemoteVideo({ peerId });
  const { stream: audioStream, state: audioState } = useRemoteAudio({ peerId });
  const { videoStream: screenVideo, audioStream: screenAudio } =
    useRemoteScreenShare({ peerId });

  return (
    <div className='flex flex-col gap-2'>
      {stream && (
        <Video
          stream={stream}
          className='border-2 rounded-xl border-white-400 aspect-video'
        />
      )}
      {screenVideo && (
        <Video
          stream={screenVideo}
          className='border-2 rounded-xl border-white-400 aspect-video'
        />
      )}
      {audioStream && <Audio stream={audioStream} />}
      {screenAudio && <Audio stream={screenAudio} />}
    </div>
  );
};

export default React.memo(RemotePeer);
