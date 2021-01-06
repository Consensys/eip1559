import {Command, flags} from '@oclif/command'
import {ChainIds, Client, ConfigTemplates, DefaultConfig, EIP1559Config, Network} from '../config'
import Errors from '../errors'
import * as fs from 'fs'
import cli from 'cli-ux'
const logSymbols = require('log-symbols')
const ejs = require('ejs')
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
    await this.renderTemplates(configTemplates)
    await this.removeTemplates(configTemplates)
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
    try {
      cli.action.start('Downloading config file template')
      fs.writeFileSync(configTemplates.configLocalTemplatePath, await download(configTemplates.configURL))
      cli.action.stop(logSymbols.success)
    } catch (error) {
      cli.action.stop(logSymbols.error)
      return Promise.reject(error)
    }
    try {
      cli.action.start('Downloading genesis file template')
      fs.writeFileSync(configTemplates.genesisLocalTemplatePath, await download(configTemplates.genesisURL))
      cli.action.stop(logSymbols.success)
    } catch (error) {
      cli.action.stop(logSymbols.error)
      return Promise.reject(error)
    }
    return configTemplates
  }

  async renderTemplates(configTemplates: ConfigTemplates): Promise<void> {
    try {
      cli.action.start('Rendering config file template')
      const configFileStr = fs.readFileSync(configTemplates.configLocalTemplatePath, 'utf-8')
      const renderedConfig = ejs.render(configFileStr, {
        rootDir: this.eip1559Config.clientWorkDir,
      })
      fs.writeFileSync(configTemplates.configLocalPath, renderedConfig)
      cli.action.stop(logSymbols.success)
    } catch (error) {
      cli.action.stop(logSymbols.error)
      return Promise.reject(error)
    }
    try {
      cli.action.start('Rendering genesis file template')
      const genesisFileStr = fs.readFileSync(configTemplates.genesisLocalTemplatePath, 'utf-8')
      const renderedGenesis = ejs.render(genesisFileStr, {
        rootDir: this.eip1559Config.clientWorkDir,
        chainId: ChainIds.get(this.eip1559Config.network),
      })
      fs.writeFileSync(configTemplates.genesisLocalPath, renderedGenesis)
      cli.action.stop(logSymbols.success)
    } catch (error) {
      cli.action.stop(logSymbols.error)
      return Promise.reject(error)
    }
  }

  async removeTemplates(configTemplates: ConfigTemplates): Promise<void> {
    try {
      cli.action.start('Removing template files')
      fs.unlinkSync(configTemplates.genesisLocalTemplatePath)
      fs.unlinkSync(configTemplates.configLocalTemplatePath)
      cli.action.stop(logSymbols.success)
    } catch (error) {
      cli.action.stop(logSymbols.error)
      return Promise.reject(error)
    }
  }
}
