import {Command, flags} from '@oclif/command'
import {
  ChainIds,
  Client,
  ConfigTemplates,
  DefaultConfig,
  EIP1559Config, EthStatsCredentials,
  EthStatsData, EthStatsURLS,
  Network,
  StaticNodes,
} from '../config'
import Errors from '../errors'
import * as fs from 'fs'
import cli from 'cli-ux'
import InstallBesu from './install/besu'

const logSymbols = require('log-symbols')
const ejs = require('ejs')
const download = require('download')
const rimraf = require('rimraf')
const chalk = require('chalk')
const publicIp = require('public-ip')
const shell = require('shelljs')
const open = require('open')

const slowDown = true

export default class Run extends Command {
  static description = 'Run an EIP-1559 capable Ethereum node on the specified network'

  private eip1559Config: EIP1559Config = new EIP1559Config()

  static flags = {
    help: flags.help({char: 'h'}),
    network: flags.string({char: 'n', description: 'network to use', default: DefaultConfig.network}),
    client: flags.string({char: 'c', description: 'ethereum client', default: DefaultConfig.client}),
    workDir: flags.string({char: 'w', description: 'working directory', default: DefaultConfig.workDir}),
    ethStatsEnabled: flags.boolean({char: 'e', description: 'enable eth stats', default: true}),
    force: flags.boolean({char: 'f'}),
  }

  async run() {
    this.eip1559Config = this.parseCommand()
    const configTemplates = await this.downloadConfigTemplateFiles()
    await this.renderTemplates(configTemplates)
    await this.removeTemplates(configTemplates)
    await this.writeStaticNodesFiles(configTemplates)
    await this.printClientRunCommand(configTemplates)
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
        _ethStatsEnabled: flags.ethStatsEnabled,
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
    fs.mkdirSync(this.eip1559Config.dataPath, {recursive: true})

    const configTemplates = new ConfigTemplates(
      genesisURL,
      configURL,
      this.eip1559Config.workDir,
      this.eip1559Config.client.toLowerCase(),
    )
    try {
      cli.action.start('Downloading config file templates')
      if (slowDown) {
        await cli.wait(750)
      }
      fs.writeFileSync(configTemplates.configLocalTemplatePath, await download(configTemplates.configURL))
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
      cli.action.start('Rendering config file templates')
      if (slowDown) {
        await cli.wait(750)
      }
      const configFileStr = fs.readFileSync(configTemplates.configLocalTemplatePath, 'utf-8')
      const templateData = {
        rootDir: this.eip1559Config.clientWorkDir,
        p2pHost: await publicIp.v4(),
        ethStatsEnabled: this.eip1559Config.ethStatsEnabled,
        ethStatsURL: await this.generateEthStatsURL(),
      }
      const renderedConfig = ejs.render(configFileStr, templateData)
      fs.writeFileSync(configTemplates.configLocalPath, renderedConfig)
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
      if (slowDown) {
        await cli.wait(750)
      }
      fs.unlinkSync(configTemplates.genesisLocalTemplatePath)
      fs.unlinkSync(configTemplates.configLocalTemplatePath)
      cli.action.stop(logSymbols.success)
    } catch (error) {
      cli.action.stop(logSymbols.error)
      return Promise.reject(error)
    }
  }

  writeStaticNodesFiles(configTemplates: ConfigTemplates): void {
    try {
      cli.action.start('Generating static nodes file')
      fs.writeFileSync(configTemplates.staticNodesPath, JSON.stringify(StaticNodes.get(this.eip1559Config.network), null, 2))
      cli.action.stop(logSymbols.success)
    } catch (error) {
      cli.action.stop(logSymbols.error)
      this.error(error, {exit: (Errors.STATIC_NODES_FILE_GENERATION_ERROR)})
    }
  }

  async printClientRunCommand(configTemplates: ConfigTemplates): Promise<void> {
    if (this.eip1559Config.client === Client.BESU) {
      await this.printBesuRunCommand(configTemplates)
    }
  }

  async printBesuRunCommand(configTemplates: ConfigTemplates): Promise<void> {
    let besuBinPath = 'besu'
    if (!shell.which('besu')) {
      this.log('Besu is not installed on your machine.')
      const installBesuNow = await cli.prompt('Do you want to install it now? Y/n', {required: false}) as string
      if (installBesuNow === '' || installBesuNow === 'y'  || installBesuNow === 'Y' || installBesuNow === 'yes' || installBesuNow === 'YES') {
        besuBinPath = await this.installBesu()
      }
    }
    this.log(
      chalk`
      Configuration files are ready. You can now run:
      {green ${besuBinPath}} --config-file={yellow ${configTemplates.configLocalPath}}
      Or if you want to run it in a background process:
      {green ${besuBinPath}} --config-file={yellow ${configTemplates.configLocalPath}} >> {blue ${configTemplates.logFilePath}} 2>&1
      `,
    )
    const runNow = await cli.prompt('Do you want to run it now? Y/n', {required: false}) as string
    if (runNow === '' || runNow === 'y'  || runNow === 'Y' || runNow === 'yes' || runNow === 'YES') {
      const ethStatsURL = EthStatsURLS.get(this.eip1559Config.network)
      this.log(
        chalk`
        Launching {green Hyperlegder Besu} for you.
        Your node should appear soon on the network status page.
        Opening {magenta ${ethStatsURL}} in your default browser.
        `,
      )
      open(ethStatsURL)
      shell.exec(`${besuBinPath} --config-file=${configTemplates.configLocalPath}`)
    }
  }

  async generateEthStatsURL(): Promise<string> {
    let name = `${this.eip1559Config.network.toLowerCase()}-${this.eip1559Config.client.toLowerCase()}-${new Date().getTime()}`
    const ethStatsNodeName = await cli.prompt(`What is the name of your node? default will be (${chalk.green(name)})`, {required: false}) as string
    if (ethStatsNodeName !== '') {
      name = ethStatsNodeName
    }
    const ethStatsCredentials: EthStatsCredentials|undefined = EthStatsData.get(this.eip1559Config.network)
    if (ethStatsCredentials === undefined) {
      return Promise.reject(new Error('cannot retrieve ethstats credentials for specified network'))
    }
    const credentials: EthStatsCredentials = ethStatsCredentials as EthStatsCredentials
    return `${name}:${credentials.password}@${credentials.endpoint}`
  }

  async installBesu(): Promise<string> {
    this.log('Installing Besu')
    const cfg = await InstallBesu.installBesu()
    return cfg.besuBinPath
  }
}
