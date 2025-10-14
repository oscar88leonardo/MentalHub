import { NextRequest } from 'next/server';

// Simple proxy to serve ipfs hash via configured gateway; helps with mixed content and path handling
export async function GET(
  _req: NextRequest,
  { params }: { params: { cid: string } }
) {
  const cid = params.cid;
  const gateway = (process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io').replace(/\/$/, '');
  const url = `${gateway}/ipfs/${cid}`;
  const res = await fetch(url);
  const contentType = res.headers.get('content-type') || 'application/octet-stream';
  return new Response(await res.arrayBuffer(), {
    status: res.status,
    headers: {
      'content-type': contentType,
      'cache-control': 'public, max-age=31536000, immutable',
    },
  });
}


