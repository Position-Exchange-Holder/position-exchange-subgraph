import { BigInt, BigDecimal } from '@graphprotocol/graph-ts'

// BigInt
export const ZERO_BI = BigInt.fromI32(0)
export const ONE_BI = BigInt.fromI32(1)

// BigDecimal
export const BD_ZERO = BigDecimal.fromString('0')
export const BD_1E18 = BigDecimal.fromString('1e18')

// ID
export const DEFAULT_ID = '1'

// Action
export const ACTION_TRANSFER = 'Transfer'
export const ACTION_MINT = 'Mint'
export const ACTION_BURN = 'Burn'

// Token
export const TOKEN_MAX_SUPPLY = 100_000_000
export const TOKEN_TRANSFER_TAX_RATE = 100 // 1%
