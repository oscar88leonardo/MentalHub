// method to open a meeting room in a new tab
import { openMeet } from "./myMeet";
import { AppContext } from "../context/AppContext";
import { useContext } from "react";

export const validateOpenMeet = (id: string, roomId: string, dateInit: Date, dateFinish: Date, profileId: string, createDate: Date, nft: string, NFT_CONTRACT_ADDRESS: string) => {

   // get global data from Appcontext
  const context = useContext(AppContext);
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
          input: {id: "${id}", content: {date_init: "${dateInit.toISOString()}", date_finish: "${dateFinish.toISOString()}", profileId: "${profileId}", created: "${createDate.toISOString()}", edited: "${now.toISOString()}", state: Active, huddId: "${roomId}", NFTContract: "${NFT_CONTRACT_ADDRESS}", TokenID: ${nft}}}
        ) {
          document {
            id
          }
        }
      }
      `;
    console.log("Mutation validopen: ", strMutation);
    executeQuery(strMutation);
    getInnerProfile();
    console.log("Profile update: ", innerProfile);
    openMeet(roomId);
  } else {
    alert("The room only available on scheduled dates.");
  }
};