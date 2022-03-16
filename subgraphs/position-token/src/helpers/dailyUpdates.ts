import { BigDecimal, ethereum } from '@graphprotocol/graph-ts'
import { User } from '../../generated/schema'
import { ONE_BI } from '../utils/constant'
import { getOrInitPositionTokenDayData } from './initializers'

export function updatePositionTokenDayData(
  from: User,
  to: User,
  amountRFIRedistributed: BigDecimal,
  event: ethereum.Event
): void {
  let positionTokenDayData = getOrInitPositionTokenDayData(event)
  if (from.updatedTimestamp.toI32() < positionTokenDayData.date) {
    positionTokenDayData.dailyActiveAddresses = positionTokenDayData.dailyActiveAddresses.plus(ONE_BI)
  }
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
