"use server";

import { API } from '@huddle01/server-sdk/api';
 

export const getRooms = async () => {
  const api = new API({
    apiKey: process.env.API_KEY!,
  });
 
  const rooms = await api.getRooms();
 
  console.log(rooms?.data);
 
  return rooms?.data;
};