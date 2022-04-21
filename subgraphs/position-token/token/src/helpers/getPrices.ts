import { Address, BigDecimal } from '@graphprotocol/graph-ts'
import { Pair } from '../../generated/templates/Pair/Pair'
import { LP_PAIRS } from '../utils/addresses'
import { BD_1E18, BD_ZERO } from '../utils/constant'

export function getPosiPriceInBUSD(): BigDecimal {
  let lpPair = Pair.bind(Address.fromString(LP_PAIRS[0])) // POSI/BUSD

  let reserves = lpPair.try_getReserves()

  if (!reserves.reverted) {
    let reserve0 = reserves.value.value0.toBigDecimal().div(BD_1E18)
    let reserve1 = reserves.value.value1.toBigDecimal().div(BD_1E18)
    if (reserve0.notEqual(BD_ZERO)) {
      return reserve1.div(reserve0)
    }
  }

  return BD_ZERO
}

export function getPosiPriceInBNB(): BigDecimal {
  let lpPair = Pair.bind(Address.fromString(LP_PAIRS[1])) // POSI/WBNB

  let reserves = lpPair.try_getReserves()

  if (!reserves.reverted) {
    let reserve0 = reserves.value.value0.toBigDecimal().div(BD_1E18)
    let reserve1 = reserves.value.value1.toBigDecimal().div(BD_1E18)
    if (reserve0.notEqual(BD_ZERO)) {
      return reserve1.div(reserve0)
    }
  }
  
  return BD_ZERO
}

export function getBNBPriceInBUSD(): BigDecimal {
  let lpPair = Pair.bind(Address.fromString(LP_PAIRS[2])) // WBNB/BUSD

  let reserves = lpPair.try_getReserves()

  if (!reserves.reverted) {
    let reserve0 = reserves.value.value0.toBigDecimal().div(BD_1E18)
    let reserve1 = reserves.value.value1.toBigDecimal().div(BD_1E18)
    if (reserve0.notEqual(BD_ZERO)) {
      return reserve1.div(reserve0)
    }
  }
  
  return BD_ZERO
}
