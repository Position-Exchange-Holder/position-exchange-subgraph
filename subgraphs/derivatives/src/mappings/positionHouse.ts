import { BigInt } from '@graphprotocol/graph-ts'
import { CancelLimitOrder, FullyLiquidated, OpenLimit, OpenMarket } from '../../generated/PositionHouse/PositionHouse'
import { getOrInitMarket, getOrInitPosition, getOrInitTrader, initLiquidation, initTransaction } from '../helpers/initializers'
import { getPositionId, getPositionSideByQuantity, increaseOrDecreaseAvailablePosition, removePosition } from '../helpers/position'
import { ZERO_BI } from '../utils/constant'

export function handleOpenMarket(event: OpenMarket): void {
  let traderParams = event.params.trader.toHex()
  let quantityParams = event.params.quantity
  let leverageParams = event.params.leverage
  let entryPriceParams = event.params.entryPrice
  let marketParams = event.params.positionManager.toHex()

  // ----------
  // Trader
  let trader = getOrInitTrader(traderParams, event)
  
  // Market
  let market = getOrInitMarket(marketParams, event)

  // Position
  let side = getPositionSideByQuantity(quantityParams)
  let position = getOrInitPosition(market, trader, event)
  let leverage = BigInt.fromI32(leverageParams)
  let positionQuantityAdjusted = position.quantity.plus(quantityParams)

  if (positionQuantityAdjusted.equals(ZERO_BI)) {
    removePosition(position.id, event)
    return
  }

  position.quantity = positionQuantityAdjusted
  if (position.leverage.lt(leverage)) {
    position.leverage = leverage
  }
  position.side = getPositionSideByQuantity(positionQuantityAdjusted)
  position.updatedAt = event.block.timestamp
  position.save()

  increaseOrDecreaseAvailablePosition('increase', event)

  // Transaction
  initTransaction(
    position,
    entryPriceParams,
    quantityParams,
    leverage,
    side,
    event
  )
}

export function handleOpenLimit(event: OpenLimit): void {

}

export function handleCancelLimitOrder(event: CancelLimitOrder): void {

}

export function handleFullyLiquidated(event: FullyLiquidated): void {
  let market = getOrInitMarket(event.params.pmAddress.toHex(), event)
  let trader = getOrInitTrader(event.params.trader.toHex(), event)
  let positionId = getPositionId(market.id, trader.id)
  
  initLiquidation(
    positionId,
    event.transaction.from,
    market,
    trader,
    event
  )

  removePosition(positionId, event)
}
