import { BigInt, ethereum } from '@graphprotocol/graph-ts'
import { Pool, PositionStakingManager, Transaction, User, UserPoolData } from '../../generated/schema'
import { BD_ZERO, ZERO_BI } from '../utils/constant'
import { getPoolLpToken } from '../utils/getPoolLpToken'

export function getOrInitPositionStakingManager(event: ethereum.Event): PositionStakingManager {
  let stakingManager = PositionStakingManager.load('1')
  if (!stakingManager) {
    stakingManager = new PositionStakingManager('1')
    stakingManager.totalTransactions = ZERO_BI
    stakingManager.totalTokensLocked = BD_ZERO
    stakingManager.totalUniqueFarmers = ZERO_BI
    stakingManager.createdBlockNumber = event.block.number
    stakingManager.createdTimestamp = event.block.timestamp
    stakingManager.updatedTimestamp = event.block.timestamp
    stakingManager.save()
  }

  return stakingManager
}


export function getOrInitPool(pid: BigInt, event: ethereum.Event): Pool {
  let pool = Pool.load(pid.toString())
  if (!pool) {
    pool = new Pool(pid.toString())
    pool.lpToken = getPoolLpToken(pid)
    pool.totalTransactions = ZERO_BI
    pool.totalTokensLocked = BD_ZERO
    pool.totalUniqueFarmers = ZERO_BI
    pool.createdBlockNumber = event.block.number
    pool.createdTimestamp = event.block.timestamp
    pool.updatedTimestamp = event.block.timestamp
    pool.save()
  }

  return pool
}

export function getOrInitUser(userAddress: string, event: ethereum.Event): User {
  let user = User.load(userAddress)
  if (!user) {
    user = new User(userAddress)
    user.totalTransactions = ZERO_BI
    user.createdBlockNumber = event.block.number
    user.createdTimestamp = event.block.timestamp
    user.updatedTimestamp = event.block.timestamp
    user.save()
  }

  return user
}

export function getOrInitUserPoolData(user: User, pool: Pool, event: ethereum.Event): UserPoolData {
  let userPoolDataId = user.id + ':' + pool.id
  let userPoolData = UserPoolData.load(userPoolDataId)
  if (!userPoolData) {
    userPoolData = new UserPoolData(userPoolDataId)
    userPoolData.user = user.id
    userPoolData.pool = pool.id
    userPoolData.amountTokensStaked = BD_ZERO
    userPoolData.createdBlockNumber = event.block.number
    userPoolData.createdTimestamp = event.block.timestamp
    userPoolData.updatedTimestamp = event.block.timestamp
    userPoolData.save()
  }

  return userPoolData
}

export function initTransaction(sender: User, action: string, event: ethereum.Event): void {
  let transaction = new Transaction(action + ':' + event.transaction.hash.toHexString())
  transaction.txHash = event.transaction.hash
  transaction.action = action
  transaction.sender = sender.id
  transaction.gasLimit = event.transaction.gasLimit
  transaction.gasPrice = event.transaction.gasPrice
  transaction.createdBlockNumber = event.block.number
  transaction.createdTimestamp = event.block.timestamp
  transaction.save()
}
