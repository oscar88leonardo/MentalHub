# Innerverse
 
## Descripción
Innerverse es una plataforma web3 orientada al bienestar de la salud mental que combina NFTs de membresía con utilidades on-chain (sesiones, control de acceso) y gobernanza. El MVP incluye un contrato de whitelist, una colección ERC-721 con soporte de sesiones y un módulo de DAO.

Demo web App: 
https://innerverse.care
https://mental-hub-my-app-p3qk-git-frontendv0-leos-projects-1ca3b281.vercel.app/dao

## Integración con Lisk (Sepolia Testnet)
- Red: Lisk Sepolia (chainId 4202)
- RPC: `https://4202.rpc.thirdweb.com` (ver [thirdweb Lisk Sepolia Testnet](https://thirdweb.com/lisk-sepolia-testnet))
- Explorer: [liskscout](https://sepolia-blockscout.lisk.com)

Contratos desplegados en Lisk Sepolia:
- Whitelist: `0x2C20B0E2d623610aEdEA9a1A10DE0AEbebad6f88`
- MembersAirdrop: `0xE49AcfF5b7e0C0cc8252F9420a553c61BE02eAf3`

## DAO MVP (Astar Shibuya) - Crypto Latin Fest Hackathon

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


Deploy en Shibuya:
Whitelist (Shibuya) ya desplegada: 0x7452e1D4353Cb41DDbb4De4F84F0D129247d98d9
Deploy en Shibuya:
Members=0x7BCbe9a7A35793A9031C0cAA3DfD2A46212a40c5
Governor=0x80702B337f333825f1A776945F48F87905378e9B

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

Whitelist Contract Address [ETH Goerli Testnet]: 0xd9BFb19Be9e3568b766D4987A546a835E2589E48
NFT Col Members Contract Address [ETH Goerli Testnet]: 0x3AFc87192488Ee62e9F4583D8448948669320193

Whitelist contract Address [Metis goerli Testnet]: 0x3F32B7e7A5B8297Ae8Ab86b1EbaC9831CE4047fD
MembersAirdrop contract Address [Metis goerli Testnet]: 0x459B185D76b9E33c95c533B7E6ff710Df513dbEF
MembersAirdrop IPFS contract Address [Metis goerli Testnet]:0xcAf1501488f3F985d1bA6420a48661A881f01061


Whitelist contract Address [polygon mumbai Testnet]: 0xB73e449442055e1310E467bb657469e402aBd904
MembersAirdrop contract Address [polygon mumbai Testnet]: 0x2C73F53DB83Df1f6CD928e4F69Dbf122999c268f
MembersAirdrop IPFS contract Address [polygon mumbai Testnet]:0xd97533D7a552e2c793cdC477C0DcA64e76c76E3b




## DEPRECATED TESTNET
Whitelist Contract Address [Metis stardust Testnet]: 0x3AFc87192488Ee62e9F4583D8448948669320193
MembersAirdrop contract Address [Metis testnet]: 0xe5075BD3b6401da79E03Efe848cb2bf6eB6C28F4 

Metis Goerli faucet - https://goerli.faucet.metisdevops.link/

## METADATA URL
METADATA_URL = "ipfs://bafybeieq7ah4ygw7dfkodzeuvwppml3n3d3l57llhq3xax6wxp2wu4uwym/"
GATEWAY_URI ="https://nftstorage.link/ipfs/bafybeieq7ah4ygw7dfkodzeuvwppml3n3d3l57llhq3xax6wxp2wu4uwym/"

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
