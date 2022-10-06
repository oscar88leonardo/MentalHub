import Head from "next/head";
import NFTColMembers from "../MentalComponents/NFTColMembers";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Mental Hub | A platform to help you with the mental health care</title>
        <meta
          name="Mental Hub"
          content="A platform to help you with the mental health care"
        />
      </Head>
      <NFTColMembers/>
    </div>
  );
}
