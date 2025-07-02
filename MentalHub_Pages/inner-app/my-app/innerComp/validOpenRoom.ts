// method to open a meeting room in a new tab
import { openMeet } from "./myMeet";


export const validateOpenMeet = (context: any,id: string, room:string, roomId: string, dateInit: Date, dateFinish: Date, profileId: string, createDate: Date, nft: string, NFT_CONTRACT_ADDRESS: string) => {

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
    executeQuery(strMutation).then(getInnerProfile());
    //getInnerProfile();
    console.log("Profile update: ", innerProfile);
    openMeet(roomId);
  } else {
    alert("The room only available on scheduled dates.");
  }
};