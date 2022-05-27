import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { Swap } from '../../generated/templates/Pair/Pair'
import { User } from '../../generated/schema'
import {
  getOrInitMarket,
  getOrInitPositionTokenPriceAndVolume,
  getOrInitUser,
  initSwapTransaction
} from '../helpers/initializers'
import { LP_PAIRS } from '../utils/addresses'
import { BD_ZERO, ONE_BI, ZERO_BI } from '../utils/constant'
import {
  updatePositionTokenDayDataPriceAndVolume,
  updateUserRealizedPnlDayData
} from '../helpers/dailyUpdates'
import { getBNBPriceInBUSD } from '../helpers/getPrices'
import { calculateRealizedPnl } from '../helpers/calculateRealizedPnl'

export function handleSwap(event: Swap): void {
  // Trade POSI/BUSD
  if (event.address.equals(Address.fromString(LP_PAIRS[0]))) {
    let posiIn = event.params.amount0In
    let posiOut = event.params.amount0Out
    let busdIn = event.params.amount1In
    let busdOut = event.params.amount1Out
    let volumeInBUSD = busdIn.plus(busdOut).toBigDecimal()
    let realizedPnl = calculateRealizedPnl(posiIn, volumeInBUSD)
    
    let sender = getOrInitUser(event.transaction.from.toHex(), event)
    increaseTokenBuyOrSellOfSender(sender, posiIn, posiOut)
    sender.totalSwapTransactions = sender.totalSwapTransactions.plus(ONE_BI)
    sender.totalVolumeInBUSD = sender.totalVolumeInBUSD.plus(volumeInBUSD)
    sender.realizedPnl = sender.realizedPnl.plus(realizedPnl)
    sender.updatedTimestamp = event.block.timestamp
    sender.save()
    
    let positionTokenPriceAndVolume = getOrInitPositionTokenPriceAndVolume(event.block.number)
    positionTokenPriceAndVolume.totalVolumeInBUSD = positionTokenPriceAndVolume.totalVolumeInBUSD.plus(volumeInBUSD)
    positionTokenPriceAndVolume.save()

    let market = getOrInitMarket(event.address.toHex(), event)
    market.totalTransactions = market.totalTransactions.plus(ONE_BI)
    market.totalVolumeInBUSD = market.totalVolumeInBUSD.plus(volumeInBUSD)
    market.updatedTimestamp = event.block.timestamp
    market.save()
    
    updatePositionTokenDayDataPriceAndVolume(
      event,
      volumeInBUSD,
      positionTokenPriceAndVolume.priceInBUSD,
      positionTokenPriceAndVolume.priceInBNB
    )

    updateUserRealizedPnlDayData(
      sender,
      realizedPnl,
      volumeInBUSD,
      event
    )

    const swapAction = getSwapAction(posiIn)
    initSwapTransaction(
      sender,
      getAmountToken(posiIn, posiOut),
      getAmountToken(busdIn, busdOut),
      getAmountBusd(volumeInBUSD, swapAction),
      swapAction,
      'BUSD',
      event
    )
  }

  // Trade POSI/WBNB
  if (event.address.equals(Address.fromString(LP_PAIRS[1]))) {
    let posiIn = event.params.amount0In
    let posiOut = event.params.amount0Out
    let bnbIn = event.params.amount1In
    let bnbOut = event.params.amount1Out
    let volumeInBUSD = bnbIn.plus(bnbOut).toBigDecimal().times(getBNBPriceInBUSD())
    let realizedPnl = calculateRealizedPnl(posiIn, volumeInBUSD)

    let sender = getOrInitUser(event.transaction.from.toHex(), event)
    increaseTokenBuyOrSellOfSender(sender, posiIn, posiOut)
    sender.totalSwapTransactions = sender.totalSwapTransactions.plus(ONE_BI)
    sender.totalVolumeInBUSD = sender.totalVolumeInBUSD.plus(volumeInBUSD)
    sender.realizedPnl = sender.realizedPnl.plus(realizedPnl)
    sender.updatedTimestamp = event.block.timestamp
    sender.save()

    let positionTokenPriceAndVolume = getOrInitPositionTokenPriceAndVolume(event.block.number)
    positionTokenPriceAndVolume.totalVolumeInBUSD = positionTokenPriceAndVolume.totalVolumeInBUSD.plus(volumeInBUSD)
    positionTokenPriceAndVolume.save()

    let market = getOrInitMarket(event.address.toHex(), event)
    market.totalTransactions = market.totalTransactions.plus(ONE_BI)
    market.totalVolumeInBUSD = market.totalVolumeInBUSD.plus(volumeInBUSD)
    market.updatedTimestamp = event.block.timestamp
    market.save()
    
    updatePositionTokenDayDataPriceAndVolume(
      event,
      volumeInBUSD,
      positionTokenPriceAndVolume.priceInBUSD,
      positionTokenPriceAndVolume.priceInBNB
    )

    updateUserRealizedPnlDayData(
      sender,
      realizedPnl,
      volumeInBUSD,
      event
    )

    const swapAction = getSwapAction(posiIn)
    initSwapTransaction(
      sender,
      getAmountToken(posiIn, posiOut),
      getAmountToken(bnbIn, bnbOut),
      getAmountBusd(volumeInBUSD, swapAction),
      swapAction,
      'BNB',
      event
    )
  }
}

function increaseTokenBuyOrSellOfSender(
  sender: User,
  posiIn: BigInt,
  posiOut: BigInt
): void {
  // If posiIn > 0 -> Sell
  if (posiIn.gt(ZERO_BI)) { 
    sender.totalTokensSell = sender.totalTokensSell.plus(posiIn)
  // Else -> Buy
  } else { 
    sender.totalTokensBuy = sender.totalTokensBuy.plus(posiOut)
  }
}

function getSwapAction(posiIn: BigInt): string {
  return posiIn.gt(ZERO_BI) ? 'Sell' : 'Buy'
}

function getAmountToken(tokenIn: BigInt, tokenOut: BigInt): BigInt {
  return tokenIn.equals(ZERO_BI)
    ? tokenOut
    : tokenIn
}

function getAmountBusd(amountBusd: BigDecimal, action: string): BigDecimal {
  return action == 'Buy' // Buy Posi
    ? BD_ZERO.minus(amountBusd)
    : amountBusd
}
