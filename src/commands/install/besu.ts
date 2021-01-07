import {Command, flags} from '@oclif/command'
import * as os from 'os'
import * as fs from 'fs'
import cli from 'cli-ux'
const download = require('download')
const rimraf = require('rimraf')
const unzipper = require('unzipper')
const shell = require('shelljs')
const chalk = require('chalk')

class BesuInstallConfiguration {
  static readonly rootDownloadURL = 'https://dl.bintray.com/hyperledger-org/besu-repo'

  static readonly defaultBesuLocation = `${require('os').homedir()}/.eip1559/install/besu`

  static readonly defaultBesuVersion = '20.10.3'

  private readonly _version: string

  private readonly _archiveURL: string

  private readonly _installRootPath: string

  private readonly _archiveLocalPath: string

  private readonly _besuBinPath: string

  constructor(version: string, installRootPath: string) {
    this._version = version
    this._installRootPath = installRootPath
    this._archiveURL = `${BesuInstallConfiguration.rootDownloadURL}/besu-${version}.zip`
    this._archiveLocalPath = `${this._installRootPath}/besu-${version}.zip`
    this._besuBinPath = `${installRootPath}/besu-${version}/bin/besu`
  }

  get version(): string {
    return this._version
  }

  get archiveURL(): string {
    return this._archiveURL
  }

  get installRootPath(): string {
    return this._installRootPath
  }

  get archiveLocalPath(): string {
    return this._archiveLocalPath
  }

  get besuBinPath(): string {
    return this._besuBinPath
  }
}

export default class InstallBesu extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({char: 'h'}),
    path: flags.string({char: 'p', description: 'install path', default: BesuInstallConfiguration.defaultBesuLocation}),
    version: flags.string({char: 'v', description: 'version of Besu to install', default: BesuInstallConfiguration.defaultBesuVersion}),
  }

  async run() {
    const osType = os.type()
    this.log('Detected os type: ' + chalk.green(osType))
    const {flags} = this.parse(InstallBesu)

    const cfg = new BesuInstallConfiguration(flags.version, flags.path)
    await InstallBesu.downloadBesuArchive(cfg)
    await InstallBesu.extractArchive(cfg)
    await cli.wait(5000)
    shell.chmod('+x', cfg.besuBinPath)
    this.log('Besu has been installed to: ', chalk.yellow(cfg.besuBinPath))
  }

  static async  downloadBesuArchive(cfg: BesuInstallConfiguration): Promise<void> {
    if (fs.existsSync(cfg.installRootPath)) {
      rimraf.sync(cfg.installRootPath)
    }
    fs.mkdirSync(cfg.installRootPath, {recursive: true})
    fs.writeFileSync(cfg.archiveLocalPath, await download(cfg.archiveURL))
  }

  static async extractArchive(cfg: BesuInstallConfiguration): Promise<void> {
    fs.createReadStream(cfg.archiveLocalPath)
    // eslint-disable-next-line new-cap
    .pipe(unzipper.Extract({path: cfg.installRootPath}))
  }

  public static async installBesu(): Promise<BesuInstallConfiguration> {
    const cfg = new BesuInstallConfiguration(
      BesuInstallConfiguration.defaultBesuVersion,
      BesuInstallConfiguration.defaultBesuLocation
    )
    await InstallBesu.downloadBesuArchive(cfg)
    await InstallBesu.extractArchive(cfg)
    await cli.wait(5000)
    shell.chmod('+x', cfg.besuBinPath)
    return cfg
  }
}
