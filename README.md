eip1559
=======

EIP-1559 command line tools

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/eip1559.svg)](https://npmjs.org/package/eip1559)
[![Downloads/week](https://img.shields.io/npm/dw/eip1559.svg)](https://npmjs.org/package/eip1559)
[![License](https://img.shields.io/npm/l/eip1559.svg)](https://github.com/abdelhamidbakhta/eip1559/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g eip1559
$ eip1559 COMMAND
running command...
$ eip1559 (-v|--version|version)
eip1559/1.0.3 darwin-x64 node-v15.3.0
$ eip1559 --help [COMMAND]
USAGE
  $ eip1559 COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`eip1559 faucet [FILE]`](#eip1559-faucet-file)
* [`eip1559 help [COMMAND]`](#eip1559-help-command)
* [`eip1559 install:besu`](#eip1559-installbesu)
* [`eip1559 run`](#eip1559-run)

## `eip1559 faucet [FILE]`

describe the command here

```
USAGE
  $ eip1559 faucet [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/faucet.ts](https://github.com/abdelhamidbakhta/eip1559/blob/v1.0.3/src/commands/faucet.ts)_

## `eip1559 help [COMMAND]`

display help for eip1559

```
USAGE
  $ eip1559 help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.1/src/commands/help.ts)_

## `eip1559 install:besu`

describe the command here

```
USAGE
  $ eip1559 install:besu

OPTIONS
  -h, --help             show CLI help
  -p, --path=path        [default: /Users/abdelhamid/.eip1559/install/besu] install path
  -v, --version=version  [default: 20.10.3] version of Besu to install
```

_See code: [src/commands/install/besu.ts](https://github.com/abdelhamidbakhta/eip1559/blob/v1.0.3/src/commands/install/besu.ts)_

## `eip1559 run`

Run an EIP-1559 capable Ethereum node on the specified network

```
USAGE
  $ eip1559 run

OPTIONS
  -c, --client=client    [default: BESU] ethereum client
  -e, --ethStatsEnabled  enable eth stats
  -f, --force
  -h, --help             show CLI help
  -n, --network=network  [default: RHODES] network to use
  -w, --workDir=workDir  [default: /Users/abdelhamid/.eip1559] working directory
```

_See code: [src/commands/run.ts](https://github.com/abdelhamidbakhta/eip1559/blob/v1.0.3/src/commands/run.ts)_
<!-- commandsstop -->
