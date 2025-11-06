# Innerverse
 
## Descripción
Innerverse es una plataforma web3 orientada al bienestar de la salud mental que combina NFTs de membresía con utilidades on-chain (sesiones, control de acceso) y gobernanza. El MVP incluye contrato de whitelist & Members con soporte de sesiones, un módulo de DAO para desarrollo de propuestas y administración de tesoro comunitario, modulo de perfil, sistema de agendamiento y procesamiento de videoconferencias decenteralizadas.

## Demo web App: 
- Main Branch 
https://innerverse.care
- Dev branch - latest  
mental-hub-my-app-p3qk-git-my-dapp-leos-projects-1ca3b281.vercel.app

## Pitch Desk
https://docs.google.com/presentation/d/1RpmnLQQrG51J3xjlDq5KiF6PtSZ4vzvwQtTEYcBdork/edit?slide=id.ge38dc7bb6a_0_151#slide=id.ge38dc7bb6a_0_151

## Branding Kit
https://drive.google.com/drive/folders/1ehLBarc9rHOkPQW02ssuCmk0KqXujVi0

## smart contracts en testnets: Arbitrum-sepolia, Metis-sepolia, Lisk-sepolia, Polygon-mumbai, Astar-Shibuya 

'arbitrum-sepolia': {
      membersgovernor: "0xE79e3c6CC2a258D0b74692F4A3645Db31f8A0AC0", // MembersGovernorTimeBased actualizado con validación de 1 minuto
      membersAirdrop: "0x609ee5AC3154Aa8501Ccfd0D4521469Eb747E0B7", 
      whitelist: "0x2C20B0E2d623610aEdEA9a1A10DE0AEbebad6f88",
    },
  'metis-sepolia': {
    membersAirdrop: "0xcc1515239C446f6f1a3D49fEb8953f68c4F84cDA",
    whitelist: "0x2C20B0E2d623610aEdEA9a1A10DE0AEbebad6f88",
  },
  'lisk-sepolia': {
    membersAirdrop: "0xE49AcfF5b7e0C0cc8252F9420a553c61BE02eAf3",
    whitelist: "0x2C20B0E2d623610aEdEA9a1A10DE0AEbebad6f88",
  },
  'shibuya': {
    membersAirdrop: "0x7BCbe9a7A35793A9031C0cAA3DfD2A46212a40c5",
    whitelist: "0x7452e1D4353Cb41DDbb4De4F84F0D129247d98d9",
  },
  'polygon-mumbai': {
    membersAirdrop: "0xd97533D7a552e2c793cdC477C0DcA64e76c76E3b",
    whitelist: "0xB73e449442055e1310E467bb657469e402aBd904",
  },

## METADATA URL
METADATA_URL = "ipfs://bafybeiczmzkr475aziqlckugqveq5q3wpih3korhi3gr2iezxmavb5qcwy/"; 
GATEWAY_URI ="https://ivory-magnetic-guineafowl-976.mypinata.cloud/ipfs/bafybeiczmzkr475aziqlckugqveq5q3wpih3korhi3gr2iezxmavb5qcwy/";


## Decentralized Database - Ceramic node config 
-Iniciar servicios del nodo:
sudo systemctl start ceramic-one.service
sudo systemctl start ceramic-node.service

-Detener servicios del nodo:
sudo systemctl stop ceramic-one.service
sudo systemctl stop ceramic-node.service

-Check Status de servicios:
sudo systemctl status ceramic-one.service
sudo systemctl status ceramic-node.service

-shutdown
sudo shutdown -h now


