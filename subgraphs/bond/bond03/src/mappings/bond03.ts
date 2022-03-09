import { Address, log } from '@graphprotocol/graph-ts'
import { Transaction } from '../../generated/schema'
import { BondActivated, BondCreated, IssuePriceInitialized, Purchased, Transfer } from '../../generated/PositionBond03/PositionBond03'
import { getBondInfo, getOrInitBondholder, initBondInfo } from '../helpers/initializers'
import {
  ACTION_BURN,
  ACTION_PURCHASE,
  ACTION_STAKE,
  ACTION_TRANSFER,
  ACTION_UNSTAKE,
  ONE_BI,
  POSI_STAKING_MANAGER_ADDRESS,
  ZERO_ADDRESS,
  ZERO_BI
} from '../utils/constant'

export function handleBondCreated(event: BondCreated): void {
  let bondInfo = initBondInfo(event)
  log.info('Init: {}', [bondInfo.name])
}

export function handleIssuePriceInitialized(event: IssuePriceInitialized): void {
  let bondInfo = getBondInfo()
  bondInfo.issuePrice = event.params.issuePrice
  bondInfo.updatedTimestamp = event.block.timestamp
  bondInfo.save()
}

export function handleBondActivated(event: BondActivated): void {
  let bondInfo = getBondInfo()
  bondInfo.onSale = event.params.onSale
  bondInfo.active = event.params.active
  bondInfo.maturity = event.params.maturity
  bondInfo.updatedTimestamp = event.block.timestamp
  bondInfo.save()
}

export function handlePurchased(event: Purchased): void {
  // Bondholder
  let bondholder = getOrInitBondholder(event.transaction.from, event)
  bondholder.balance = bondholder.balance.plus(event.params.bondAmount)
  bondholder.totalTransactions = bondholder.totalTransactions.plus(ONE_BI)
  bondholder.updatedTimestamp = event.block.timestamp
  bondholder.save()

  // Transaction
  let transaction = new Transaction(event.transaction.hash.toHex())
  transaction.action = ACTION_PURCHASE
  transaction.amount = event.params.bondAmount
  transaction.sender = bondholder.id
  transaction.from = getOrInitBondholder(Address.fromString(ZERO_ADDRESS), event).id
  transaction.to = bondholder.id
  transaction.gasUsed = event.transaction.gasLimit
  transaction.gasPrice = event.transaction.gasPrice
  transaction.blockNumber = event.block.number
  transaction.timestamp = event.block.timestamp
  transaction.save()
  
  // Bond Info
  let bondInfo = getBondInfo()
  bondInfo.totalSupply = bondInfo.totalSupply.plus(event.params.bondAmount)
  bondInfo.totalFaceAsset = bondInfo.totalFaceAsset.plus(event.params.faceAmount)
  if (bondholder.createdTimestamp == event.block.timestamp) {
    bondInfo.totalBondholders = bondInfo.totalBondholders.plus(ONE_BI)
  }
  bondInfo.totalTransactions = bondInfo.totalTransactions.plus(ONE_BI)
  bondInfo.updatedTimestamp = event.block.timestamp
  bondInfo.save()
}

export function handleTransfer(event: Transfer): void {
  if (event.params.from.toHex() == ZERO_ADDRESS) {
    log.info('This is mining action', [])
    return
  }
  
  let from = getOrInitBondholder(event.params.from, event)
  let to = getOrInitBondholder(event.params.to, event)
  let amount = event.params.value
  let action = ACTION_TRANSFER

  // Bond Info
  let bondInfo = getBondInfo()
  bondInfo.totalTransactions = bondInfo.totalTransactions.plus(ONE_BI)
  bondInfo.updatedTimestamp = event.block.timestamp

  // Sender
  from.balance = from.balance.minus(amount)
  if (from.balance.minus(amount).equals(ZERO_BI)) {
    bondInfo.totalBondholders = bondInfo.totalBondholders.minus(ONE_BI)
  }
  from.totalTransactions = from.totalTransactions.plus(ONE_BI)
  from.updatedTimestamp = event.block.timestamp
  // Receipt
  to.balance = to.balance.plus(amount)
  to.totalTransactions = from.totalTransactions.plus(ONE_BI)
  to.updatedTimestamp = event.block.timestamp

  // User stake bond
  if (to.id.toLowerCase() == POSI_STAKING_MANAGER_ADDRESS.toLowerCase()) {
    action = ACTION_STAKE
    from.stakedBalance = from.stakedBalance.plus(amount)
    bondInfo.totalStakedBalance = bondInfo.totalStakedBalance.plus(amount)
  }

  // User unstake bond
  if (from.id.toLowerCase() == POSI_STAKING_MANAGER_ADDRESS.toLowerCase()) {
    action = ACTION_UNSTAKE
    let sender = getOrInitBondholder(event.transaction.from, event)
    sender.stakedBalance = sender.stakedBalance.minus(amount)
    bondInfo.totalStakedBalance = bondInfo.totalStakedBalance.minus(amount)
  }

  // Burn
  if (to.id.toLowerCase() === ZERO_ADDRESS) {
    action = ACTION_BURN
    bondInfo.totalSupply = bondInfo.totalSupply.minus(amount)
    bondInfo.totalBurned = bondInfo.totalBurned.plus(amount)
  }

  // Transaction
  let transaction = new Transaction(event.transaction.hash.toHex())
  transaction.action = action
  transaction.amount = amount
  transaction.sender = getOrInitBondholder(event.transaction.from, event).id
  transaction.from = from.id
  transaction.to = to.id
  transaction.gasUsed = event.transaction.gasLimit
  transaction.gasPrice = event.transaction.gasPrice
  transaction.blockNumber = event.block.number
  transaction.timestamp = event.block.timestamp

  log.info('{}: {} action', [
    transaction.id,
    action
  ])
  
  from.save()
  to.save()
  bondInfo.save()
  transaction.save()
}
