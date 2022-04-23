import { BigDecimal, ethereum } from '@graphprotocol/graph-ts'
import { User } from '../../generated/schema'
import { ONE_BI } from '../utils/constant'
import { getOrInitPositionTokenDayData, getOrInitUserRealizedPnlDayData } from './initializers'

export function updatePositionTokenDayData(
  from: User,
  to: User,
  amountRFIRedistributed: BigDecimal,
  event: ethereum.Event
): void {
  let positionTokenDayData = getOrInitPositionTokenDayData(event)
  if (to.createdBlockNumber.equals(event.block.number)) {
    positionTokenDayData.dailyNewUniqueAddresses = positionTokenDayData.dailyNewUniqueAddresses.plus(ONE_BI)
  }
  positionTokenDayData.dailyTransactions = positionTokenDayData.dailyTransactions.plus(ONE_BI)
  positionTokenDayData.dailyRFIRedistributed = positionTokenDayData.dailyRFIRedistributed.plus(amountRFIRedistributed)
  positionTokenDayData.save()
}

export function updatePositionTokenDayDataPriceAndVolume(
  event: ethereum.Event,
  volumeInBUSD?: BigDecimal,
  priceInBUSD?: BigDecimal,
  priceInBNB?: BigDecimal
): void {
  let positionTokenDayData = getOrInitPositionTokenDayData(event)
  if (priceInBUSD) {
    positionTokenDayData.priceInBUSD = priceInBUSD
  }
  if (priceInBNB) {
    positionTokenDayData.priceInBNB = priceInBNB
  }
  if (volumeInBUSD) {
    positionTokenDayData.dailyVolumeInBUSD = positionTokenDayData.dailyVolumeInBUSD.plus(volumeInBUSD)
  }
  positionTokenDayData.save()
}

export function updateUserRealizedPnlDayData(
  user: User,
  realizedPnl: BigDecimal,
  volumeInBUSD: BigDecimal,
  event: ethereum.Event
): void {
  let userRealizedPnlDayData = getOrInitUserRealizedPnlDayData(
    user,
    event
  )

  userRealizedPnlDayData.realizedPnl = userRealizedPnlDayData.realizedPnl.plus(realizedPnl)
  userRealizedPnlDayData.volumeInBUSD = userRealizedPnlDayData.volumeInBUSD.plus(volumeInBUSD)
  userRealizedPnlDayData.transactions = userRealizedPnlDayData.transactions.plus(ONE_BI)

  userRealizedPnlDayData.save()
}
