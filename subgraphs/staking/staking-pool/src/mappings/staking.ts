import { store } from '@graphprotocol/graph-ts'
import { Deposit, EmergencyWithdraw, Withdraw } from '../../generated/PositionStakingManager/PositionStakingManager'
import { getOrInitPool, getOrInitPositionStakingManager, getOrInitUser, getOrInitUserPoolData, initTransaction } from '../helpers/initializers'
import { ACTION_DEPOSIT, ACTION_EMERGENCY_WITHDRAW, ACTION_WITHDRAW, BD_ZERO, ONE_BI } from '../utils/constant'

export function handleDeposit(event: Deposit): void {
  let pid = event.params.pid
  let amountToken = event.params.amount.toBigDecimal()

  // User
  let user = getOrInitUser(event.transaction.from.toHex(), event)
  user.totalTransactions = user.totalTransactions.plus(ONE_BI)
  user.updatedTimestamp = event.block.timestamp
  user.save()

  // PositionStakingManager
  let positionStakingManager = getOrInitPositionStakingManager(event)
  positionStakingManager.totalTransactions = positionStakingManager.totalTransactions.plus(ONE_BI)
  positionStakingManager.totalTokensLocked = positionStakingManager.totalTokensLocked.plus(amountToken)
  if (user.createdBlockNumber.equals(event.block.number)) {
    positionStakingManager.totalUniqueFarmers = positionStakingManager.totalUniqueFarmers.plus(ONE_BI)
  }
  positionStakingManager.updatedTimestamp = event.block.timestamp
  positionStakingManager.save()

  // Pool
  let pool = getOrInitPool(pid, event)
  pool.totalTransactions = pool.totalTransactions.plus(ONE_BI)
  pool.totalTokensLocked = pool.totalTokensLocked.plus(amountToken)

  // UserPoolData
  let userPoolData = getOrInitUserPoolData(user, pool, event)
  userPoolData.amountTokensStaked = userPoolData.amountTokensStaked.plus(amountToken)
  userPoolData.updatedTimestamp = event.block.timestamp
  userPoolData.save()

  if (userPoolData.createdBlockNumber.equals(event.block.number)) {
    pool.totalUniqueFarmers = pool.totalUniqueFarmers.plus(ONE_BI)
  }
  pool.updatedTimestamp = event.block.timestamp
  pool.save()

  // Transaction
  initTransaction(user, ACTION_DEPOSIT, event)
}

export function handleWithdraw(event: Withdraw): void {
  let pid = event.params.pid
  let amountToken = event.params.amount.toBigDecimal()

  // User
  let user = getOrInitUser(event.transaction.from.toHex(), event)
  user.totalTransactions = user.totalTransactions.plus(ONE_BI)
  user.updatedTimestamp = event.block.timestamp
  user.save()

  // PositionStakingManager
  let positionStakingManager = getOrInitPositionStakingManager(event)
  positionStakingManager.totalTransactions = positionStakingManager.totalTransactions.plus(ONE_BI)
  positionStakingManager.totalTokensLocked = positionStakingManager.totalTokensLocked.minus(amountToken)
  positionStakingManager.updatedTimestamp = event.block.timestamp
  positionStakingManager.save()

  // Pool
  let pool = getOrInitPool(pid, event)
  pool.totalTransactions = pool.totalTransactions.plus(ONE_BI)
  pool.totalTokensLocked = pool.totalTokensLocked.minus(amountToken)
  pool.updatedTimestamp = event.block.timestamp
  pool.save()

  // UserPoolData
  let userPoolData = getOrInitUserPoolData(user, pool, event)
  let amountTokensStakedOfUserAfterWithdraw = userPoolData.amountTokensStaked.minus(amountToken)
  if (amountTokensStakedOfUserAfterWithdraw.equals(BD_ZERO)) {
    store.remove('UserPoolData', userPoolData.id)
  } else {
    userPoolData.amountTokensStaked = amountTokensStakedOfUserAfterWithdraw
    userPoolData.updatedTimestamp = event.block.timestamp
    userPoolData.save()
  }

  // Transaction
  initTransaction(user, ACTION_WITHDRAW, event)
}

export function handleEmergencyWithdraw(event: EmergencyWithdraw): void {
  let pid = event.params.pid
  let userAddress = event.params.user.toHex()
  let amountToken = event.params.amount.toBigDecimal()

  // User
  let user = getOrInitUser(userAddress, event)
  user.totalTransactions = user.totalTransactions.plus(ONE_BI)
  user.updatedTimestamp = event.block.timestamp
  user.save()

  // PositionStakingManager
  let positionStakingManager = getOrInitPositionStakingManager(event)
  positionStakingManager.totalTransactions = positionStakingManager.totalTransactions.plus(ONE_BI)
  positionStakingManager.totalTokensLocked = positionStakingManager.totalTokensLocked.minus(amountToken)
  positionStakingManager.updatedTimestamp = event.block.timestamp
  positionStakingManager.save()

  // Pool
  let pool = getOrInitPool(pid, event)
  pool.totalTransactions = pool.totalTransactions.plus(ONE_BI)
  pool.totalTokensLocked = pool.totalTokensLocked.minus(amountToken)
  pool.updatedTimestamp = event.block.timestamp
  pool.save()

  // UserPoolData
  let userPoolData = getOrInitUserPoolData(user, pool, event)
  store.remove('UserPoolData', userPoolData.id)

  // Transaction
  initTransaction(user, ACTION_EMERGENCY_WITHDRAW, event)
}
