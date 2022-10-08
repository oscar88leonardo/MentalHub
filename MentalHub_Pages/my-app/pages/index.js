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
        <title>Mental Hub | A platform to help you with the mental health care</title>
        <meta
          name="Mental Hub"
          content="A platform to help you with the mental health care"
        />
        <link rel="icon" href="/favicon.png" />
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
