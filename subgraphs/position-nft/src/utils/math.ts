import { BigInt } from '@graphprotocol/graph-ts'

export function minusOnePercent(number: BigInt): BigInt {
  return number.minus(number.div(BigInt.fromI32(100)))
}
