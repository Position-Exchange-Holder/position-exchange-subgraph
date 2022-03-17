import { Compound } from '../../generated/PositionBusdVault/PositionBusdVault'
import { getOrInitCompounder, getOrInitPositionVault, initTransaction } from '../helpers/initializers'
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

  initTransaction(compounder, rewardAmount, event)
}
