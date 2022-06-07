import { Address, BigInt } from '@graphprotocol/graph-ts'
import { PositionNFTFactory } from '../../generated/PositionNFTFactory/PositionNFTFactory'
import { 
  NFT_FACTORY_ADDRESS,
  NFT_MARKETPLACE_PROXY_ADDRESS,
  NFT_REWARD_POOL_ADDRESS,
  NFT_REWARD_POOL_V2_ADDRESS,
  ZERO_ADDRESS,
  ZERO_BI
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
  if (from == NFT_REWARD_POOL_ADDRESS || from == NFT_REWARD_POOL_V2_ADDRESS) {
    return 'Unstake'
  }
  if (to == NFT_REWARD_POOL_ADDRESS || to == NFT_REWARD_POOL_V2_ADDRESS) {
    return 'Stake'
  }
  if (from == NFT_MARKETPLACE_PROXY_ADDRESS || to == NFT_MARKETPLACE_PROXY_ADDRESS) {
    return 'TradeOnMarketplace'
  }

  return 'Transfer'
}

export function getNftStatus(from: string, to: string): string {
  from = from.toString().toLowerCase()
  to = to.toString().toLowerCase()

  if (to == NFT_REWARD_POOL_ADDRESS || to == NFT_REWARD_POOL_V2_ADDRESS) {
    return 'Staking'
  }
  if (to == NFT_MARKETPLACE_PROXY_ADDRESS) {
    return 'Trading'
  }

  return 'Holding'
}

export function getContractName(contractAddress: string): string {
  if (contractAddress.toLowerCase() == NFT_FACTORY_ADDRESS) {
    return 'PositionFactory'
  }
  if (contractAddress.toLowerCase() == NFT_REWARD_POOL_ADDRESS) {
    return 'PositionRewardPool'
  }
  if (contractAddress.toLowerCase() == NFT_REWARD_POOL_V2_ADDRESS) {
    return 'PositionRewardPoolV2'
  }
  if (contractAddress.toLowerCase() == NFT_MARKETPLACE_PROXY_ADDRESS) {
    return 'PositionMarketplace'
  }

  return ''
}

export function getGradeOfNft(nftId: string): BigInt {
  let factory = PositionNFTFactory.bind(Address.fromString(NFT_FACTORY_ADDRESS))
  let nft = factory.try_getGego(BigInt.fromString(nftId))
  if (!nft.reverted) {
    return nft.value.value0
  }

  return ZERO_BI
}
