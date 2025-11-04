import { watchContractEvents, prepareEvent } from "thirdweb";
import type { getContract } from "thirdweb";

const sessionChanged = prepareEvent({
  signature: "event SessionStateChanged(uint256 indexed tokenId, string scheduleId, uint8 newState)",
});

// Tipo del contrato que retorna getContract
type Contract = ReturnType<typeof getContract>;

export function watchSessionState(
  contract: Contract,
  onChange: (scheduleId: string, newState: number) => void
) {
  return watchContractEvents({
    contract,
    events: [sessionChanged],
    onEvents: (events) => {
      for (const ev of events) {
        const { scheduleId, newState } = ev.args;
        if (scheduleId != null) onChange(scheduleId as string, Number(newState));
      }
    },
  });
}