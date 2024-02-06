import { Metadata } from 'next'
//import Image from "next/image";
import Roadmap from "../innerComp/Roadmap";
import Vision from "../innerComp/Vision";
import Descritpion from "../innerComp/Description";



export const metadata: Metadata = {
  title: 'Innerverse',
  description: "A platform to help with your mental health care"
}
 
export default function Home() {
  return(
    <div>
       <Vision />
       <Descritpion />
       <Roadmap />
    </div>
  )
}