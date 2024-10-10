import type { SafeEventEmitterProvider } from "@web3auth/base";
import { ethers,parseEther,formatEther, JsonRpcSigner } from "ethers";
import { BrowserProvider } from "ethers/providers";

export default class EthereumRpc {
  private provider: SafeEventEmitterProvider;

  constructor(provider: SafeEventEmitterProvider) {
    this.provider = provider;
  }

  async getChainId(): Promise<any> {
    try {
      const ethersProvider = new BrowserProvider(this.provider);//new ethers.providers.Web3Provider(this.provider);
      // Get the connected Chain's ID
      const networkDetails = await ethersProvider.getNetwork();

      return networkDetails.chainId;
    } catch (error) {
      return error;
    }
  }

  async getAccounts(): Promise<any> {
    try {
      const ethersProvider = new BrowserProvider(this.provider);//new ethers.providers.Web3Provider(this.provider);
      const signer = await ethersProvider.getSigner();
      // Ensure signer is the correct type
      const ethersSigner = signer as unknown as JsonRpcSigner;
      
      // Get user's Ethereum public address
      // Get the address asynchronously
      const address = await ethersSigner.getAddress();
      //const address = await signer.getAddress(); //original line

      return address;
    } catch (error) {
      return error;
    }
  }

  async getBalance(): Promise<string> {
    try {
      //const ethersProvider = new ethers.providers.Web3Provider(this.provider);
      const ethersProvider = new BrowserProvider(this.provider);//new ethers.providers.Web3Provider(this.provider);
      const signer = ethersProvider.getSigner();
      // Ensure signer is the correct type
      const ethersSigner = signer as unknown as JsonRpcSigner;
      // Get user's Ethereum public address
      //const address = await signer.getAddress();//original line
      const address = await ethersSigner.getAddress();

      // Get user's balance in ether
      const balance = formatEther(
        await ethersProvider.getBalance(address) // Balance is in wei
      );

      return balance;
    } catch (error) {
      return error as string;
    }
  }

  /*async sendTransaction(destination,vMaxPriorityFeePerGas,vMaxFeePerGas,vAmount): Promise<any> {
    try {
      const ethersProvider = new BrowserProvider(this.provider);//new ethers.providers.Web3Provider(this.provider);
      const signer = ethersProvider.getSigner();

      //const destination = "0x40e1c367Eca34250cAF1bc8330E9EddfD403fC56";

      // Convert 1 ether to wei
      const amount = parseEther(vAmount);//"0.001");

      // Submit transaction to the blockchain
      const tx = await signer.sendTransaction({
        to: destination,
        value: amount,
        maxPriorityFeePerGas: vMaxPriorityFeePerGas,//"5000000000", // Max priority fee per gas
        maxFeePerGas: vMaxFeePerGas,//"6000000000000", // Max fee per gas
      });

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      return receipt;
    } catch (error) {
      return error as string;
    }
  }*/

  /*async signMessage() {
    try {
      const ethersProvider = new BrowserProvider(this.provider);
      const signer = ethersProvider.getSigner();

      const originalMessage = "YOUR_MESSAGE";

      // Sign the message
      const signedMessage = await signer.signMessage(originalMessage);

      return signedMessage;
    } catch (error) {
      return error as string;
    }
  }*/

  async getPrivateKey(): Promise<any> {
    try {
      const privateKey = await this.provider.request({
        method: "eth_private_key",
      });

      return privateKey;
    } catch (error) {
      return error as string;
    }
  }
}