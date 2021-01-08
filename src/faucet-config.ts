import {DefaultConfig, Network} from './config'

export class FaucetNodeInfo {
  private readonly _rpcURL: string

  private readonly _giver: string

  constructor(rpcURL: string, giver: string) {
    this._rpcURL = rpcURL
    this._giver = giver
  }

  get rpcURL(): string {
    return this._rpcURL
  }

  get giver(): string {
    return this._giver
  }
}

export const FaucetNodes = new Map<string, FaucetNodeInfo>([
  [Network.RHODES, new FaucetNodeInfo(
    'http://3.136.236.37:8545',
    'ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f'
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
