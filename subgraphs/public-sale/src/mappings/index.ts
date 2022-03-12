import { Transfer } from '../../generated/Fundraising/BUSD'
import { getOrInitAngelInvestor, getOrInitFundraising, initTransaction } from '../helpers/initializers'
import { FUNDRAISING_CONTRACT_ADDRESS, ONE_BI, TWO_BI } from '../utils/constant'

export function handleTransfer(event: Transfer): void {
  let fromAddress = event.params.from.toHex()
  let toAddress = event.params.to.toHex()
  let amount = event.params.value

  // Withdraw Fund
  if (fromAddress.toLowerCase() == FUNDRAISING_CONTRACT_ADDRESS) {
    let fundraising = getOrInitFundraising(event)
    fundraising.totalBusdClaimed = fundraising.totalBusdClaimed.plus(amount)
    fundraising.updatedTimestamp = event.block.timestamp
    fundraising.save()
  }
  // Buy
  if (toAddress.toLowerCase() == FUNDRAISING_CONTRACT_ADDRESS) {
    let fundraising = getOrInitFundraising(event)
    let investor = getOrInitAngelInvestor(fromAddress, event)
    
    fundraising.totalBusdRaised = fundraising.totalBusdRaised.plus(amount)
    fundraising.totalTokensMinted = fundraising.totalTokensMinted.plus(amount.times(TWO_BI))
    if (investor.createdBlockNumber.equals(event.block.number)) {
      fundraising.totalUniqueAngelInvestors = fundraising.totalUniqueAngelInvestors.plus(ONE_BI)
    }
    fundraising.totalBuyTransactions = fundraising.totalBuyTransactions.plus(ONE_BI)
    fundraising.updatedTimestamp = event.block.timestamp
    fundraising.save()

    investor.totalBusdInvested = investor.totalBusdInvested.plus(amount)
    investor.totalTokensReceived = investor.totalTokensReceived.plus(amount.times(TWO_BI))
    investor.totalTransactions = investor.totalTransactions.plus(ONE_BI)
    investor.updatedTimestamp = event.block.timestamp
    investor.save()

    initTransaction(
      amount,
      amount.times(TWO_BI),
      investor,
      event
    )
  }
}
