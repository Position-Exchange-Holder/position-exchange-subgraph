import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { BD_ZERO, ZERO_BI } from '../utils/constant'

export function calculateRealizedPnl(
  posiIn: BigInt,
  volumeInBUSD: BigDecimal
): BigDecimal {
  let action = getBuyOrSellAction(posiIn)
  if (action == 'buy') {
    return BD_ZERO.minus(volumeInBUSD)
  } else {
    return volumeInBUSD
  }
}


function getBuyOrSellAction(
  posiIn: BigInt
): string {
  if (posiIn.gt(ZERO_BI)) {
    return 'sell'
  } else {
    return 'buy'
  }
}