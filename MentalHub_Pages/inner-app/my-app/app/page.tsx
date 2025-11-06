import { Metadata } from 'next'
//import Image from "next/image";
import Roadmap from "../innerComp/Roadmap";
import Vision from "../innerComp/Vision";
import Descritpion from "../innerComp/Description";
import FAQs from "../innerComp/FAQs";
/*import NFTcoList from "../innerComp/NFTcoList";*/
import Partners from "../innerComp/Partners";


export const metadata: Metadata = {
  title: 'Innerverse',
  description: "A platform to help with your mental health care"
}
 
export default function Home() {
  return(
    <div>
       <Vision />
       <Descritpion />
       {/*<NFTcoList />*/} 
       <Partners />
       <Roadmap />
       <FAQs />  
    </div>
  )
}