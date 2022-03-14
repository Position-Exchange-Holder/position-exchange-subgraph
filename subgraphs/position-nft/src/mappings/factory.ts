import { GegoAdded, GegoBurn } from '../../generated/PositionNFTFactory/PositionNFTFactory'
import { getOrInitNft, getOrInitNftDayData, getOrInitNftStatistics, getOrInitOwner, initNft } from '../helpers/initializers'
import { ONE_BI } from '../utils/constant'
import { minusOnePercent } from '../utils/math'

export function handleGegoAdded(event: GegoAdded): void {
  // Create new owner
  let owner = getOrInitOwner(event.params.author.toHexString(), event)

  // Create new nft
  let nft = getOrInitNft(event.params.id.toString(), event)
  nft.grade = event.params.grade
  nft.quality = event.params.quality
  nft.amount = event.params.amount
  nft.resBaseId = event.params.resBaseId
  nft.tLevel = event.params.tLevel
  nft.ruleId = event.params.ruleId
  nft.nftType = event.params.nftType
  nft.author = event.params.author.toHexString()
  nft.erc20 = event.params.erc20
  nft.blockNum = event.params.blockNum
  nft.lockedDays = event.params.lockedDays
  
  nft.owner = event.params.author.toHexString()
  nft.save()

  // Update statistics
  let nftStatistics = getOrInitNftStatistics(event)
  nftStatistics.totalTokenLocked = nftStatistics.totalTokenLocked.plus(minusOnePercent(event.params.amount))
  nftStatistics.currentTokenLocked = nftStatistics.currentTokenLocked.plus(minusOnePercent(event.params.amount))
  if (owner.createdBlockNumber == event.block.number) {
    nftStatistics.totalUniqueMiners = nftStatistics.totalUniqueMiners.plus(ONE_BI)
  }
  switch (event.params.grade.toI32()) {
    case 1:
      nftStatistics.totalGrade1Minted = nftStatistics.totalGrade1Minted.plus(ONE_BI)
      break
    case 2:
      nftStatistics.totalGrade2Minted = nftStatistics.totalGrade2Minted.plus(ONE_BI)
      break
    case 3:
      nftStatistics.totalGrade3Minted = nftStatistics.totalGrade3Minted.plus(ONE_BI)
      break
    case 4:
      nftStatistics.totalGrade4Minted = nftStatistics.totalGrade4Minted.plus(ONE_BI)
      break
    case 5:
      nftStatistics.totalGrade5Minted = nftStatistics.totalGrade5Minted.plus(ONE_BI)
      break
    case 6:
      nftStatistics.totalGrade6Minted = nftStatistics.totalGrade6Minted.plus(ONE_BI)
      break
    default:
      break
  }
  nftStatistics.updatedTimestamp = event.block.timestamp
  nftStatistics.save()

  // Update dailyTokenLocked
  let nftDayData = getOrInitNftDayData(event)
  nftDayData.dailyTokenLocked = nftDayData.dailyTokenLocked.plus(minusOnePercent(event.params.amount))
  nftDayData.save()
}

export function handleGegoBurn(event: GegoBurn): void {
  let nft = getOrInitNft(event.params.id.toString(), event)

  let nftStatistics = getOrInitNftStatistics(event)
  nftStatistics.currentTokenLocked = nftStatistics.currentTokenLocked.minus(minusOnePercent(event.params.amount))
  switch (nft.grade.toI32()) {
    case 1:
      nftStatistics.totalGrade1Burned = nftStatistics.totalGrade1Burned.plus(ONE_BI)
      break
    case 2:
      nftStatistics.totalGrade2Burned = nftStatistics.totalGrade2Burned.plus(ONE_BI)
      break
    case 3:
      nftStatistics.totalGrade3Burned = nftStatistics.totalGrade3Burned.plus(ONE_BI)
      break
    case 4:
      nftStatistics.totalGrade4Burned = nftStatistics.totalGrade4Burned.plus(ONE_BI)
      break
    case 5:
      nftStatistics.totalGrade5Burned = nftStatistics.totalGrade5Burned.plus(ONE_BI)
      break
    case 6:
      nftStatistics.totalGrade6Burned = nftStatistics.totalGrade6Burned.plus(ONE_BI)
      break
    default:
      break
  }
  nftStatistics.updatedTimestamp = event.block.timestamp
  nftStatistics.save()
}
