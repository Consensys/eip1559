import {DefaultConfig, Network} from './config'

export class FaucetNodeInfo {
  private readonly _rpcURL: string

  private readonly _giver: string

  private readonly _giverAddress: string

  private readonly _chaindId: number

  constructor(rpcURL: string, giver: string, giverAddress: string, chaindId: number) {
    this._rpcURL = rpcURL
    this._giver = giver
    this._giverAddress = giverAddress
    this._chaindId = chaindId
  }

  get rpcURL(): string {
    return this._rpcURL
  }

  get giver(): string {
    return this._giver
  }

  get giverAddress(): string {
    return this._giverAddress
  }

  get chaindId(): number {
    return this._chaindId
  }
}

export const defaultFaucet = new FaucetNodeInfo(
  'http://3.136.236.37:8545',
  '0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63',
  '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73',
  280
)

export const FaucetNodes = new Map<string, FaucetNodeInfo>([
  [Network.RHODES, new FaucetNodeInfo(
    'http://3.136.236.37:8545',
    '0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63',
    '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73',
    280
  )],
])

export class FaucetConfig {
  public readonly _network: string = DefaultConfig.network

  public readonly _address: string

  constructor(address: string, init?: Partial<FaucetConfig>) {
    Object.assign(this, init)
    this._address = address
  }

  get network(): string {
    return this._network
  }

  get address(): string | null {
    return this._address
  }
}
