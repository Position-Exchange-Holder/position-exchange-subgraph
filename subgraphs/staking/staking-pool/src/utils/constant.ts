import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'

export const ZERO_BI = BigInt.fromI32(0)
export const ONE_BI = BigInt.fromI32(1)
export const BD_ZERO = BigDecimal.fromString('0')

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const ACTION_DEPOSIT = 'Deposit'
export const ACTION_WITHDRAW = 'Withdraw'
export const ACTION_EMERGENCY_WITHDRAW = 'EmergencyWithdraw'
