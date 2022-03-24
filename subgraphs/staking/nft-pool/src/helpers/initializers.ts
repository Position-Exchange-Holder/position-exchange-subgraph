import { BigDecimal, ethereum } from '@graphprotocol/graph-ts'
import { NftRewardPoolDayData, PositionNftRewardPool, Transaction, User } from '../../generated/schema'
import { BD_ZERO, ZERO_BI } from '../utils/constant'

export function getOrInitPositionNftRewardPool(event: ethereum.Event): PositionNftRewardPool {
  let positionNftRewardPool = PositionNftRewardPool.load('1')
  if (!positionNftRewardPool) {
    positionNftRewardPool = new PositionNftRewardPool('1')
    positionNftRewardPool.totalTransactions = ZERO_BI
    positionNftRewardPool.totalUniqueFarmers = ZERO_BI
    positionNftRewardPool.totalPowerStaked = BD_ZERO
    positionNftRewardPool.totalTokensLocked = BD_ZERO
    positionNftRewardPool.totalTokensPaidForUser = BD_ZERO
    positionNftRewardPool.createdBlockNumber = event.block.number
    positionNftRewardPool.createdTimestamp = event.block.timestamp
    positionNftRewardPool.updatedTimestamp = event.block.timestamp
    positionNftRewardPool.save()
  }

  return positionNftRewardPool
}

export function getOrInitNftRewardPoolDayData(event: ethereum.Event): NftRewardPoolDayData {
  let timestamp = event.block.timestamp.toI32()
  let dayID = (timestamp / 86400).toString()

  let nftRewardPoolDayData = NftRewardPoolDayData.load(dayID)
  if (!nftRewardPoolDayData) {
    nftRewardPoolDayData = new NftRewardPoolDayData(dayID)
    nftRewardPoolDayData.date = timestamp
    nftRewardPoolDayData.dailyTransactions = ZERO_BI
    nftRewardPoolDayData.dailyNftsDeposited = ZERO_BI
    nftRewardPoolDayData.dailyTokensLocked = BD_ZERO
    nftRewardPoolDayData.dailyNftsWithdrawn = ZERO_BI
    nftRewardPoolDayData.dailyTokensPaidForUser = BD_ZERO
    nftRewardPoolDayData.dailyNewUsers = ZERO_BI
    nftRewardPoolDayData.createdBlockNumber = event.block.number
    nftRewardPoolDayData.save()
  }

  return nftRewardPoolDayData
}

export function getOrInitUser(userAddresss: string, event: ethereum.Event): User {
  let user = User.load(userAddresss)
  if (!user) {
    user = new User(userAddresss)
    user.totalTransactions = ZERO_BI
    user.nftsStaked = []
    user.totalNftsStaked = ZERO_BI
    user.totalPowerStaked = BD_ZERO
    user.totalTokensLocked = BD_ZERO
    user.totalRewardEarned = BD_ZERO
    user.createdBlockNumber = event.block.number
    user.createdTimestamp = event.block.timestamp
    user.updatedTimestamp = event.block.timestamp
    user.save()
  }

  return user
}

export function initTransaction(
  sender: User,
  action: string,
  event: ethereum.Event,
  nftId: string | null,
  amountRewardToken: BigDecimal | null
): void {
  let transaction = new Transaction(action + ':' + event.transaction.hash.toHexString())
  transaction.txHash = event.transaction.hash
  transaction.action = action
  transaction.nftId = nftId
  transaction.amountRewardToken = amountRewardToken
  transaction.sender = sender.id
  transaction.gasLimit = event.transaction.gasLimit
  transaction.gasPrice = event.transaction.gasPrice
  transaction.createdBlockNumber = event.block.number
  transaction.createdTimestamp = event.block.timestamp
  transaction.save()
}
