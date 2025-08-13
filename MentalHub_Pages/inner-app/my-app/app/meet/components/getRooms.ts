"use server";

import { API } from '@huddle01/server-sdk/api';
 

export const getRooms = async () => {
  const api = new API({
    apiKey: process.env.API_KEY!,
  });
 
const rooms = await api.getRooms();

if (rooms && !rooms.error && rooms.data) {
  console.log(rooms.data.rooms);
  return rooms.data.rooms;
} else {
  console.log('Error fetching rooms:', rooms?.error);
  return [];
}
};