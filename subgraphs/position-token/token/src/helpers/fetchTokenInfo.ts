import { BigInt, dataSource } from '@graphprotocol/graph-ts'
import { PositionToken } from '../../generated/PositionToken/PositionToken'

export function fetchTokenName(): string {
  let positionToken = PositionToken.bind(dataSource.address())

  let nameResult = positionToken.try_name()
  if (!nameResult.reverted) {
    return nameResult.value
  }

  return 'unknown'
}

export function fetchTokenSymbol(): string {
  let positionToken = PositionToken.bind(dataSource.address())

  let symbolResult = positionToken.try_symbol()
  if (!symbolResult.reverted) {
    return symbolResult.value
  }

  return 'unknown'
}

export function fetchTokenDecimals(): BigInt {
  let positionToken = PositionToken.bind(dataSource.address())

  let decimalsResult = positionToken.try_decimals()
  if (!decimalsResult.reverted) {
    return BigInt.fromI32(decimalsResult.value)
  }

  return BigInt.fromI32(0)
}
