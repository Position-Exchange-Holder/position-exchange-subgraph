import { BigInt } from '@graphprotocol/graph-ts'

export const ZERO_BI = BigInt.fromI32(0)
export const ONE_BI = BigInt.fromI32(1)

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const POSI_STAKING_MANAGER_ADDRESS = '0x0c54b0b7d61de871db47c3ad3f69feb0f2c8db0b'

export const BOND_STAKING_PID = 5

export const ACTION_PURCHASE = 'Purchase'
export const ACTION_TRANSFER = 'Transfer'
export const ACTION_TRADE = 'Trade'
export const ACTION_STAKE = 'Stake'
export const ACTION_UNSTAKE = 'Unstake'
export const ACTION_BURN = 'Burn'
