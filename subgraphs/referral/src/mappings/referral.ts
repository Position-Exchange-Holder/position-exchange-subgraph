import { OperatorUpdated, ReferralCommissionRecorded, ReferralRecorded } from '../../generated/PositionReferral/PositionReferral'
import { getOrInitOperator, getOrInitReferrer, getOrInitUserReferralRecord } from '../helpers/initializers'
import { ONE_BI } from '../utils/constant'

export function handleOperatorUpdated(event: OperatorUpdated): void {
  let operator = getOrInitOperator(event.params.operator.toHex(), event)
  operator.status = event.params.status
  operator.save()
}

export function handleReferralRecorded(event: ReferralRecorded): void {
  let referrerAddress = event.params.referrer.toHex()
  let userAddress = event.params.user.toHex()
  let referrer = getOrInitReferrer(referrerAddress, event)
  referrer.totalReferrals = referrer.totalReferrals.plus(ONE_BI)
  referrer.updatedTimestamp = event.block.timestamp
  referrer.save()
  
  getOrInitUserReferralRecord(referrerAddress + ':' + userAddress, referrer, event)
}

export function handleReferralCommissionRecorded(event: ReferralCommissionRecorded): void {
  let referrer = getOrInitReferrer(event.params.referrer.toHex(), event)
  referrer.totalReferralCommissions = referrer.totalReferralCommissions.plus(event.params.commission)
  referrer.updatedTimestamp = event.block.timestamp
  referrer.save()

  let userReferralRecord = getOrInitUserReferralRecord(
    referrer.id + ':' + event.transaction.from.toHex(),
    referrer,
    event
  )
  userReferralRecord.totalCommissionsEarnedForReferrer
    = userReferralRecord.totalCommissionsEarnedForReferrer.plus(event.params.commission)
  userReferralRecord.updatedTimestamp = event.block.timestamp
  userReferralRecord.save()
}
