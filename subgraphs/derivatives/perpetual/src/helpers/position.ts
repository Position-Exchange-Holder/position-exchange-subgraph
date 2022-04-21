import { BigInt, ethereum, store } from '@graphprotocol/graph-ts'
import { Position } from '../../generated/schema'
import { LONG, ONE_BI, SHORT, ZERO_BI } from '../utils/constant'
import { getOrInitPositionCounter } from './initializers'

export function getPositionId(market: string, trader: string): string {
  return market + ':' + trader
}

export function getPositionSideBySide(side: string): string {
  return Number(side) == 0 ? LONG : SHORT
}

export function getPositionSideByQuantity(quantity: BigInt): string {
  return quantity.gt(ZERO_BI) ? LONG : SHORT
}

export function getPositionLiquidationId(
  blockNumber: string,
  market: string,
  trader: string
): string {
  return blockNumber + ':' + getPositionId(market, trader)
}

export function increaseOrDecreaseAvailablePosition(
  type: string,
  event: ethereum.Event
): void {
  let counter = getOrInitPositionCounter(event)

  if (type == 'increase') {
    counter.totalAvailablePositions = counter.totalAvailablePositions
      .plus(ONE_BI)
  } else {
    counter.totalAvailablePositions = counter.totalAvailablePositions
      .minus(ONE_BI)
  }

  counter.updatedAt = event.block.timestamp
  counter.save()
}

export function resetPostion(position: Position, event: ethereum.Event): void {
  position.quantity = ZERO_BI
  position.leverage = ZERO_BI
  position.updatedAt = event.block.timestamp
}

export function removePosition(positionId: string, event: ethereum.Event): void {
  let position = Position.load(positionId)
  if (position) {
    increaseOrDecreaseAvailablePosition('decrease', event)
    store.remove('Position', positionId)
  }
}
