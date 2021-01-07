export enum Client {
  BESU = 'BESU',
}

export enum Network {
  RHODES = 'RHODES',
}

export const ChainIds = new Map<string, number>([
  [Network.RHODES, 280],
])

export const StaticNodes = new Map<string, string[]>([
  [Network.RHODES, [
    'enode://0c72e2b7873e4342d725b5990c17adb2b159aad2ff5853de7e4910b25522a1f9e78f9cd802a8a3225b8fae4e994e522b50d6bd5a163eb3a7b49a0a73ca9a1c7e@3.16.76.137:30303',
    'enode://1c6d296749018e4e4a78baf9a8a3048aae2557c3f2f11a340570d57e71071e2e9816a5f5d9215a333d12b432a81ff5017520b09461c4a102e72c7a1a2d9d7d0f@3.136.236.37:30303',
    'enode://3eca270e124b5e24e846bb39d0a911d152cfd2671be079478e72e768363c959852301b40b2afffddbe45a285fd752fa4541e8376f73dad688757e0a07a35e164@3.129.247.126:30303',
  ]],
])

export const EthStatsURLS = new Map<string, string>([
  [Network.RHODES, 'http://3.21.227.120:3001/'],
])

export class EthStatsCredentials {
  private readonly _endpoint: string

  private readonly _password: string

  constructor(endpoint: string, password: string) {
    this._endpoint = endpoint
    this._password = password
  }

  get endpoint(): string {
    return this._endpoint
  }

  get password(): string {
    return this._password
  }
}

export const EthStatsData = new Map<string, EthStatsCredentials>([
  [Network.RHODES, new EthStatsCredentials('3.21.227.120:3001', '7pyzQMYIWkrPZ7ab')],
])

export class DefaultConfig {
  static readonly client = Client.BESU

  static readonly network = Network.RHODES

  static readonly workDir = `${require('os').homedir()}/.eip1559`

  static readonly ethStatsEnabled = true

  static readonly configRepo = 'ConsenSys/eip1559-rhodes'
}

export class EIP1559Config {
  public readonly _client: string = DefaultConfig.client

  public readonly _network: string = DefaultConfig.network

  public readonly _workDir: string = DefaultConfig.workDir

  public readonly _ethStatsEnabled: boolean = DefaultConfig.ethStatsEnabled

  private readonly _clientWorkDir: string

  private readonly _dataPath: string

  constructor(init?: Partial<EIP1559Config>) {
    Object.assign(this, init)
    this._clientWorkDir = `${this.workDir}/config/${this.client.toLowerCase()}`
    this._dataPath = `${this.workDir}/config/${this.client.toLowerCase()}/data`
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

  get dataPath(): string {
    return this._dataPath
  }

  get ethStatsEnabled(): boolean {
    return this._ethStatsEnabled
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

  private readonly _staticNodesPath: string

  private readonly _logFilePath: string

  constructor(genesisURL: string, configURL: string, workDir: string, client: string) {
    this._genesisURL = genesisURL
    this._configURL = configURL
    this._workDir = workDir
    this._genesisLocalTemplatePath = `${workDir}/config/${client}/genesis.json.template`
    this._genesisLocalPath = `${workDir}/config/${client}/genesis.json`
    this._configLocalTemplatePath = `${workDir}/config/${client}/config.toml.template`
    this._configLocalPath = `${workDir}/config/${client}/config.toml`
    this._staticNodesPath = `${workDir}/config/${client}/data/static-nodes.json`
    this._logFilePath = `${workDir}/config/${client}/besu.log`
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

  get staticNodesPath(): string {
    return this._staticNodesPath
  }

  get logFilePath(): string {
    return this._logFilePath
  }
}
