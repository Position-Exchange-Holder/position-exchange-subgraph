import { Address, dataSource, ethereum } from '@graphprotocol/graph-ts'
import { Bondholder, BondInfo } from '../../generated/schema'
import { BondCreated } from '../../generated/PositionBond03/PositionBond03'
import { ZERO_BI } from '../utils/constant'

export function initBondInfo(event: BondCreated): BondInfo {
  let bondInfo = new BondInfo('1')
  
  // Metadata
  bondInfo.name = event.params.bondName
  bondInfo.symbol = event.params.bondSymbol
  bondInfo.contractAddress = dataSource.address()
  bondInfo.underlyingAsset = event.params.underlyingAsset
  bondInfo.collateralAmount = event.params.collateralAmount
  bondInfo.faceAsset = event.params.faceAsset
  bondInfo.faceValue = event.params.faceValue
  bondInfo.maxSupply = event.params.totalSupply

  // Issue Price
  bondInfo.issuePrice = ZERO_BI

  // Milestones 
  bondInfo.onSale = ZERO_BI
  bondInfo.active = ZERO_BI
  bondInfo.maturity = ZERO_BI

  // Statistics
  bondInfo.totalSupply = ZERO_BI
  bondInfo.totalStakedBalance = ZERO_BI
  bondInfo.totalBurned = ZERO_BI
  bondInfo.totalFaceAsset = ZERO_BI
  bondInfo.totalBondholders = ZERO_BI
  bondInfo.totalTransactions = ZERO_BI

  // More
  bondInfo.issuer = event.transaction.from
  bondInfo.txHash = event.transaction.hash
  bondInfo.createdBlockNumber = event.block.number
  bondInfo.createdTimestamp = event.block.timestamp
  bondInfo.updatedTimestamp = event.block.timestamp

  bondInfo.save()

  return bondInfo
}

export function getBondInfo(): BondInfo {
  let bondInfo = BondInfo.load('1')

  return bondInfo as BondInfo
}

export function getOrInitBondholder(bondholderAddress: Address, event: ethereum.Event): Bondholder {
  let bondholder = Bondholder.load(bondholderAddress.toHex())

  if (!bondholder) {
    bondholder = new Bondholder(bondholderAddress.toHex())
    
    bondholder.balance = ZERO_BI
    bondholder.stakedBalance = ZERO_BI
    
    bondholder.totalTransactions = ZERO_BI
    
    bondholder.createdBlockNumber = event.block.number
    bondholder.createdTimestamp = event.block.timestamp
    bondholder.updatedTimestamp = event.block.timestamp
    
    bondholder.save()
  }

  return bondholder
}
