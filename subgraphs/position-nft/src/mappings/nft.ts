import { log } from '@graphprotocol/graph-ts'
import { ApprovalForAll, Transfer } from '../../generated/PositionNFT/PositionNFT'
import { getNft, getOrInitContract, getOrInitNftDayData, getOrInitNftStatistics, getOrInitOwner, initTransaction } from '../helpers/initializers'
import { ONE_BI, ZERO_BI } from '../utils/constant'
import { getContractName, getNftTransferAction } from '../utils/getData'

export function handleTransfer(event: Transfer): void {
  let nft = getNft(event.params.tokenId.toString())
  if (!nft) {
    log.error('Id {} is not exists', [
      event.params.tokenId.toString()
    ])
    return
  }

  let sender = getOrInitOwner(event.transaction.from.toHex(), event)
  let from = getOrInitOwner(event.params.from.toHex(), event)
  let to = getOrInitOwner(event.params.to.toHex(), event)
  let nftStatistics = getOrInitNftStatistics(event)
  let nftDayData = getOrInitNftDayData(event)

  let action = getNftTransferAction(from.id, to.id)

  // Mint
  if (action == 'Mint') {
    sender.totalNftsMinted = sender.totalNftsMinted.plus(ONE_BI)
    nftStatistics.totalNftsMinted = nftStatistics.totalNftsMinted.plus(ONE_BI)

  }

  // Burn
  if (action == 'Burn') {
    nft.burned = true
    from.totalNftsBurned = from.totalNftsBurned.plus(ONE_BI)
    nftStatistics.totalNftsBurned = nftStatistics.totalNftsBurned.plus(ONE_BI)
    nftDayData.dailyNftBurned = nftDayData.dailyNftBurned.plus(ONE_BI)
  }

  // Stake
  if (action == 'Stake') {
    from.totalNftsStaking = from.totalNftsStaking.plus(ONE_BI)
    nftStatistics.totalNftsStaking = nftStatistics.totalNftsStaking.plus(ONE_BI)
  }

  // Unstake
  if (action == 'Unstake') {
    from.totalNftsStaking = from.totalNftsStaking.minus(ONE_BI)
    nftStatistics.totalNftsStaking = nftStatistics.totalNftsStaking.minus(ONE_BI)
  }

  // Normal transfer
  from.totalNfts = action == 'Mint' ? ZERO_BI : from.totalNfts.minus(ONE_BI)
  from.totalTransactions = from.totalTransactions.plus(ONE_BI)
  to.totalNfts = to.totalNfts.plus(ONE_BI)
  to.totalTransactions = to.totalTransactions.plus(ONE_BI)

  // Update current owner
  nft.owner = to.id
  nft.totalTransactions = nft.totalTransactions.plus(ONE_BI)
  nft.updatedTimestamp = event.block.timestamp

  nftStatistics.totalTransactions = nftStatistics.totalTransactions.plus(ONE_BI)
  nftStatistics.updatedTimestamp = event.block.timestamp
  nftDayData.dailyTransactions = nftDayData.dailyTransactions.plus(ONE_BI)

  // Create new transaction
  initTransaction(
    event.transaction.hash.toHex(),
    action,
    nft,
    sender,
    from,
    to,
    event
  )

  // Save
  sender.save()
  from.save()
  to.save()
  nftStatistics.save()
  nftDayData.save()
  
  log.info('{} transferred {} to {}', [
    from.id,
    nft.id,
    to.id
  ])
}

export function handleApprovalForAll(event: ApprovalForAll): void {
  if (event.params.approved == false) {
    return
  }

  let user = getOrInitOwner(event.params.owner.toHex(), event)
  let contract = getOrInitContract(event.params.operator.toHex(), event)
  let updatedUsers = contract.users
  updatedUsers.push(user.id)
  
  contract.users = updatedUsers
  let contractName = getContractName(event.params.operator.toString().toLowerCase())
  contract.name = contractName
  contract.totalApprovalTransactions = contract.totalApprovalTransactions.plus(ONE_BI)
  contract.updatedTimestamp = event.block.timestamp
  contract.save()
}
