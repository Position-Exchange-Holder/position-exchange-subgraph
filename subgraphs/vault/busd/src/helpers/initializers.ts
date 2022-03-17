import { ethereum, BigInt } from '@graphprotocol/graph-ts'
import { Compounder, PositionVault, Transaction } from '../../generated/schema'
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
  let compounder = Compounder.load(compounderAddress)
  if (!compounder) {
    compounder = new Compounder(compounderAddress)
    compounder.totalCompoundTransactions = ZERO_BI
    compounder.totalRewardEarned = ZERO_BI
    compounder.createdBlockNumber = event.block.number
    compounder.createdTimestamp = event.block.timestamp
    compounder.updatedTimestamp = event.block.timestamp
    compounder.save()
  }

  return compounder
}

export function initTransaction(sender: Compounder, reward: BigInt, event: ethereum.Event): void {
  let transaction = new Transaction(event.transaction.hash.toString())
  transaction.sender = sender.id
  transaction.reward = reward
  transaction.gasLimit = event.transaction.gasLimit
  transaction.gasPrice = event.transaction.gasPrice
  transaction.createdBlockNumber = event.block.number
  transaction.createdTimestamp = event.block.timestamp
  transaction.save()
}
