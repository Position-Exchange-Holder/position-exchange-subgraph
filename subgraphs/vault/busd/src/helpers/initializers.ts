import { ethereum, BigInt } from '@graphprotocol/graph-ts'
import { Compounder, PositionVault, CompoundTransaction, HarvestTransaction, User } from '../../generated/schema'
import { ZERO_BI } from '../utils/constant'

export function getOrInitPositionVault(event: ethereum.Event): PositionVault {
  let positionVault = PositionVault.load('1')
  if (!positionVault) {
    positionVault = new PositionVault('1')
    positionVault.totalCompoundTransactions = ZERO_BI
    positionVault.totalRewardPaidForCompounder = ZERO_BI
    positionVault.totalUniqueCompounders = ZERO_BI
    positionVault.createdBlockNumber = event.block.number
    positionVault.createdTimestamp = event.block.timestamp
    positionVault.updatedTimestamp = event.block.timestamp
    positionVault.save()
  }

  return positionVault
}

export function getOrInitCompounder(compounderAddress: string, event: ethereum.Event): Compounder {
  let compounder = Compounder.load('C' + compounderAddress)
  if (!compounder) {
    compounder = new Compounder('C' + compounderAddress)
    compounder.totalCompoundTransactions = ZERO_BI
    compounder.totalRewardEarned = ZERO_BI
    compounder.createdBlockNumber = event.block.number
    compounder.createdTimestamp = event.block.timestamp
    compounder.updatedTimestamp = event.block.timestamp
    compounder.save()
  }

  return compounder
}

export function getOrInitUser(userAddress: string, event: ethereum.Event): User {
  let user = User.load('U' + userAddress)
  if (!user) {
    user = new User('U' + userAddress)
    user.totalHarvestTransactions = ZERO_BI
    user.totalRewardEarned = ZERO_BI
    user.createdBlockNumber = event.block.number
    user.createdTimestamp = event.block.timestamp
    user.updatedTimestamp = event.block.timestamp
    user.save()
  }

  return user
}

export function initCompoundTransaction(
  sender: Compounder,
  reward: BigInt,
  event: ethereum.Event
): void {
  let transaction = new CompoundTransaction(event.transaction.hash.toHexString())
  transaction.sender = sender.id
  transaction.reward = reward
  transaction.gasLimit = event.transaction.gasLimit
  transaction.gasPrice = event.transaction.gasPrice
  transaction.createdBlockNumber = event.block.number
  transaction.createdTimestamp = event.block.timestamp
  transaction.save()
}

export function initHarvestTransaction(
  sender: User,
  reward: BigInt,
  event: ethereum.Event
): void {
  let transaction = new HarvestTransaction(event.transaction.hash.toHexString())
  transaction.sender = sender.id
  transaction.reward = reward
  transaction.gasLimit = event.transaction.gasLimit
  transaction.gasPrice = event.transaction.gasPrice
  transaction.createdBlockNumber = event.block.number
  transaction.createdTimestamp = event.block.timestamp
  transaction.save()
}
