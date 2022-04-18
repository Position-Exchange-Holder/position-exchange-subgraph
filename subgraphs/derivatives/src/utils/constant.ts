import { BigInt } from '@graphprotocol/graph-ts'

export const ZERO_BI = BigInt.fromI32(0)
export const ONE_BI = BigInt.fromI32(1)

export const MAX_UINT_256 = BigInt.fromString('115792089237316195423570985008687907853269984665640564039457584007913129639935')
export const HALF_OF_MAX_UINT_256 = BigInt.fromString('340282366920938463463374607431768211456')

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

// Side
export const LONG = 'LONG'
export const SHORT = 'SHORT'