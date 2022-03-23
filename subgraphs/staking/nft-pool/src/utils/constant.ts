import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'

export const ZERO_BI = BigInt.fromI32(0)
export const ONE_BI = BigInt.fromI32(1)
export const BD_ZERO = BigDecimal.fromString('0')
export const BD_1E18 = BigDecimal.fromString('1e18')

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const POSITION_NFT_FACTORY_ADDRESS = '0x9d95b5ea6c8f678b7486be7a6331ec10a54156bd'

export const ACTION_STAKE = 'Stake'
export const ACTION_HAVEST = 'Harvest'
export const ACTION_UNSTAKE = 'Unstake'
