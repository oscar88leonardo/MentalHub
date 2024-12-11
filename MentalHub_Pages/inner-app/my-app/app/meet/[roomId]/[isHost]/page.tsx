'use client';

import ChatBox from '../../components/ChatBox/ChatBox';
import RemotePeer from '../../components/RemotePeer';
import { TPeerMetadata } from '../../utils/types';
import { Video } from '@huddle01/react/components';
import {
  useLocalAudio,
  useLocalPeer,
  useLocalScreenShare,
  useLocalVideo,
  usePeerIds,
  useRoom,
} from '@huddle01/react/hooks';
import { Inter } from 'next/font/google';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function Home({ params }: { params: { roomId: string; isHost: string } }) {
  const [displayName, setDisplayName] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const router = useRouter();

  const { joinRoom, leaveRoom, state } = useRoom({
    onJoin: (room) => {
      console.log('onJoin', room);
      updateMetadata({ displayName });
    },
    onPeerJoin: (peer) => {
      console.log('onPeerJoin', peer);
    },
  });
  const { enableVideo, isVideoOn, stream, disableVideo } = useLocalVideo();
  const { enableAudio, disableAudio, isAudioOn } = useLocalAudio();
  const { startScreenShare, stopScreenShare, shareStream } = useLocalScreenShare();
  const { updateMetadata } = useLocalPeer<TPeerMetadata>();
  const { peerIds } = usePeerIds();

  const getToken = async () => {
    const tokenResponse = await fetch(`/meet/token?isHost=${params.isHost}&roomId=${params.roomId}`);
    const token = await tokenResponse.text();
    return token;
  };

  return (
    <main className={`min-h-screen p-4 ${inter.className}`}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-center">Video Conference</h1>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Room Status: <span className="font-semibold">{state}</span>
          </p>
        </header>

        <div className="space-y-8">
          <div className="w-full">
            <div className="mb-4">
              {state === 'idle' ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <input
                    disabled={state !== 'idle'}
                    placeholder="Display Name"
                    type="text"
                    className="w-full sm:w-auto border-2 border-blue-400 rounded-lg p-2 bg-black text-white"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                  />
                  <button
                    disabled={!displayName}
                    type="button"
                    className="w-full sm:w-auto bg-blue-500 p-2 rounded-lg text-white disabled:opacity-50"
                    onClick={async () => {
                      const token = await getToken();
                      await joinRoom({
                        roomId: params.roomId as string,
                        token,
                      });
                    }}
                  >
                    Join Room
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    className="bg-blue-500 p-2 rounded-lg text-white"
                    onClick={async () => {
                      isVideoOn ? await disableVideo() : await enableVideo();
                    }}
                  >
                    {isVideoOn ? 'Disable Video' : 'Enable Video'}
                  </button>
                  <button
                    type="button"
                    className="bg-blue-500 p-2 rounded-lg text-white"
                    onClick={async () => {
                      isAudioOn ? await disableAudio() : await enableAudio();
                    }}
                  >
                    {isAudioOn ? 'Disable Audio' : 'Enable Audio'}
                  </button>
                  <button
                    type="button"
                    className="bg-blue-500 p-2 rounded-lg text-white"
                    onClick={async () => {
                      shareStream ? await stopScreenShare() : await startScreenShare();
                    }}
                  >
                    {shareStream ? 'Stop Sharing' : 'Share Screen'}
                  </button>
                  <button
                    type="button"
                    className="bg-blue-500 p-2 rounded-lg text-white"
                    onClick={async () => {
                      const status = isRecording
                        ? await fetch(`/meet/stopRecording?roomId=${params.roomId}`)
                        : await fetch(`/meet/startRecording?roomId=${params.roomId}`);

                      const data = await status.json();
                      console.log({ data });
                      setIsRecording(!isRecording);
                    }}
                  >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </button>
                  <button
                    type="button"
                    className="bg-red-500 p-2 rounded-lg text-white"
                    onClick={async () => {
                      await leaveRoom();
                      router.push(`/profile`);
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stream && (
                <div className="border-2 rounded-xl border-blue-400 overflow-hidden">
                  <Video stream={stream} className="w-full h-full object-cover" />
                </div>
              )}
              {shareStream && (
                <div className="border-2 rounded-xl border-blue-400 overflow-hidden">
                  <Video stream={shareStream} className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {peerIds.map((peerId) => (peerId ? <RemotePeer key={peerId} peerId={peerId} /> : null))}
            </div>
          </div>

          {state === 'connected' && (
            <div className="w-full max-w-3xl mx-auto">
              <ChatBox />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}






