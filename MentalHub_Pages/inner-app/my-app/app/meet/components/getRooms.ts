"use server";

import { API } from '@huddle01/server-sdk/api';
 

export const getRooms = async () => {
  const api = new API({
    apiKey: process.env.API_KEY!,
  });
 
const rooms = await api.getRooms();

if (rooms && rooms.count > 0 && rooms.rooms) {
  console.log(rooms.rooms);
  return rooms.rooms;
} else {
  console.log('Error fetching rooms');
  return [];
}
};