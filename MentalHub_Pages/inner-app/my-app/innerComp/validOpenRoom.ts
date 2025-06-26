// method to open a meeting room in a new tab
import { openMeet } from "./myMeet";

export const validateOpenMeet = (roomId: string, dateInit: Date, dateFinish: Date) => {
  const now = new Date();
  if (now >= dateInit && now <= dateFinish) {
    openMeet(roomId);
  } else {
    alert("The room only available on scheduled dates.");
  }
};