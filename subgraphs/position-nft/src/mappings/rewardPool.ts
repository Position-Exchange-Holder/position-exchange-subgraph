import { log } from '@graphprotocol/graph-ts'
import { RewardAdded } from '../../generated/PositionNFTRewardPool/PositionNFTRewardPool'
import { initRewardPool } from '../helpers/initializers'

export function handleRewardAdded(event: RewardAdded): void {
  let rewardPool = initRewardPool(event)

  if (!rewardPool) {
    log.error('[ERROR] RewardPool', [])
  }
}
