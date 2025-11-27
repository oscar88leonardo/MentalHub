export type RoomInfo = { id: string; roomId: string };

export interface OpenRoomParams {
  tokenId?: string | number | null;
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
  const { tokenId, scheduleId, start, end, defaultRoomId, selectedRoomId, rooms, openMeet, optimistic = true } = p;

  const now = new Date();
  if (!(now >= start && now <= end)) throw new Error("TIME_WINDOW");
  if (tokenId == null || tokenId === "") throw new Error("NO_TOKEN");

  const roomId = resolveRoomId(defaultRoomId, selectedRoomId, rooms);

  const doCall = () =>
    fetch("/api/callsetsession", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokenId: String(tokenId), scheduleId, state: 2 }),
    });

  if (optimistic) {
    openMeet(roomId);
    const txPromise = doCall().catch(() => {});
    // @ts-expect-error: txPromise puede ser undefined si se suprime por catch
    return { roomId, txPromise };
  } else {
    const res = await doCall();
    if (!res.ok) throw new Error("API_ERROR");
    openMeet(roomId);
    return { roomId };
  }
}





