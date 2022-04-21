import { ethereum, BigInt, Address, Bytes } from '@graphprotocol/graph-ts'
import { Liquidation, Market, Position, PositionCounter, Trader, Transaction } from '../../generated/schema'
import { LONG, ZERO_BI } from '../utils/constant'
import { getPositionId, getPositionLiquidationId } from './position'

export function getOrInitPositionCounter(event: ethereum.Event): PositionCounter {
  let counter = PositionCounter.load('1')
  if (!counter) {
    counter = new PositionCounter('1')
    counter.totalAvailablePositions = ZERO_BI
    counter.createdAt = event.block.timestamp
    counter.updatedAt = event.block.timestamp
    counter.updatedAtBlockNumber = event.block.number
    counter.save()
  }

  return counter
}

export function getOrInitTrader(address: string, event: ethereum.Event): Trader {
  let trader = Trader.load(address)
  if (!trader) {
    trader = new Trader(address)
    trader.save()
  }

  return trader
}

export function getOrInitPosition(
  market: Market,
  trader: Trader,
  event: ethereum.Event
): Position {
  let positionId = getPositionId(market.id, trader.id)
  let position = Position.load(positionId)
  if (!position) {
    position = new Position(positionId)
    position.market = market.id
    position.trader = trader.id
    position.quantity = ZERO_BI
    position.leverage = ZERO_BI
    position.side = LONG
    position.createdAt = event.block.timestamp
    position.updatedAt = event.block.timestamp
    position.save()
  }

  return position
}

export function getPosition(id: string): Position | null {
  let position = Position.load(id)
  return position
}

export function initTransaction(
  position: Position,
  entryPrice: BigInt,
  quantity: BigInt,
  leverage: BigInt,
  side: string,
  event: ethereum.Event
): void {
  let transaction = new Transaction(event.transaction.hash.toHexString())
  transaction.position = position.id
  transaction.entryPrice = entryPrice
  transaction.quantity = quantity
  transaction.leverage = leverage
  transaction.side = side
  transaction.blockNumber = event.block.number
  transaction.createdAt = event.block.timestamp
  transaction.save()
}

export function getOrInitMarket(address: string, event: ethereum.Event): Market {
  let market = Market.load(address)
  if (!market) {
    market = new Market(address)
    market.save()
  }

  return market
}

export function initLiquidation(
  positionId: string,
  liquidator: Address,
  market: Market,
  trader: Trader,
  event: ethereum.Event
): void {
  const id = getPositionLiquidationId(event.block.number.toString(), market.id, trader.id)
  const liquidation = new Liquidation(id)
  
  liquidation.position = positionId
  liquidation.txHash = event.transaction.hash
  liquidation.liquidator = liquidator
  liquidation.market = Bytes.fromHexString(market.id)
  liquidation.trader = Bytes.fromHexString(trader.id)
  liquidation.blockNumber = event.block.number
  liquidation.createdAt = event.block.timestamp
  liquidation.save()
}
