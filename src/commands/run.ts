import {Command, flags} from '@oclif/command'
import {DefaultConfig, Network} from '../config'

export default class Run extends Command {
  static description = 'Run an EIP-1559 capable Ethereum node on the specified network'

  static flags = {
    help: flags.help({char: 'h'}),
    network: flags.string({char: 'n', description: 'network to use', default: DefaultConfig.network}),
    client: flags.string({char: 'c', description: 'ethereum client', default: DefaultConfig.client}),
    force: flags.boolean({char: 'f'}),
  }

  async run() {
    const {flags} = this.parse(Run)
    if (!(flags.network.toUpperCase() in Network)) {
      this.error(`${flags.network} is not a valid network`, {exit: 100})
    }
  }
}
