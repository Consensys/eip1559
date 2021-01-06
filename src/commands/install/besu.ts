import {Command, flags} from '@oclif/command'
import * as os from 'os'
import * as fs from 'fs'
const download = require('download')
const rimraf = require('rimraf')
const unzipper = require('unzipper')

class BesuInstallConfiguration {
  static readonly rootDownloadURL = 'https://dl.bintray.com/hyperledger-org/besu-repo'

  static readonly defaultBesuLocation = `${require('os').homedir()}/.eip1559/install/besu`

  static readonly defaultBesuVersion = '20.10.3'

  private readonly _version: string

  private readonly _archiveURL: string

  private readonly _installRootPath: string

  private readonly _archiveLocalPath: string

  constructor(version: string, installRootPath: string) {
    this._version = version
    this._installRootPath = installRootPath
    this._archiveURL = `${BesuInstallConfiguration.rootDownloadURL}/besu-${version}.zip`
    this._archiveLocalPath = `${this._installRootPath}/besu-${version}.zip`
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
    this.log('Detected os type: ' + osType)
    const {flags} = this.parse(InstallBesu)

    const cfg = new BesuInstallConfiguration(flags.version, flags.path)
    await this.downloadBesuArchive(cfg)
    await this.extractArchive(cfg)
  }

  async downloadBesuArchive(cfg: BesuInstallConfiguration): Promise<void> {
    if (fs.existsSync(cfg.installRootPath)) {
      rimraf.sync(cfg.installRootPath)
    }
    fs.mkdirSync(cfg.installRootPath, {recursive: true})
    fs.writeFileSync(cfg.archiveLocalPath, await download(cfg.archiveURL))
  }

  async extractArchive(cfg: BesuInstallConfiguration): Promise<void> {
    fs.createReadStream(cfg.archiveLocalPath)
    // eslint-disable-next-line new-cap
    .pipe(unzipper.Extract({path: cfg.installRootPath}))
  }
}
