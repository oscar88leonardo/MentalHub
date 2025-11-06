// Método para abrir una sala de Huddle01 en una nueva pestaña
export const openMeet = (roomId: string) => {
  const url = `https://innerverse.huddle01.app/room/${roomId}`;
  window.open(url, "_blank", "noopener,noreferrer");
};










