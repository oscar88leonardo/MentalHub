//import axios from 'axios';

export const createRoom = async () => {
    
    /*
    const response = await axios.post(
            'https://api.huddle01.com/api/v2/sdk/rooms/create-room',
            {
            roomLocked: false,
            metadata: {
                title: "My Innerverse Room"
            },
            },
            {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.API_KEY!,
            },
            }
        );
    
    const { roomId } = response.data.data;
    */

    if (!process.env.NEXT_PUBLIC_HUDDLE_API_KEY) {
        throw new Error('Huddle API Key no configurada');
    }

    const response = await fetch('https://api.huddle01.com/api/v2/platform/rooms/create-room', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'x-api-key': process.env.NEXT_PUBLIC_HUDDLE_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            hostDetails: [],
            roomLocked: true,
            guestAllowed: true,
            roomType: 'video',
            title: 'Innerverse Room'
        })
    });

    const data = await response.json();
    console.log({data});
    
    if (!data.data?.roomId) {
        throw new Error('No se pudo crear la sala: ' + JSON.stringify(data));
    }

    console.log("RoomId: ", data.data.roomId);
    console.log("Room Link: ", data.data.meetingLink);
    
    return data.data.roomId;
};