import { ADDRESS_LABELS, ZERO_ADDRESS } from './addresses'
import {
  ACTION_BURN,
  ACTION_MINT,
  ACTION_TRANSFER,
} from './constant'

export function getTransferAction(from: string, to: string): string {
  from = from.toLowerCase()
  to = to.toLowerCase()

  if (from == ZERO_ADDRESS) {
    return ACTION_MINT
  }

  if (to == ZERO_ADDRESS) {
    return ACTION_BURN
  }

  return ACTION_TRANSFER
}

export function getAddressLabel(userAddress: string): string {
  userAddress = userAddress.toLowerCase()
  if (userAddress == ADDRESS_LABELS[0]) {
    return 'PosiNFTMintProxy'
  }
  if (userAddress == ADDRESS_LABELS[1]) {
    return 'LP_POSI_BUSD'
  }
  if (userAddress == ADDRESS_LABELS[2]) {
    return 'POSICompanyReserve'
  }
  if (userAddress == ADDRESS_LABELS[3]) {
    return 'LP_POSI_WBNB'
  }
  if (userAddress == ADDRESS_LABELS[4]) {
    return 'POSITeamRewardsLockingContract'
  }
  if (userAddress == ADDRESS_LABELS[5]) {
    return 'PositionBond003'
  }
  if (userAddress == ADDRESS_LABELS[6]) {
    return 'GeneralNFTReward'
  }
  if (userAddress == ADDRESS_LABELS[7]) {
    return 'PositionBond002'
  }
  if (userAddress == ADDRESS_LABELS[8]) {
    return 'PosiStakingManager'
  }
  if (userAddress == ADDRESS_LABELS[9]) {
    return 'PosiV2Migrate'
  }
  if (userAddress == ADDRESS_LABELS[10]) {
    return 'VaultReferralTreasury'
  }
  if (userAddress == ADDRESS_LABELS[11]) {
    return 'Bybit'
  }
  if (userAddress == ADDRESS_LABELS[12]) {
    return 'POSITeamRewardsLockingContract'
  }
  if (userAddress == ADDRESS_LABELS[13]) {
    return 'PositionBond01'
  }
  if (userAddress == ADDRESS_LABELS[14]) {
    return 'NFTRewardTeamWallet'
  }
  if (userAddress == ADDRESS_LABELS[15]) {
    return 'PosiTreasury'
  }
  if (userAddress == ADDRESS_LABELS[16]) {
    return 'Gate.io'
  }
  if (userAddress == ADDRESS_LABELS[17]) {
    return 'PositionTokenGovernor'
  }
  if (userAddress == ADDRESS_LABELS[18]) {
    return 'MEXC'
  }
  if (userAddress == ADDRESS_LABELS[19]) {
    return 'PositionToken'
  }
  if (userAddress == ADDRESS_LABELS[20]) {
    return 'PositionExchangeDeployer'
  }

  return ''
}
