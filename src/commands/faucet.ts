import {Command, flags} from '@oclif/command'
import {defaultFaucet, FaucetConfig, FaucetNodeInfo, FaucetNodes} from '../faucet-config'
import {DefaultConfig} from '../config'
import {ethers} from 'ethers'
const axios = require('axios').default

export default class Faucet extends Command {
  static description = 'EIP-1559 Testnet Faucet'

  static flags = {
    help: flags.help({char: 'h'}),
    network: flags.string({char: 'n', description: 'network to use', default: DefaultConfig.network}),
  }

  static args = [{name: 'address', required: true}]

  async run() {
    const faucetConfig = this.parseCommand()
    const f = FaucetNodes.get(faucetConfig.network)
    let faucetNodeInfo: FaucetNodeInfo
    if (f === undefined) {
      faucetNodeInfo = defaultFaucet
    } else {
      faucetNodeInfo = f
    }
    const provider = new ethers.providers.JsonRpcProvider(faucetNodeInfo.rpcURL)
    const signer = new ethers.Wallet(faucetNodeInfo.giver)
    const nonce = await provider.getTransactionCount(faucetNodeInfo.giverAddress, 'latest')
    let recipient: string
    if (faucetConfig.address === null) {
      recipient = ''
    } else {
      recipient = faucetConfig.address
    }

    const signature = await signer.signTransaction({
      chainId: faucetNodeInfo.chaindId,
      value: '0x6F05B59D3B20000',
      to: recipient,
      nonce: nonce,
      gasLimit: '0x186A0',
      gasPrice: '0x1388',
    })
    try {
      await Faucet.sendRawTransaction(faucetNodeInfo.rpcURL, signature)
    } catch (error) {
      this.error(error)
    }
  }

  private parseCommand(): FaucetConfig {
    const {args, flags} = this.parse(Faucet)
    const address = args.address as string
    return new FaucetConfig(address, {
      _network: flags.network,
    },
    )
  }

  private static async sendRawTransaction(url: string, signedTx: string): Promise<any> {
    return axios.post(
      url, {
        method: 'eth_sendRawTransaction',
        id: 1,
        jsonrpc: '2.0',
        params: [
          signedTx,
        ],
      }
    )
  }
}
