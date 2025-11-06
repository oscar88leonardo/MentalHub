// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IVotes } from "@openzeppelin/contracts/governance/utils/IVotes.sol";
import { Governor } from "@openzeppelin/contracts/governance/Governor.sol";
import { GovernorCountingSimple } from "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import { GovernorVotes } from "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import { GovernorVotesQuorumFraction } from "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Governor con gestión de tiempo basada en fechas (timestamps) en lugar de bloques
/// @dev Extiende la funcionalidad estándar de Governor para usar timestamps para períodos de votación
contract MembersGovernorTimeBased is
    Governor,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    Ownable
{
    // Configuración de tiempo basada en fechas
    uint256 public votingDelaySeconds = 0; // Delay antes de que comience la votación (en segundos)
    uint256 public votingPeriodSeconds = 7 days; // Duración del período de votación (por defecto 1 semana)
    uint256 public customProposalThreshold = 1; // Mínimo de votos para crear propuesta
    
    // Mappings para almacenar timestamps reales de propuestas
    mapping(uint256 => uint256) public proposalStartTimestamps;
    mapping(uint256 => uint256) public proposalEndTimestamps;
    
    // Eventos para cambios de configuración
    event VotingDelayChanged(uint256 oldDelay, uint256 newDelay);
    event VotingPeriodChanged(uint256 oldPeriod, uint256 newPeriod);
    event ProposalThresholdChanged(uint256 oldThreshold, uint256 newThreshold);
    
    // Evento personalizado para propuestas con timestamps reales
    event ProposalCreatedWithTimestamps(
        uint256 indexed proposalId,
        uint256 startTimestamp,
        uint256 endTimestamp,
        string description
    );
    
    /// @param token ERC721Votes como fuente de poder de voto (IVotes)
    constructor(IVotes token)
        Governor("MembersGovernorTimeBased")
        GovernorVotes(token)
        GovernorVotesQuorumFraction(5) // 5%
        Ownable(msg.sender)
    {
        // El deployer se convierte en owner automáticamente
    }

    // ============ FUNCIONES DE PROPUESTA CON TIMESTAMPS REALES ============
    
    /// @notice Crear una propuesta con timestamps reales almacenados
    /// @param targets Direcciones de los contratos a llamar
    /// @param values Valores ETH a enviar con cada llamada
    /// @param calldatas Datos de llamada para cada contrato
    /// @param description Descripción de la propuesta
    /// @return proposalId ID de la propuesta creada
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override returns (uint256) {
        // Llamar a la función padre para crear la propuesta
        uint256 proposalId = super.propose(targets, values, calldatas, description);
        
        // Calcular y almacenar timestamps reales
        uint256 startTimestamp = block.timestamp + votingDelaySeconds;
        uint256 endTimestamp = startTimestamp + votingPeriodSeconds;
        
        proposalStartTimestamps[proposalId] = startTimestamp;
        proposalEndTimestamps[proposalId] = endTimestamp;
        
        // Emitir evento personalizado con timestamps reales
        emit ProposalCreatedWithTimestamps(proposalId, startTimestamp, endTimestamp, description);
        
        return proposalId;
    }
    
    // ============ CONFIGURACIÓN DE TIEMPO ============
    
    /// @notice Cambiar el delay antes de que comience la votación (solo owner)
    /// @param newDelaySeconds Nuevo delay en segundos
    function setVotingDelay(uint256 newDelaySeconds) external onlyOwner {
        uint256 oldDelay = votingDelaySeconds;
        votingDelaySeconds = newDelaySeconds;
        emit VotingDelayChanged(oldDelay, newDelaySeconds);
    }
    
    /// @notice Cambiar la duración del período de votación (solo owner)
    /// @param newPeriodSeconds Nueva duración en segundos
    function setVotingPeriod(uint256 newPeriodSeconds) external onlyOwner {
        require(newPeriodSeconds >= 1 minutes, "Voting period too short"); // Cambiado de 1 hour a 1 minute para testing
        require(newPeriodSeconds <= 30 days, "Voting period too long");
        
        uint256 oldPeriod = votingPeriodSeconds;
        votingPeriodSeconds = newPeriodSeconds;
        emit VotingPeriodChanged(oldPeriod, newPeriodSeconds);
    }
    
    /// @notice Cambiar el umbral mínimo para crear propuestas (solo owner)
    /// @param newThreshold Nuevo umbral mínimo
    function setProposalThreshold(uint256 newThreshold) external onlyOwner {
        uint256 oldThreshold = customProposalThreshold;
        customProposalThreshold = newThreshold;
        emit ProposalThresholdChanged(oldThreshold, newThreshold);
    }

    // ============ OVERRIDES PARA GESTIÓN POR FECHAS ============
    
    /// @notice Obtener el delay de votación en bloques (convertido desde segundos)
    function votingDelay()
        public
        view
        override(Governor)
        returns (uint256)
    {
        // Convertir segundos a bloques aproximados (asumiendo ~12 segundos por bloque)
        return votingDelaySeconds / 12;
    }

    /// @notice Obtener el período de votación en bloques (convertido desde segundos)
    function votingPeriod()
        public
        view
        override(Governor)
        returns (uint256)
    {
        // Convertir segundos a bloques aproximados (asumiendo ~12 segundos por bloque)
        return votingPeriodSeconds / 12;
    }

    /// @notice Obtener el umbral mínimo para crear propuestas
    function proposalThreshold()
        public
        view
        override(Governor)
        returns (uint256)
    {
        return customProposalThreshold;
    }

    /// @notice Obtener el quorum necesario
    function quorum(uint256 blockNumber)
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    // ============ FUNCIONES DE TIEMPO CON TIMESTAMPS REALES ============
    
    /// @notice Obtener el timestamp de inicio de votación para una propuesta
    /// @param proposalId ID de la propuesta
    /// @return Timestamp de inicio de votación (almacenado al crear la propuesta)
    function getVoteStartTimestamp(uint256 proposalId) public view returns (uint256) {
        uint256 storedTimestamp = proposalStartTimestamps[proposalId];
        if (storedTimestamp > 0) {
            return storedTimestamp;
        }
        
        // Fallback para propuestas creadas antes de esta actualización
        uint256 voteStartBlock = proposalSnapshot(proposalId);
        return block.timestamp - ((block.number - voteStartBlock) * 12);
    }
    
    /// @notice Obtener el timestamp de fin de votación para una propuesta
    /// @param proposalId ID de la propuesta
    /// @return Timestamp de fin de votación (almacenado al crear la propuesta)
    function getVoteEndTimestamp(uint256 proposalId) public view returns (uint256) {
        uint256 storedTimestamp = proposalEndTimestamps[proposalId];
        if (storedTimestamp > 0) {
            return storedTimestamp;
        }
        
        // Fallback para propuestas creadas antes de esta actualización
        uint256 voteEndBlock = proposalDeadline(proposalId);
        return block.timestamp - ((block.number - voteEndBlock) * 12);
    }
    
    /// @notice Verificar si una propuesta está activa (basado en timestamps)
    /// @param proposalId ID de la propuesta
    /// @return true si la propuesta está activa para votación
    function isProposalActive(uint256 proposalId) public view returns (bool) {
        uint256 startTime = getVoteStartTimestamp(proposalId);
        uint256 endTime = getVoteEndTimestamp(proposalId);
        uint256 currentTime = block.timestamp;
        
        return currentTime >= startTime && currentTime <= endTime;
    }
    
    /// @notice Verificar si una propuesta ha terminado (basado en timestamps)
    /// @param proposalId ID de la propuesta
    /// @return true si la propuesta ha terminado
    function isProposalFinished(uint256 proposalId) public view returns (bool) {
        uint256 endTime = getVoteEndTimestamp(proposalId);
        return block.timestamp > endTime;
    }

    // ============ OVERRIDES ESTÁNDAR ============
    
    /// @notice Obtener el estado de una propuesta
    function state(uint256 proposalId)
        public
        view
        override(Governor)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    /// @notice Verificar soporte de interfaz
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
