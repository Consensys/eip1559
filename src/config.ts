export enum Client {
  BESU = 'BESU',
}

export enum Network {
  RHODES = 'RHODES',
}

export class DefaultConfig {
  static readonly client = Client.BESU

  static readonly network = Network.RHODES
}

