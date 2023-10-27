import { HuddleIframe } from "@huddle01/iframe";


const iframeConfig = {
    roomUrl: "https://iframe.huddle01.com/mwi-axtm-zzy",
    height: "600px",
    width: "50%",
    noBorder: false, // false by default
};

export default function iframe() {
    return (
        
        <div>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <HuddleIframe config={iframeConfig}/>
        </div>              
    );
};
