// method to open a meeting room in a new tab
import { openMeet } from "./myMeet";


export const validateOpenMeet = (context: any,id: string, room:string, roomId: string, dateInit: Date, dateFinish: Date, profileId: string, createDate: Date, nft: string, NFT_CONTRACT_ADDRESS: string) => {

  interface UpdateScheduleResponse {
      data?: {
        updateSchedule?: {
          document?: {
            id: string;
          };
        };
      };
    }

    interface CallSetSessionBody {
      tokenId: string;
      scheduleId: string;
      state: number;
      // agrega aquí otros parámetros que necesites
    }

  console.log("Context: ", context);
  if (context === null) {
    throw new Error("useContext must be used within a provider");
  } 
  const { innerProfile,getInnerProfile, executeQuery } = context;
  console.log("Inner Profile: ", innerProfile);
  const now = new Date();
  if (now >= dateInit && now <= dateFinish) {
    let strMutation = '';
    strMutation = `
      mutation {
        updateSchedule(
          input: {id: "${id}", content: {date_init: "${dateInit.toISOString()}", date_finish: "${dateFinish.toISOString()}", profileId: "${profileId}", created: "${createDate.toISOString()}", edited: "${now.toISOString()}", state: Active, huddId: "${room}", NFTContract: "${NFT_CONTRACT_ADDRESS}", TokenID: ${nft}}}
        ) {
          document {
            id
          }
        }
      }
      `;
    console.log("Mutation validopen: ", strMutation);

    executeQuery(strMutation).then((response: UpdateScheduleResponse) => {
      if (
        response &&
        response.data &&
        response.data.updateSchedule &&
        response.data.updateSchedule.document
      ) {
        const body: CallSetSessionBody = {
          tokenId: nft,
          scheduleId: response.data.updateSchedule.document.id,
          state: 2,
          // agrega aquí otros parámetros que necesites
        };
        fetch("/api/callsetsession", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }).then((callSetSessionRes: Response) => {
          const callSetSessionData: Promise<any> = callSetSessionRes.json();
          console.log("Respuesta de /api/callsetsession:", callSetSessionData);
        });
      } else {
        console.error("Failed to create new schedule.");
      }
      getInnerProfile();
      console.log("Profile update: ", innerProfile);
      openMeet(roomId);
    });
    //getInnerProfile();
  } else {
    alert("The room only available on scheduled dates.");
  }
};