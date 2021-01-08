import {Command, flags} from '@oclif/command'
import {FaucetConfig, FaucetNodes} from '../faucet-config'
import {DefaultConfig} from '../config'
const Web3 = require('web3')
export default class Faucet extends Command {
  static description = 'EIP-1559 Testnet Faucet'

  static flags = {
    help: flags.help({char: 'h'}),
    network: flags.string({char: 'n', description: 'network to use', default: DefaultConfig.network}),
  }

  static args = [{name: 'address', required: true}]

  async run() {
    const faucetConfig = this.parseCommand()
    const faucetNodeInfo = FaucetNodes.get(faucetConfig.network)
    console.log(faucetNodeInfo)
    const web3 = new Web3(new Web3.providers.HttpProvider(faucetNodeInfo.rpcURL))
    const giverAccount = web3.eth.accounts.privateKeyToAccount(faucetNodeInfo.giver)
    web3.eth.sendTransaction({
      from: giverAccount.address,
      to: faucetConfig.address,
      value: '500000000000000000',
    })
    .then(function (receipt) {
      console.log('faucet completed: ', receipt)
    })
  }

  private parseCommand(): FaucetConfig {
    const {args, flags} = this.parse(Faucet)
    const address = args.address as string
    return new FaucetConfig(address, {
      _network: flags.network,
    },
    )
  }
}
