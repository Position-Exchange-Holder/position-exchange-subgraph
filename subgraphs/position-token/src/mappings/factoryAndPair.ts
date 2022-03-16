import { Address, BigInt } from '@graphprotocol/graph-ts'
import { PairCreated } from '../../generated/PancakeFactory/PancakeFactory'
import { Swap, Pair } from '../../generated/templates/Pair/Pair'
import { Pair as PairTemplate } from '../../generated/templates'
import { Market, User } from '../../generated/schema'
import { getOrInitPositionToken, getOrInitPositionTokenPriceAndVolume, getOrInitUser } from '../helpers/initializers'
import { LP_PAIRS, POSITION_TOKEN_ADDRESS } from '../utils/addresses'
import { ZERO_BI } from '../utils/constant'
import { updatePositionTokenDayDataPriceAndVolume } from '../helpers/dailyUpdates'
import { getBNBPriceInBUSD } from '../helpers/getPrices'

export function handlePairCreated(event: PairCreated): void {
  let token0 = event.params.token0
  let token1 = event.params.token1
  let pairAddress = event.params.pair

  if (token0.equals(Address.fromString(POSITION_TOKEN_ADDRESS)) || token1.equals(Address.fromString(POSITION_TOKEN_ADDRESS))) {
    // Create new Posi LP Pair
    let market = new Market(pairAddress.toHexString())
    market.name = Pair.bind(pairAddress).symbol()
    market.createdBlockNumber = event.block.number
    market.createdTimestamp = event.block.timestamp
    market.save()
    
    // Update market
    let positionToken = getOrInitPositionToken(event)
    let positionTokenMarkets = positionToken.markets
    positionTokenMarkets.push(market.id)
    positionToken.markets = positionTokenMarkets
    positionToken.save()

    // Create Pair Template
    PairTemplate.create(pairAddress)
  }
}

export function handleSwap(event: Swap): void {
  // Trade POSI/BUSD
  if (event.address.equals(Address.fromString(LP_PAIRS[0]))) {
    let posiIn = event.params.amount0In // posiIn > 0: Sell
    let posiOut = event.params.amount0Out // posiOut > 0: Buy
    let busdIn = event.params.amount1In
    let busdOut = event.params.amount1Out
    let volumeInBUSD = busdIn.plus(busdOut).toBigDecimal()
    
    let sender = getOrInitUser(event.transaction.from.toHex(), event)
    increaseTokenBuyOrSellOfSender(sender, posiIn, posiOut)
    sender.totalVolumeInBUSD = sender.totalVolumeInBUSD.plus(volumeInBUSD)
    sender.updatedTimestamp = event.block.timestamp
    sender.save()
    
    let positionTokenPriceAndVolume = getOrInitPositionTokenPriceAndVolume(event.block.number)
    positionTokenPriceAndVolume.totalVolumeInBUSD = positionTokenPriceAndVolume.totalVolumeInBUSD.plus(volumeInBUSD)
    positionTokenPriceAndVolume.save()
    
    updatePositionTokenDayDataPriceAndVolume(
      event,
      volumeInBUSD,
      positionTokenPriceAndVolume.priceInBUSD,
      positionTokenPriceAndVolume.priceInBNB
    )
  }

  // Trade POSI/WBNB
  if (event.address.equals(Address.fromString(LP_PAIRS[1]))) {
    let posiIn = event.params.amount0In // posiIn > 0: Sell
    let posiOut = event.params.amount0Out // posiOut > 0: Buy
    let bnbIn = event.params.amount1In
    let bnbOut = event.params.amount1Out
    let volumeInBUSD = bnbIn.plus(bnbOut).toBigDecimal().times(getBNBPriceInBUSD())

    let sender = getOrInitUser(event.transaction.from.toHex(), event)
    increaseTokenBuyOrSellOfSender(sender, posiIn, posiOut)
    sender.totalVolumeInBUSD = sender.totalVolumeInBUSD.plus(volumeInBUSD)
    sender.updatedTimestamp = event.block.timestamp
    sender.save()

    let positionTokenPriceAndVolume = getOrInitPositionTokenPriceAndVolume(event.block.number)
    positionTokenPriceAndVolume.totalVolumeInBUSD = positionTokenPriceAndVolume.totalVolumeInBUSD.plus(volumeInBUSD)
    positionTokenPriceAndVolume.save()
    
    updatePositionTokenDayDataPriceAndVolume(
      event,
      volumeInBUSD,
      positionTokenPriceAndVolume.priceInBUSD,
      positionTokenPriceAndVolume.priceInBNB
    )
  }
}

function increaseTokenBuyOrSellOfSender(sender: User, posiIn: BigInt, posiOut: BigInt): void {
  // If posiIn > 0 -> Sell
  if (posiIn.gt(ZERO_BI)) { 
    sender.totalTokensSell = sender.totalTokensSell.plus(posiIn)
  // Else -> Buy
  } else { 
    sender.totalTokensBuy = sender.totalTokensBuy.plus(posiOut)
  }
}
