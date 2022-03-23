import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { PositionNFTFactory } from '../../generated/PositionNFTRewardPool/PositionNFTFactory'
import { BD_ZERO, POSITION_NFT_FACTORY_ADDRESS, ZERO_BI } from './constant'

class GEGO {
  grade: BigInt
  productivity: BigInt
  amount: BigDecimal

  constructor(grade: BigInt, productivity: BigInt, amount: BigDecimal) {
    this.grade = grade
    this.productivity = productivity
    this.amount = amount
  }
}

export function getGegoInfo(nftId: string): GEGO {
  let nftFactory = PositionNFTFactory.bind(Address.fromString(POSITION_NFT_FACTORY_ADDRESS))
  let gego = nftFactory.try_getGego(BigInt.fromString(nftId))
  
  if (!gego.reverted) {
    return new GEGO(
      gego.value.value0,
      gego.value.value1,
      BigDecimal.fromString(gego.value.value2.toString())
    )
  }

  return new GEGO(
    ZERO_BI,
    ZERO_BI,
    BD_ZERO
  )
}
