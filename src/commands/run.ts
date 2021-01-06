import {Command, flags} from '@oclif/command'
import {Client, ConfigTemplates, DefaultConfig, EIP1559Config, Network} from '../config'
import Errors from '../errors'
import * as fs from 'fs'

const download = require('download')
const rimraf = require('rimraf')

export default class Run extends Command {
  static description = 'Run an EIP-1559 capable Ethereum node on the specified network'

  private eip1559Config: EIP1559Config = new EIP1559Config()

  static flags = {
    help: flags.help({char: 'h'}),
    network: flags.string({char: 'n', description: 'network to use', default: DefaultConfig.network}),
    client: flags.string({char: 'c', description: 'ethereum client', default: DefaultConfig.client}),
    workDir: flags.string({char: 'w', description: 'working directory', default: DefaultConfig.workDir}),
    force: flags.boolean({char: 'f'}),
  }

  async run() {
    this.eip1559Config = this.parseCommand()
    const configTemplates = await this.downloadConfigTemplateFiles()
    console.log(configTemplates)
  }

  private parseCommand(): EIP1559Config {
    const {flags} = this.parse(Run)
    if (!(flags.network.toUpperCase() in Network)) {
      this.error(`${flags.network} is not a valid network`, {exit: (Errors.INVALID_NETWORK)})
    }
    if (!(flags.client.toUpperCase() in Client)) {
      this.error(`${flags.network} is not a supported ethereum client`, {exit: Errors.INVALID_CLIENT})
    }

    return new EIP1559Config(
      {
        _client: flags.client,
        _network: flags.network,
        _workDir: flags.workDir,
      },
    )
  }

  async downloadConfigTemplateFiles(): Promise<ConfigTemplates> {
    const rootURL = `https://raw.githubusercontent.com/${DefaultConfig.configRepo}/main/template`
    const rootClientURL = `${rootURL}/${this.eip1559Config.client.toLowerCase()}`
    const genesisURL = `${rootClientURL}/genesis.json`
    const configURL = `${rootClientURL}/config.toml`
    if (fs.existsSync(this.eip1559Config.clientWorkDir)) {
      rimraf.sync(this.eip1559Config.clientWorkDir)
    }
    fs.mkdirSync(this.eip1559Config.clientWorkDir, {recursive: true})

    const configTemplates = new ConfigTemplates(
      genesisURL,
      configURL,
      this.eip1559Config.workDir,
      this.eip1559Config.client.toLowerCase(),
    )
    fs.writeFileSync(configTemplates.configLocalTemplatePath, await download(configTemplates.configURL))
    fs.writeFileSync(configTemplates.genesisLocalTemplatePath, await download(configTemplates.genesisURL))

    return configTemplates
  }
}
