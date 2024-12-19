import { AccessToken, Role } from '@huddle01/server-sdk/auth';

export const dynamic = 'force-dynamic';

const getCorsHeaders = (origin: string) => {
  const headers = {
    'Access-Control-Allow-Methods': `${process.env.ALLOWED_METHODS}`,
    'Access-Control-Allow-Headers': `${process.env.ALLOWED_HEADERS}`,
    'Access-Control-Allow-Origin': `${process.env.DOMAIN_URL}`,
  };

  if (!process.env.ALLOWED_ORIGIN || !origin) return headers;

  const allowedOrigins = process.env.ALLOWED_ORIGIN.split(',');

  if (allowedOrigins.includes('*')) {
    headers['Access-Control-Allow-Origin'] = '*';
  } else if (allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const roomId = searchParams.get('roomId');
  const isHost = searchParams.get('isHost');
  console.log('roomId:' + roomId);
  console.log('isHost:' + isHost);

  if (!roomId) {
    return new Response('Missing roomId', { status: 400 });
  }
  let role;
  let admin = false;
  if (isHost == '1'){
    role = Role.HOST;
    admin = true;
  } else {
    role = Role.GUEST;
  }
  const accessToken = new AccessToken({
    apiKey: process.env.API_KEY!,
    roomId: roomId as string,
    role: role,
    permissions: {
      admin: admin,
      canConsume: true,
      canProduce: true,
      canProduceSources: {
        cam: true,
        mic: true,
        screen: true,
      },
      canRecvData: true,
      canSendData: true,
      canUpdateMetadata: true,
    },
  });

  const token = await accessToken.toJwt();

  return new Response(token, {
    status: 200,
    headers: getCorsHeaders(request.headers.get('origin') || ''),
  });
}
