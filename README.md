# Innerverse
 
## Descripción
Innerverse es una plataforma web3 orientada al bienestar de la salud mental que combina NFTs de membresía con utilidades on-chain (sesiones, control de acceso) y gobernanza. El MVP incluye contrato de whitelist & Members con soporte de sesiones, un módulo de DAO para desarrollo de propuestas y administración de tesoro comunitario, modulo de perfil, sistema de agendamiento y procesamiento de videoconferencias decenteralizadas.

#Pitch Desk
https://docs.google.com/presentation/d/1RpmnLQQrG51J3xjlDq5KiF6PtSZ4vzvwQtTEYcBdork/edit?slide=id.ge38dc7bb6a_0_151#slide=id.ge38dc7bb6a_0_151

#Branding Kit
https://drive.google.com/drive/folders/1ehLBarc9rHOkPQW02ssuCmk0KqXujVi0

#Demo web App: 
https://innerverse.care
https://mental-hub-my-app-p3qk-git-frontendv0-leos-projects-1ca3b281.vercel.app/dao

#########################################
Decentralized Database -Ceramic node config@Google cloud 
## Iniciar servicios del nodo:
sudo systemctl start ceramic-one.service
sudo systemctl start ceramic-node.service

## Detener servicios del nodo:
sudo systemctl stop ceramic-one.service
sudo systemctl stop ceramic-node.service

## Check Status de servicios:
sudo systemctl status ceramic-one.service
sudo systemctl status ceramic-node.service

## shutdown
sudo shutdown -h now

#########################################
smart contracts en  Arbitrum, Metis, Polygon, Astar-Shibuya testnets

'arbitrum-sepolia': {
      membersgovernor: "0x51a109A3f06f3D6cE610b5c94CB3Be91553f1390", // MembersGovernorTimeBased actualizado con validación de 1 minuto
      membersAirdrop: "0x0868c53AcD1D4713AbA14F0199C8006e039635D5", // NFT existente
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

#########################################
## Integración con Lisk (Sepolia Testnet)
- Red: Lisk Sepolia (chainId 4202)
- RPC: `https://4202.rpc.thirdweb.com` (ver [thirdweb Lisk Sepolia Testnet](https://thirdweb.com/lisk-sepolia-testnet))
- Explorer: [liskscout](https://sepolia-blockscout.lisk.com)

Contratos desplegados en Lisk Sepolia:
- Whitelist: `0x2C20B0E2d623610aEdEA9a1A10DE0AEbebad6f88`
- MembersAirdrop: `0xE49AcfF5b7e0C0cc8252F9420a553c61BE02eAf3`

#########################################
## basic DAO  (Astar Shibuya) - Crypto Latin Fest Hackathon

- Cómo correr
  - cp MentalHub_Pages/hardhat-mental/.env.example MentalHub_Pages/hardhat-mental/.env
  - Editar .env y setear PRIVATE_KEY, OPTIONAL: GOVERNOR_ADDRESS, PROPOSAL_ID
  - cd MentalHub_Pages/hardhat-mental && npm i
  - npx hardhat compile
  - npx hardhat run scripts/deploy.ts --network shibuya
  - (anotar direcciones del log)
  - export GOVERNOR_ADDRESS=0x...; npx hardhat run scripts/propose.ts --network shibuya
  - cd ../inner-app/my-app && npm i && echo "NEXT_PUBLIC_THIRDWEB_CLIENTID=..." > .env.local
  - echo "NEXT_PUBLIC_GOV_ADDRESS=0x..." >> .env.local
  - npm run dev


DAO Deploy en Shibuya:

Governor contract Address [Astar Shibuya Testnet]
0x80702B337f333825f1A776945F48F87905378e9B

- Faucet SBY
  - Astar Portal / Triangle

- Explorer
  - Blockscout Shibuya

- Verificación rápida post-deploy
  - npx hardhat compile
  - npx hardhat run scripts/deploy.ts --network shibuya
  - cd ../inner-app/my-app && npm run dev
  - export GOVERNOR_ADDRESS=0x...; cd ../../hardhat-mental && npx hardhat run scripts/propose.ts --network shibuya
  - Refrescar UI, votar "For"
  - Verificar proposal/tx en Blockscout
  - Enviar SBY al address del Governor y comprobar saldo en el widget

#########################################
## METADATA URL
METADATA_URL = "ipfs://bafybeieq7ah4ygw7dfkodzeuvwppml3n3d3l57llhq3xax6wxp2wu4uwym/"
GATEWAY_URI ="https://nftstorage.link/ipfs/bafybeieq7ah4ygw7dfkodzeuvwppml3n3d3l57llhq3xax6wxp2wu4uwym/"
