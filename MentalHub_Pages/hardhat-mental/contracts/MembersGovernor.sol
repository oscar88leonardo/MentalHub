// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IVotes } from "@openzeppelin/contracts/governance/utils/IVotes.sol";
import { Governor } from "@openzeppelin/contracts/governance/Governor.sol";
import { GovernorCountingSimple } from "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import { GovernorVotes } from "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import { GovernorVotesQuorumFraction } from "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import { GovernorSettings } from "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";

/// @notice Governor mínimo: 1 NFT = 1 voto
contract MembersGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction
{
    /// @param token ERC721Votes como fuente de poder de voto (IVotes)
    constructor(IVotes token)
        Governor("MembersGovernor")
        GovernorSettings(
            1,          // votingDelay: 1 bloque
            100,        // votingPeriod: ~100 bloques
            1           // proposalThreshold: 1 voto
        )
        GovernorVotes(token)
        GovernorVotesQuorumFraction(5) // 5%
    {}

    // Overrides requeridos por herencia múltiple
    function votingDelay()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    // Propuesta ejecutable sin timelock (no requerido en MVP)
    function state(uint256 proposalId)
        public
        view
        override(Governor)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}


