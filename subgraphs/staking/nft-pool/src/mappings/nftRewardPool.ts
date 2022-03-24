import { BigDecimal, log } from '@graphprotocol/graph-ts'
import { RewardPaid, StakedGEGO, WithdrawnGego } from '../../generated/PositionNFTRewardPool/PositionNFTRewardPool'
import { getOrInitNftRewardPoolDayData, getOrInitPositionNftRewardPool, getOrInitUser, initTransaction } from '../helpers/initializers'
import { removeElementFromArray } from '../utils/array'
import { calculateMiningPower } from '../utils/calculateMiningPower'
import { ACTION_HAVEST, ACTION_STAKE, ACTION_UNSTAKE, BD_1E18, ONE_BI, ZERO_BI } from '../utils/constant'
import { getGegoInfo } from '../utils/getGegoInfo'

// Stake
export function handleStakedGEGO(event: StakedGEGO): void {
  let nftId = event.params.amount.toString()
  let gego = getGegoInfo(nftId)
  if (gego.grade.equals(ZERO_BI)) {
    log.error('[{}] Get {} err', [
      event.block.timestamp.toString(),
      nftId
    ])
  }
  let nftPower = calculateMiningPower(
    gego.grade.toI32(),
    gego.productivity.toI32(),
    gego.amount.div(BD_1E18)
  )

  // User
  let user = getOrInitUser(event.transaction.from.toHex(), event)
  user.totalTransactions = user.totalTransactions.plus(ONE_BI)
  let nftsStaked = user.nftsStaked
  nftsStaked.push(nftId)
  user.nftsStaked = nftsStaked
  user.totalNftsStaked = user.totalNftsStaked.plus(ONE_BI)
  user.totalPowerStaked = user.totalPowerStaked.plus(nftPower)
  user.totalTokensLocked = user.totalTokensLocked.plus(gego.amount)
  user.updatedTimestamp = event.block.timestamp
  user.save()

  let isNewUser = nftsStaked.length <= 1

  // Reward Pool
  let positionNftRewardPool = getOrInitPositionNftRewardPool(event)
  positionNftRewardPool.totalTransactions = positionNftRewardPool.totalTransactions.plus(ONE_BI)
  if (isNewUser) {
    positionNftRewardPool.totalUniqueFarmers = positionNftRewardPool.totalUniqueFarmers.plus(ONE_BI)
  }
  positionNftRewardPool.totalNftsStaked = positionNftRewardPool.totalNftsStaked.plus(ONE_BI)
  positionNftRewardPool.totalPowerStaked = positionNftRewardPool.totalPowerStaked.plus(nftPower)
  positionNftRewardPool.totalTokensLocked = positionNftRewardPool.totalTokensLocked.plus(gego.amount)
  positionNftRewardPool.updatedTimestamp = event.block.timestamp
  positionNftRewardPool.save()

  // Daily data
  let nftRewardPoolDayData = getOrInitNftRewardPoolDayData(event)
  nftRewardPoolDayData.dailyTransactions = nftRewardPoolDayData.dailyTransactions.plus(ONE_BI)
  nftRewardPoolDayData.dailyNftsDeposited = nftRewardPoolDayData.dailyNftsDeposited
  nftRewardPoolDayData.dailyTokensLocked = nftRewardPoolDayData.dailyTokensLocked.plus(gego.amount)
  if (isNewUser) {
    nftRewardPoolDayData.dailyNewUsers = nftRewardPoolDayData.dailyNewUsers.plus(ONE_BI)
  }
  nftRewardPoolDayData.save()

  // Transaction
  initTransaction(user, ACTION_STAKE, event)
}

// Unstake
export function handleWithdrawnGego(event: WithdrawnGego): void {
  let nftId = event.params.amount.toString()
  let gego = getGegoInfo(nftId)
  if (gego.grade.equals(ZERO_BI)) {
    log.error('[{}] Get {} err', [
      event.block.timestamp.toString(),
      nftId
    ])
  }
  let nftPower = calculateMiningPower(
    gego.grade.toI32(),
    gego.productivity.toI32(),
    gego.amount.div(BD_1E18)
  )

  // User
  let user = getOrInitUser(event.params.user.toHex(), event)
  user.totalTransactions = user.totalTransactions.plus(ONE_BI)
  // Remove NFT from array
  let nftsStaked = user.nftsStaked
  nftsStaked = removeElementFromArray(nftId, nftsStaked)
  user.nftsStaked = nftsStaked
  user.totalNftsStaked = user.totalNftsStaked.minus(ONE_BI)
  user.totalPowerStaked = user.totalPowerStaked.minus(nftPower)
  user.totalTokensLocked = user.totalTokensLocked.minus(gego.amount)
  user.updatedTimestamp = event.block.timestamp
  user.save()

  // Reward Pool
  let positionNftRewardPool = getOrInitPositionNftRewardPool(event)
  positionNftRewardPool.totalTransactions = positionNftRewardPool.totalTransactions.plus(ONE_BI)
  positionNftRewardPool.totalNftsStaked = positionNftRewardPool.totalNftsStaked.minus(ONE_BI)
  positionNftRewardPool.totalPowerStaked = positionNftRewardPool.totalPowerStaked.minus(nftPower)
  positionNftRewardPool.totalTokensLocked = positionNftRewardPool.totalTokensLocked.minus(gego.amount)
  positionNftRewardPool.updatedTimestamp = event.block.timestamp
  positionNftRewardPool.save()

  // Daily Data
  let nftRewardPoolDayData = getOrInitNftRewardPoolDayData(event)
  nftRewardPoolDayData.dailyTransactions = nftRewardPoolDayData.dailyTransactions.plus(ONE_BI)
  nftRewardPoolDayData.dailyNftsWithdrawn = nftRewardPoolDayData.dailyNftsWithdrawn.plus(ONE_BI)
  nftRewardPoolDayData.dailyTokensLocked = nftRewardPoolDayData.dailyTokensLocked.minus(gego.amount)
  nftRewardPoolDayData.save()

  // Transaction
  initTransaction(user, ACTION_UNSTAKE, event)
}

// Harvest
export function handleRewardPaid(event: RewardPaid): void {
  let user = getOrInitUser(event.params.user.toHex(), event)
  let amountToken = BigDecimal.fromString(event.params.reward.toString())
  user.totalTransactions = user.totalTransactions.plus(ONE_BI)
  user.totalRewardEarned = user.totalRewardEarned.plus(amountToken)
  user.updatedTimestamp = event.block.timestamp
  user.save()

  let positionNftRewardPool = getOrInitPositionNftRewardPool(event)
  positionNftRewardPool.totalTransactions = positionNftRewardPool.totalTransactions.plus(ONE_BI)
  positionNftRewardPool.totalTokensPaidForUser = positionNftRewardPool.totalTokensPaidForUser.plus(amountToken)
  positionNftRewardPool.updatedTimestamp = event.block.timestamp
  positionNftRewardPool.save()

  let nftRewardPoolDayData = getOrInitNftRewardPoolDayData(event)
  nftRewardPoolDayData.dailyTokensPaidForUser = nftRewardPoolDayData.dailyTokensPaidForUser.plus(amountToken)
  nftRewardPoolDayData.save()

  initTransaction(user, ACTION_HAVEST, event)
}
