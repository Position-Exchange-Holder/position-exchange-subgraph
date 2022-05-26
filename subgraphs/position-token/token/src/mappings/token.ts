import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import {
  Approval,
  BotKeeperChanged,
  Donate,
  Transfer,
  TreasuryContractChanged
} from '../../generated/PositionToken/PositionToken'
import { updatePositionTokenDayData } from '../helpers/dailyUpdates'
import {
  getOrInitApprovalContract,
  getOrInitBotKeeper,
  getOrInitPositionToken,
  getOrInitTreasury,
  getOrInitUser,
  initDonate,
  initTransaction
} from '../helpers/initializers'
import {
  ACTION_BURN,
  ACTION_MINT,
  ONE_BI,
  TOKEN_TRANSFER_TAX_RATE,
  ZERO_BI
} from '../utils/constant'
import { getTransferAction } from '../utils/getData'

export function handleTransfer(event: Transfer): void {
  let from = getOrInitUser(event.params.from.toHex(), event)
  let to = getOrInitUser(event.params.to.toHex(), event)
  let amount = event.params.value

  let positionToken = getOrInitPositionToken(event)
  let amountRFIRedistributed = amount.div(BigInt.fromI32(TOKEN_TRANSFER_TAX_RATE)).toBigDecimal()
  positionToken.totalRFIRedistributed = positionToken.totalRFIRedistributed.plus(amountRFIRedistributed)
  // Increase totalHolders if to address is a new user
  if (to.createdBlockNumber.equals(event.block.number)) {
    positionToken.totalHolders = positionToken.totalHolders.plus(ONE_BI)
  }

  // Update Token day data (Must update before from user)
  updatePositionTokenDayData(
    from,
    to,
    amountRFIRedistributed,
    event
  )
  
  let action = getTransferAction(from.id, to.id)
  // Mint
  if (action == ACTION_MINT) {
    positionToken.totalMinted = positionToken.totalMinted.plus(BigDecimal.fromString(amount.toString()))
  }

  // Burn
  if (action == ACTION_BURN) {
    positionToken.totalBurned = positionToken.totalBurned.plus(BigDecimal.fromString(amount.toString()))
  }

  // Transfer
  from.balance = action == ACTION_MINT ? from.balance : from.balance.minus(amount)
  to.balance = to.balance.plus(amount)
  
  // Create transaction
  initTransaction(
    amount,
    action,
    from,
    to,
    event
  )
  from.totalTransactions = from.totalTransactions.plus(ONE_BI)
  to.totalTransactions = to.totalTransactions.plus(ONE_BI)
  positionToken.totalTransactions = positionToken.totalTransactions.plus(ONE_BI)
  
  positionToken.updatedTimestamp = event.block.timestamp
  from.updatedTimestamp = event.block.timestamp
  to.updatedTimestamp = event.block.timestamp

  // Save
  positionToken.save()
  from.save()
  to.save()
}

export function handleApproval(event: Approval): void {
  const contract = getOrInitApprovalContract(event.params.spender.toHex(), event)
  if (event.params.value.gt(ZERO_BI)) {
    contract.totalApprovals = contract.totalApprovals.plus(ONE_BI)
    contract.save()
  }
}

export function handleDonate(event: Donate): void {
  initDonate(event)
}

export function handleBotKeeperChanged(event: BotKeeperChanged): void {
  let botKeeper = getOrInitBotKeeper(event)
  if (botKeeper.createdBlockNumber.equals(event.block.number)) {
    return
  }
  
  let previousTxHashes = botKeeper.previousTxHashes
  let previousAddresses = botKeeper.previousAddresses
  previousTxHashes.push(botKeeper.txHash)
  previousAddresses.push(botKeeper.currentAddress)

  botKeeper.txHash = event.transaction.hash
  botKeeper.creator = event.transaction.from
  botKeeper.currentAddress = event.params.newKeeper
  botKeeper.previousTxHashes = previousTxHashes
  botKeeper.previousAddresses = previousAddresses
  botKeeper.updatedTimestamp = event.block.timestamp
  botKeeper.save()
}

export function handleTreasuryContractChanged(event: TreasuryContractChanged): void {
  let treasury = getOrInitTreasury(event)
  if (treasury.createdBlockNumber.equals(event.block.number)) {
    return
  }

  let previousTxHashes = treasury.previousTxHashes
  let previousAddresses = treasury.previousAddresses
  previousTxHashes.push(treasury.txHash)
  previousAddresses.push(treasury.currentAddress)

  treasury.txHash = event.transaction.hash
  treasury.creator = event.transaction.from
  treasury.currentAddress = event.params.newAddress
  treasury.previousTxHashes = previousTxHashes
  treasury.previousAddresses = previousAddresses
  treasury.updatedTimestamp = event.block.timestamp
  treasury.save()
}
