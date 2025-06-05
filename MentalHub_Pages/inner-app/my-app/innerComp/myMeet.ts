// method to open a meeting room in a new tab

export  const openMeet = (roomId:string) => {
    //console.log("OPENING ROOM" )
    window.open(`https://innerverse.huddle01.app/room/${roomId}`, "_blank", 'noopener,noreferrer');
  };