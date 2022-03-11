import { BigInt } from '@graphprotocol/graph-ts'

export const ZERO_BI = BigInt.fromI32(0)
export const ONE_BI = BigInt.fromI32(1)

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const NFT_MARKETPLACE_PROXY_ADDRESS = '0x05e5b3cd263c4cd40cfa74b5e221dbede60c632e'
export const NFT_REWARD_POOL_ADDRESS = '0xbe9ff181bfa9dd78191b81b23fd4ff774a3fb4f1'

export const ACTION_MINT = 'Mint'
export const ACTION_BURN = 'Burn'
export const ACTION_TRANSFER = 'Transfer'
export const ACTION_TRADE = 'TradeOnMarketplace'
export const ACTION_STAKE = 'Stake'
export const ACTION_UNSTAKE = 'Unstake'
