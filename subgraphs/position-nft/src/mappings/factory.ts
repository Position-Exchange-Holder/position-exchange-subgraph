import { log } from '@graphprotocol/graph-ts'
import { AddMinterCall, GegoAdded, GegoBurn } from '../../generated/PositionNFTFactory/PositionNFTFactory'
import { Minter } from '../../generated/schema'
import { getNft, getOrInitNftDayData, getOrInitNftStatistics, getOrInitOwner, initNft } from '../helpers/initializers'
import { ONE_BI } from '../utils/constant'
import { minusOnePercent } from '../utils/math'

export function handleGegoAdded(event: GegoAdded): void {
  // Create new owner
  let owner = getOrInitOwner(event.params.author.toHex(), event)

  // Create new nft
  initNft(event)

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
  let nft = getNft(event.params.id.toString())
  if (!nft) {
    log.error('Id {} is not exists', [event.params.id.toString()])
    return
  }

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

export function handleAddMinter(call: AddMinterCall): void {
  let minterAddress = call.inputs.minter.toHex()
  let minter = Minter.load(minterAddress)
  if (minter) {
    log.error('Minter {} is exists', [minterAddress])
    return
  }

  minter = new Minter(minterAddress)
  minter.creator = call.transaction.from
  minter.txHash = call.transaction.hash
  minter.createdBlockNumber = call.block.number
  minter.createdTimestamp = call.block.timestamp
  minter.save()
}
