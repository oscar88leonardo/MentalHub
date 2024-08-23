import { TPeerMetadata } from '../../utils/types';
import { useRemotePeer } from '@huddle01/react/hooks';
import { TMessage } from './ChatBox';

interface Props {
  message: TMessage;
}

function RemoteMessageBubble({ message }: Props) {
  const { metadata } = useRemotePeer<TPeerMetadata>({ peerId: message.sender });

  return (
    <div className='items-start bg-gray-800 w-fit px-2 py-1 rounded-lg flex flex-col'>
      <span className='text-blue-400 text-md'>{metadata?.displayName}</span>
      <span className='text-white text-sm'>{message.text}</span>
    </div>
  );
}

export default RemoteMessageBubble;
