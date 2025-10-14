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

  // Already an http(s) url or something else → return as-is
  return value;
}


