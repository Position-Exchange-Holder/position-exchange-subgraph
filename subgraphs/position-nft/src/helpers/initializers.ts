import { ethereum } from '@graphprotocol/graph-ts'
import { Contract, NftDayData, Owner, PositionNFT, RewardPool, NftStatistic, Transaction } from '../../generated/schema'
import { RewardAdded } from '../../generated/PositionNFTRewardPool/PositionNFTRewardPool'
import { ONE_BI, ZERO_BI } from '../utils/constant'

export function initNft(tokenId: string, event: ethereum.Event): PositionNFT {
  let nft = new PositionNFT(tokenId)
  
  nft.totalTransactions = ONE_BI
  nft.totalOwners = ONE_BI
  nft.burned = false
  nft.updatedTimestamp = event.block.timestamp
  
  nft.save()

  return nft
}

export function getOrInitNft(tokenId: string, event: ethereum.Event): PositionNFT {
  let nft = PositionNFT.load(tokenId)

  if (!nft) {
    return initNft(tokenId, event)
  }

  return nft
}

export function getOrInitOwner(ownerAddress: string, event: ethereum.Event): Owner {
  let owner = Owner.load(ownerAddress)

  if (!owner) {
    owner = new Owner(ownerAddress)
    owner.totalNfts = ZERO_BI
    owner.totalNftsMinted = ZERO_BI
    owner.totalNftsBurned = ZERO_BI
    owner.totalNftsStaking = ZERO_BI
    owner.totalTransactions = ZERO_BI
    
    owner.createdBlockNumber = event.block.number
    owner.createdTimestamp = event.block.timestamp
    owner.updatedTimestamp = event.block.timestamp
    
    owner.save()
  }

  return owner
}

export function getOrInitContract(contractAddress: string, event: ethereum.Event): Contract {
  let contract = Contract.load(contractAddress)
  
  if (!contract) {
    contract = new Contract(contractAddress)
    contract.name = ''
    contract.users = []
    contract.totalApprovalTransactions = ZERO_BI
    contract.createdBlockNumber = event.block.number
    contract.createdTimestamp = event.block.timestamp
  }

  return contract
}

export function initTransaction(
  txHash: string,
  action: string,
  nft: PositionNFT,
  sender: Owner,
  from: Owner,
  to: Owner,
  event: ethereum.Event
): void {
  let transaction = new Transaction(txHash)
  transaction.action = action
  transaction.nft = nft.id
  transaction.sender = sender.id
  transaction.from = from.id
  transaction.to = to.id
  transaction.gasLimit = event.transaction.gasLimit
  transaction.gasPrice = event.transaction.gasPrice
  transaction.createdBlockNumber = event.block.number
  transaction.createdTimestamp = event.block.timestamp
  transaction.save()
}

export function getOrInitNftStatistics(event: ethereum.Event): NftStatistic {
  let nftStatistics = NftStatistic.load('1')

  if (!nftStatistics) {
    nftStatistics = new NftStatistic('1')
    
    nftStatistics.totalTransactions = ZERO_BI
    nftStatistics.totalNftsMinted = ZERO_BI
    nftStatistics.totalNftsBurned = ZERO_BI
    nftStatistics.totalNftsStaking = ZERO_BI

    nftStatistics.totalTokenLocked = ZERO_BI
    nftStatistics.currentTokenLocked = ZERO_BI
    nftStatistics.totalUniqueMiners = ZERO_BI

    nftStatistics.totalGrade1Minted = ZERO_BI
    nftStatistics.totalGrade2Minted = ZERO_BI
    nftStatistics.totalGrade3Minted = ZERO_BI
    nftStatistics.totalGrade4Minted = ZERO_BI
    nftStatistics.totalGrade5Minted = ZERO_BI
    nftStatistics.totalGrade6Minted = ZERO_BI

    nftStatistics.totalGrade1Burned = ZERO_BI
    nftStatistics.totalGrade2Burned = ZERO_BI
    nftStatistics.totalGrade3Burned = ZERO_BI
    nftStatistics.totalGrade4Burned = ZERO_BI
    nftStatistics.totalGrade5Burned = ZERO_BI
    nftStatistics.totalGrade6Burned = ZERO_BI

    nftStatistics.createdBlockNumber = event.block.number
    nftStatistics.createdTimestamp = event.block.timestamp
    nftStatistics.updatedTimestamp = event.block.timestamp

    nftStatistics.save()
  }

  return nftStatistics
}

export function getOrInitNftDayData(event: ethereum.Event): NftDayData {
  let timestamp = event.block.timestamp.toI32()
  let dayID = (timestamp / 86400).toString()
  
  let nftDayData = NftDayData.load(dayID)
  if (!nftDayData) {
    nftDayData = new NftDayData(dayID)
    nftDayData.date = timestamp
    nftDayData.dailyTokenLocked = ZERO_BI
    nftDayData.dailyNftMinted = ZERO_BI
    nftDayData.dailyNftBurned = ZERO_BI
    nftDayData.dailyTransactions = ZERO_BI
    nftDayData.createdBlockNumber = event.block.number
    nftDayData.save()
  }

  return nftDayData
}

export function initRewardPool(event: RewardAdded): RewardPool {
  let rewardPool = new RewardPool(event.transaction.hash.toHexString())
  rewardPool.executer = event.transaction.from
  rewardPool.amountReward = event.params.reward
  rewardPool.createdBlockNumber = event.block.number
  rewardPool.createdTimestamp = event.block.timestamp
  rewardPool.save()

  return rewardPool
}
