export type RoomInfo = { id: string; roomId: string };

export interface OpenRoomParams {
  // tokenId removido
  scheduleId: string;
  start: Date;
  end: Date;
  defaultRoomId: string;
  selectedRoomId?: string;
  rooms?: RoomInfo[];
  openMeet: (roomId: string) => void;
  optimistic?: boolean;
}

function resolveRoomId(defaultRoomId: string, selectedRoomId?: string, rooms?: RoomInfo[]) {
  if (selectedRoomId && rooms && rooms.length) {
    const sel = rooms.find(r => r.id === selectedRoomId);
    if (!sel) throw new Error("INVALID_ROOM");
    return sel.roomId;
  }
  return defaultRoomId;
}

export async function openRoomFlowNoCheck(p: OpenRoomParams): Promise<{ roomId: string; txPromise?: Promise<Response> }> {
  const { start, end, defaultRoomId, selectedRoomId, rooms, openMeet } = p;

  const now = new Date();
  if (!(now >= start && now <= end)) throw new Error("TIME_WINDOW");
  
  const roomId = resolveRoomId(defaultRoomId, selectedRoomId, rooms);

  // Abrimos sala directamente
  openMeet(roomId);
  
  // Retornamos promesa resuelta vacía para compatibilidad
  return { roomId, txPromise: Promise.resolve(new Response()) };
}
