import { myChain } from '@/config/chain';

export function didPkhFromAddress(address: string): string {
  const chainId = (myChain as any)?.id ?? (myChain as any)?.chainId ?? 1;
  return `did:pkh:eip155:${Number(chainId)}:${String(address || '').toLowerCase()}`;
}













