import axios from 'axios';

export const createRoom = async () => {
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
    return roomId;
};   