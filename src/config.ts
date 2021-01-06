export enum Client {
  BESU = 'BESU',
}

export enum Network {
  RHODES = 'RHODES',
}

export class DefaultConfig {
  static readonly client = Client.BESU

  static readonly network = Network.RHODES

  static readonly workDir = `${require('os').homedir()}/.eip1559`

  static readonly configRepo = 'ConsenSys/eip1559-rhodes'
}

export class EIP1559Config {
  public readonly _client: string = DefaultConfig.client

  public readonly _network: string = DefaultConfig.network

  public readonly _workDir: string = DefaultConfig.workDir

  private readonly _clientWorkDir: string

  constructor(init?: Partial<EIP1559Config>) {
    Object.assign(this, init)
    this._clientWorkDir = `${this.workDir}/config/${this.client.toLowerCase()}`
  }

  get client(): string {
    return this._client
  }

  get network(): string {
    return this._network
  }

  get workDir(): string {
    return this._workDir
  }

  get clientWorkDir(): string {
    return this._clientWorkDir
  }
}

export class ConfigTemplates {
  private readonly _genesisURL: string

  private readonly _genesisLocalTemplatePath: string

  private readonly _genesisLocalPath: string

  private readonly _configURL: string

  private readonly _configLocalTemplatePath: string

  private readonly _configLocalPath: string

  private readonly _workDir: string

  constructor(genesisURL: string, configURL: string, workDir: string, client: string) {
    this._genesisURL = genesisURL
    this._configURL = configURL
    this._workDir = workDir
    this._genesisLocalTemplatePath = `${workDir}/config/${client}/genesis.json.template`
    this._genesisLocalPath = `${workDir}/config/${client}/genesis.json`
    this._configLocalTemplatePath = `${workDir}/config/${client}/config.toml.template`
    this._configLocalPath = `${workDir}/config/${client}/config.toml`
  }

  get genesisURL(): string {
    return this._genesisURL
  }

  get configURL(): string {
    return this._configURL
  }

  get workDir(): string {
    return this._workDir
  }

  get genesisLocalPath(): string {
    return this._genesisLocalPath
  }

  get configLocalPath(): string {
    return this._configLocalPath
  }

  get genesisLocalTemplatePath(): string {
    return this._genesisLocalTemplatePath
  }

  get configLocalTemplatePath(): string {
    return this._configLocalTemplatePath
  }
}
