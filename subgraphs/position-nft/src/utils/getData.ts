import { 
  NFT_FACTORY_ADDRESS,
  NFT_MARKETPLACE_PROXY_ADDRESS,
  NFT_REWARD_POOL_ADDRESS,
  ZERO_ADDRESS
} from './constant'

export function getNftTransferAction(from: string, to: string): string {
  from = from.toString().toLowerCase()
  to = to.toString().toLowerCase()

  if (from == ZERO_ADDRESS) {
    return 'Mint'
  }
  if (to == ZERO_ADDRESS) {
    return 'Burn'
  }
  if (from == NFT_REWARD_POOL_ADDRESS) {
    return 'Unstake'
  }
  if (to == NFT_REWARD_POOL_ADDRESS) {
    return 'Stake'
  }
  if (from == NFT_MARKETPLACE_PROXY_ADDRESS || to == NFT_MARKETPLACE_PROXY_ADDRESS) {
    return 'TradeOnMarketplace'
  }

  return 'Transfer'
}

export function getContractName(contractAddress: string): string {
  if (contractAddress.toLowerCase() == NFT_FACTORY_ADDRESS) {
    return 'PositionFactory'
  }

  if (contractAddress.toLowerCase() == NFT_REWARD_POOL_ADDRESS) {
    return 'PositionRewardPool'
  }
  if (contractAddress.toLowerCase() == NFT_MARKETPLACE_PROXY_ADDRESS) {
    return 'PositionMarketplace'
  }

  return ''
}
