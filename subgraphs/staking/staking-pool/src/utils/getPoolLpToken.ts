import { BigInt, Bytes, dataSource } from '@graphprotocol/graph-ts'
import { PositionStakingManager } from '../../generated/PositionStakingManager/PositionStakingManager'
import { ZERO_ADDRESS } from './constant'

export function getPoolLpToken(pid: BigInt): Bytes {
  let stakingPoolManager = PositionStakingManager.bind(dataSource.address())
  let poolInfo = stakingPoolManager.try_poolInfo(pid)

  if (!poolInfo.reverted) {
    return poolInfo.value.value0
  }

  return Bytes.fromHexString(ZERO_ADDRESS)
}
