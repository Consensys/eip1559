import {test} from '@oclif/test'
import Errors from '../../src/errors'

describe('run', () => {
  test
  .stdout()
  .command(['run', '--network', 'INVALID'])
  .exit(Errors.INVALID_NETWORK)
  .it('fails with invalid network')
})
