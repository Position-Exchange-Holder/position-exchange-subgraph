import { BigInt } from '@graphprotocol/graph-ts'

export function calculateMiningPower(
  grade: number,
  productivity: number,
  amountToken: number
): BigInt {
  let miningEfficiency: number
  if (grade == 1) {
    miningEfficiency = 1.1 + 0.1 * productivity / 5000
  } else if (grade == 2) {
    miningEfficiency = 1.2 + 0.1 * (productivity - 5000) / 3000
  } else if (grade == 3) {
    miningEfficiency = 1.3 + 0.1 * (productivity - 8000) / 1000
  } else if (grade == 4) {
    miningEfficiency = 1.4 + 0.2 * (productivity - 9000) / 800
  } else if (grade == 5) {
    miningEfficiency = 1.6 + 0.2 * (productivity - 9800) / 180
  } else if (grade == 6) {
    miningEfficiency = 1.8 + 0.2 * (productivity - 9980) / 20
  } else {
    miningEfficiency = 0
  }

  let power = amountToken * miningEfficiency

  return BigInt.fromString(power.toString())
}
