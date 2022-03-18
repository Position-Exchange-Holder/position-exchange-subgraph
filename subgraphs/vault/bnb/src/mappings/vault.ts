import { Compound, RewardPaid } from '../../generated/PositionBnbVault/PositionBnbVault'
import { getOrInitCompounder, getOrInitPositionVault, getOrInitUser, initCompoundTransaction, initHarvestTransaction } from '../helpers/initializers'
import { ONE_BI } from '../utils/constant'

export function handleCompound(event: Compound): void {
  let compounderAddress = event.params.caller
  let rewardAmount = event.params.reward

  let compounder = getOrInitCompounder(compounderAddress.toHexString(), event)
  compounder.totalCompoundTransactions = compounder.totalCompoundTransactions.plus(ONE_BI)
  compounder.totalRewardEarned = compounder.totalRewardEarned.plus(rewardAmount)
  compounder.updatedTimestamp = event.block.timestamp
  compounder.save()
  
  let positionVault = getOrInitPositionVault(event)
  positionVault.totalCompoundTransactions = positionVault.totalCompoundTransactions.plus(ONE_BI)
  positionVault.totalRewardPaidForCompounder = positionVault.totalRewardPaidForCompounder.plus(rewardAmount)
  if (compounder.createdBlockNumber.equals(event.block.number)) {
    positionVault.totalUniqueCompounders = positionVault.totalUniqueCompounders.plus(ONE_BI)
  }
  positionVault.updatedTimestamp = event.block.timestamp
  positionVault.save()

  initCompoundTransaction(compounder, rewardAmount, event)
}

export function handleRewardPaid(event: RewardPaid): void {
  let userAddress = event.params.account
  let rewardAmount = event.params.reward

  let user = getOrInitUser(userAddress.toHexString(), event)
  user.totalHarvestTransactions = user.totalHarvestTransactions.plus(ONE_BI)
  user.totalRewardEarned = user.totalRewardEarned.plus(rewardAmount)
  user.updatedTimestamp = event.block.timestamp
  user.save()

  initHarvestTransaction(user, rewardAmount, event)
}
