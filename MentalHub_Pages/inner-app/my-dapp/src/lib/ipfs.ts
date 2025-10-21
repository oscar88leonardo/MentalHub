const DEFAULT_GATEWAY = (process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io").replace(/\/$/, "");

export function resolveIpfsUrl(input: string | undefined | null): string {
  const value = (input || "").trim();
  if (!value) return "";

  // ipfs://<cid>[...]
  if (value.startsWith("ipfs://")) {
    const path = value.slice("ipfs://".length);
    return `${DEFAULT_GATEWAY}/ipfs/${path}`;
  }

  // Looks like bare CID/hash → assume /ipfs/<cid>
  const isLikelyCid = /^[a-z0-9]+$/i.test(value) && value.length >= 46 && value.length <= 100;
  if (isLikelyCid) {
    return `${DEFAULT_GATEWAY}/ipfs/${value}`;
  }

  // http(s) URL: si es un gateway IPFS conocido, reescribir al gateway configurado
  try {
    const url = new URL(value);
    const host = url.hostname;
    const pathname = url.pathname || '';
    const match = pathname.match(/\/ipfs\/([^/?#]+)(.*)?/);
    const isIpfsGateway = (
      host.endsWith('mypinata.cloud') ||
      host === 'gateway.pinata.cloud' ||
      host === 'cloudflare-ipfs.com' ||
      host === 'ipfs.io'
    );
    if (isIpfsGateway && match) {
      const cid = match[1];
      const rest = match[2] || '';
      return `${DEFAULT_GATEWAY}/ipfs/${cid}${rest}`;
    }
  } catch {}

  // Already an http(s) url or something else → return as-is
  return value;
}


