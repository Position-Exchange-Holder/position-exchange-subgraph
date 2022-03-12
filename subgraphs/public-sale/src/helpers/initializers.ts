import { ethereum, BigInt } from '@graphprotocol/graph-ts'
import { AngelInvestor, Fundraising, Transaction } from '../../generated/schema'
import { ZERO_BI } from '../utils/constant'

export function getOrInitFundraising(event: ethereum.Event): Fundraising {
  let fundraising = Fundraising.load('1')
  if (!fundraising) {
    fundraising = new Fundraising('1')
    fundraising.totalBusdRaised = ZERO_BI
    fundraising.totalBusdClaimed = ZERO_BI
    fundraising.totalTokensMinted = ZERO_BI
    fundraising.totalUniqueAngelInvestors = ZERO_BI
    fundraising.totalBuyTransactions = ZERO_BI
    fundraising.createdBlockNumber = event.block.number
    fundraising.createdTimestamp = event.block.timestamp
    fundraising.updatedTimestamp = event.block.timestamp
    fundraising.save()
  }

  return fundraising
}

export function getOrInitAngelInvestor(investorAddress: string, event: ethereum.Event): AngelInvestor {
  let investor = AngelInvestor.load(investorAddress)
  if (!investor) {
    investor = new AngelInvestor(investorAddress)
    investor.totalBusdInvested = ZERO_BI
    investor.totalTokensReceived = ZERO_BI
    investor.totalTransactions = ZERO_BI
    investor.createdBlockNumber = event.block.number
    investor.createdTimestamp = event.block.timestamp
    investor.updatedTimestamp = event.block.timestamp
    investor.save()
  }

  return investor
}

export function initTransaction(
  amountBusd: BigInt,
  amountToken: BigInt,
  from: AngelInvestor,
  event: ethereum.Event
): void {
  let transaction = new Transaction(event.transaction.hash.toHex())
  transaction.amountBusd = amountBusd
  transaction.amountToken = amountToken
  transaction.from = from.id
  transaction.gasLimit = event.transaction.gasLimit
  transaction.gasPrice = event.transaction.gasPrice
  transaction.createdBlockNumber = event.block.number
  transaction.createdTimestamp = event.block.timestamp
  transaction.save()
}
