import Head from "next/head";
import NFTColMembers from "../MentalComponents/NFTColMembers.tsx";
import React, { useEffect, useRef, useState } from "react";

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
