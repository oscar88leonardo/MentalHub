import Head from "next/head";
import RoadMapComponent from "../MentalComponents/RoadMap";
import FAQsComponent from "../MentalComponents/FAQs";
import NFTcoList from "../MentalComponents/NFTcoList";
import Partners from "../MentalComponents/Partners";
import Vision from "../MentalComponents/Vision";
import Description from "../MentalComponents/Description";


export default function Home() {
  return (
    <div>
      <Head>
        <title>MentalHub | A platform to help with your mental health care</title>
        <meta
          name="MentalHub"
          content="A platform to help with your mental health care"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Vision />
      <Description />
      <NFTcoList />
      <Partners />
      <RoadMapComponent />
      <FAQsComponent />
    </div>
  );
}
