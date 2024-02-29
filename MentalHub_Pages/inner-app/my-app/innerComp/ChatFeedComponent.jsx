/** Install our components package and import in your app */
import { Chat } from "@orbisclub/components";
import "@orbisclub/components/dist/index.modern.css";

/** Use the Chat component wherever you want in your app */
function ChatFeedComponent() {
  return <Chat 
            theme="kjzl6cwe1jw1479ltw1g0meo1ape13o8nmwtpvgijj4k6xp38mu2ggt3lcoh0z1" 
            context="kjzl6cwe1jw145tfkxdfwwsuv7dn9fn8x5m1r1zgq1t9q92oaysc6o83cstzl4r" />;
}

export default ChatFeedComponent;