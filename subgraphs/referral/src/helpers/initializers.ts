import { ethereum } from '@graphprotocol/graph-ts'
import { Operator, Referrer, UserReferralRecord, PositionReferral } from '../../generated/schema'
import { ZERO_BI } from '../utils/constant'

export function getOrInitPositionReferral(event: ethereum.Event): PositionReferral {
  let positionReferral = PositionReferral.load('1')
  if (!positionReferral) {
    positionReferral = new PositionReferral('1')
    positionReferral.totalReferrals = ZERO_BI
    positionReferral.totalReferralCommissions = ZERO_BI
    positionReferral.createdBlockNumber = event.block.number
    positionReferral.createdTimestamp = event.block.timestamp
    positionReferral.updatedTimestamp = event.block.timestamp
    positionReferral.save()
  }

  return positionReferral
}

export function getOrInitOperator(operatorAddress: string, event: ethereum.Event): Operator {
  let operator = Operator.load(operatorAddress)
  if (!operator) {
    operator = new Operator(operatorAddress)
    operator.status = false
    operator.txHash = event.transaction.hash
    operator.createdBlockNumber = event.block.number
    operator.createdTimestamp = event.block.timestamp
  }

  return operator
}

export function getOrInitReferrer(referrerAddress: string, event: ethereum.Event): Referrer {
  let referrer = Referrer.load(referrerAddress)
  if (!referrer) {
    referrer = new Referrer(referrerAddress)
    referrer.totalReferrals = ZERO_BI
    referrer.totalReferralCommissions = ZERO_BI
    referrer.createdBlockNumber = event.block.number
    referrer.createdTimestamp = event.block.timestamp
    referrer.updatedTimestamp = event.block.timestamp
    referrer.save()
  }

  return referrer
}

export function getOrInitUserReferralRecord(
  userReferralRecordId: string,
  referrer: Referrer,
  event: ethereum.Event
): UserReferralRecord {
  let userReferralRecord = UserReferralRecord.load(userReferralRecordId)
  if (!userReferralRecord) {
    userReferralRecord = new UserReferralRecord(userReferralRecordId)
    userReferralRecord.user = event.transaction.from
    userReferralRecord.referrer = referrer.id
    userReferralRecord.refTxHash = event.transaction.hash
    userReferralRecord.totalCommissionsEarnedForReferrer = ZERO_BI
    userReferralRecord.createdBlockNumber = event.block.number
    userReferralRecord.createdTimestamp = event.block.timestamp
    userReferralRecord.updatedTimestamp = event.block.timestamp
    userReferralRecord.save()
  }

  return userReferralRecord
}
