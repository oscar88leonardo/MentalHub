'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { HuddleClient, HuddleProvider } from '@huddle01/react';

type ToasterProps = {
  children: React.ReactNode;
};

const HuddleContextProvider: React.FC<ToasterProps> = ({ children }) => {
  const huddleClient = new HuddleClient({
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID ?? '',
  });

  return <HuddleProvider client={huddleClient}>{children}</HuddleProvider>;
};
export default HuddleContextProvider;
