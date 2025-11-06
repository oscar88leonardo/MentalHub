import { NextRequest, NextResponse } from 'next/server';

type HuddleCreateRoomResponse = {
  data?: {
    roomId?: string;
    meetingLink?: string;
  };
  message?: string;
};

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.HUDDLE_API_KEY || process.env.NEXT_PUBLIC_HUDDLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'HUDDLE_API_KEY no configurada' }, { status: 500 });
    }

    let title = 'Innerverse Room';
    try {
      const body = await request.json();
      if (body?.title && typeof body.title === 'string') {
        title = body.title;
      }
    } catch {}

    const huddleResponse = await fetch('https://api.huddle01.com/api/v2/platform/rooms/create-room', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hostDetails: [],
        roomLocked: true,
        guestAllowed: true,
        roomType: 'video',
        title,
      }),
    });

    const data = (await huddleResponse.json()) as HuddleCreateRoomResponse;

    if (!huddleResponse.ok || !data?.data?.roomId) {
      return NextResponse.json(
        { error: 'No se pudo crear la sala', details: data },
        { status: 500 }
      );
    }

    return NextResponse.json({
      roomId: data.data.roomId,
      meetingLink: data.data.meetingLink,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno', details: String(error) }, { status: 500 });
  }
}


