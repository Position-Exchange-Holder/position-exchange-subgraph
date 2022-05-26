import {
  ethereum,
  BigInt,
  Address,
  log,
  BigDecimal
} from '@graphprotocol/graph-ts'
import {
  BotKeeperChanged,
  Donate,
  TreasuryContractChanged
} from '../../generated/PositionToken/PositionToken'
import {
  BotKeeper,
  DonateRecord,
  PositionToken,
  Treasury,
  User,
  UserRealizedPnlDayData,
  Transaction,
  PositionTokenDayData,
  PositionTokenPriceAndVolume,
  Market,
  SwapTransaction,
  ApprovalContract
} from '../../generated/schema'
import { Pair as PairTemplate } from '../../generated/templates'
import { BD_ZERO, DEFAULT_ID, TOKEN_MAX_SUPPLY, ZERO_BI } from '../utils/constant'
import { fetchTokenDecimals, fetchTokenName, fetchTokenSymbol } from '../helpers/fetchTokenInfo'
import { getAddressLabel } from '../utils/getData'
import { getPosiPriceInBNB, getPosiPriceInBUSD } from './getPrices'
import { LP_PAIRS } from '../utils/addresses'

export function getOrInitMarket(
  marketAddress: string,
  event: ethereum.Event
): Market {
  let market = Market.load(marketAddress)
  if (!market) {
    market = new Market(marketAddress)
    market.name = ''
    market.totalTransactions = ZERO_BI
    market.totalVolumeInBUSD = BD_ZERO
    market.createdBlockNumber = event.block.number
    market.createdTimestamp = event.block.timestamp
    market.updatedTimestamp = event.block.timestamp
    market.save()
  }

  return market
}

export function getOrInitPositionToken(
  event: ethereum.Event
): PositionToken {
  let positionToken = PositionToken.load(DEFAULT_ID)
  if (!positionToken) {
    positionToken = new PositionToken(DEFAULT_ID)
    // Metadata
    let tokenName = fetchTokenName()
    let tokenSymbol = fetchTokenSymbol()
    let tokenDecimals = fetchTokenDecimals()
    positionToken.name = tokenName
    positionToken.symbol = tokenSymbol
    positionToken.decimals = tokenDecimals
    positionToken.maxSupply = BigDecimal.fromString(TOKEN_MAX_SUPPLY.toString())
      .times(BigDecimal.fromString('1e18'))

    positionToken.totalMinted = BD_ZERO
    positionToken.totalBurned = BD_ZERO

    positionToken.prices = getOrInitPositionTokenPriceAndVolume(event.block.number).id

    positionToken.totalTransactions = ZERO_BI
    positionToken.totalHolders = ZERO_BI
    positionToken.totalRFIRedistributed = BD_ZERO

    positionToken.createdBlockNumber = event.block.number
    positionToken.createdTimestamp = event.block.timestamp
    positionToken.updatedTimestamp = event.block.timestamp

    let markets: string[] = []
    for (let i = 0; i < LP_PAIRS.length - 1; i++) {
      let lpAddress = LP_PAIRS[i]
      PairTemplate.create(Address.fromString(lpAddress))
      let market = getOrInitMarket(lpAddress, event)
      market.name = i == 0 ? 'POSI/BUSD' : 'POSI/WBNB'
      market.save()

      markets.push(market.id)

      log.info('Created pair with address {}.', [lpAddress])
    }

    positionToken.markets = markets
    positionToken.save()
  }

  return positionToken
}

export function getOrInitPositionTokenPriceAndVolume(
  blockNumber: BigInt
): PositionTokenPriceAndVolume {
  let tokenPriceAndVolume = PositionTokenPriceAndVolume.load(DEFAULT_ID)
  if (!tokenPriceAndVolume) {
    tokenPriceAndVolume = new PositionTokenPriceAndVolume(DEFAULT_ID)
    tokenPriceAndVolume.priceInBUSD = BD_ZERO
    tokenPriceAndVolume.priceInBNB = BD_ZERO
    tokenPriceAndVolume.totalVolumeInBUSD = BD_ZERO
    tokenPriceAndVolume.updatedBlockNumber = blockNumber
    tokenPriceAndVolume.save()
  }

  tokenPriceAndVolume.priceInBUSD = getPosiPriceInBUSD()
  tokenPriceAndVolume.priceInBNB = getPosiPriceInBNB()

  return tokenPriceAndVolume
}

export function getOrInitPositionTokenDayData(
  event: ethereum.Event
): PositionTokenDayData {
  let timestamp = event.block.timestamp.toI32()
  let dayID = (timestamp / 86400).toString()
  
  let positionTokenDayData = PositionTokenDayData.load(dayID)
  if (!positionTokenDayData) {
    positionTokenDayData = new PositionTokenDayData(dayID)
    positionTokenDayData.date = timestamp
    // Get prices
    positionTokenDayData.priceInBUSD = getPosiPriceInBUSD()
    positionTokenDayData.priceInBNB = getPosiPriceInBNB()

    positionTokenDayData.dailyNewUniqueAddresses = ZERO_BI
    positionTokenDayData.dailyTransactions = ZERO_BI
    positionTokenDayData.dailyRFIRedistributed = BD_ZERO
    positionTokenDayData.dailyVolumeInBUSD = BD_ZERO
    positionTokenDayData.createdBlockNumber = event.block.number

    positionTokenDayData.save()
  }

  return positionTokenDayData
}

export function getOrInitUserRealizedPnlDayData(
  user: User,
  event: ethereum.Event
): UserRealizedPnlDayData {
  let timestamp = event.block.timestamp.toI32()
  let id = user.id + ':' + (timestamp / 86400).toString()

  let userRealizedPnlDayData = UserRealizedPnlDayData.load(id)
  if (!userRealizedPnlDayData) {
    userRealizedPnlDayData = new UserRealizedPnlDayData(id)
    userRealizedPnlDayData.date = timestamp
    userRealizedPnlDayData.user = user.id
    userRealizedPnlDayData.realizedPnl = BD_ZERO
    userRealizedPnlDayData.transactions = ZERO_BI
    userRealizedPnlDayData.volumeInBUSD = BD_ZERO
    userRealizedPnlDayData.createdBlockNumber = event.block.number

    userRealizedPnlDayData.save()
  }

  return userRealizedPnlDayData
}

export function getOrInitUser(
  userAddress: string,
  event: ethereum.Event
): User {
  let user = User.load(userAddress)
  if (!user) {
    user = new User(userAddress)
    user.label = getAddressLabel(userAddress)
    user.balance = ZERO_BI
    user.totalTokensBuy = ZERO_BI
    user.totalTokensSell = ZERO_BI
    user.totalVolumeInBUSD = BD_ZERO
    
    user.totalTransactions = ZERO_BI
    
    user.createdBlockNumber = event.block.number
    user.createdTimestamp = event.block.timestamp
    user.updatedTimestamp = event.block.timestamp

    user.save()
  }

  return user
}

export function initTransaction(
  amount: BigInt,
  action: string,
  from: User,
  to: User,
  event: ethereum.Event
): void {
  let transaction = new Transaction(event.transaction.hash.toHexString())
  transaction.amount = amount
  transaction.action = action
  transaction.from = from.id
  transaction.to = to.id
  transaction.gasLimit = event.transaction.gasLimit
  transaction.gasPrice = event.transaction.gasPrice
  transaction.createdBlockNumber = event.block.number
  transaction.createdTimestamp = event.block.timestamp
  transaction.save()
}

export function initSwapTransaction(
  sender: User,
  amountPosi: BigInt,
  amountQuote: BigInt,
  amountBusd: BigDecimal,
  action: string,
  market: string,
  event: ethereum.Event
): void {
  let transaction = new SwapTransaction('swap:' + event.transaction.hash.toHexString())
  transaction.amountPosi = amountPosi
  transaction.amountQuote = amountQuote
  transaction.amountBusd = amountBusd
  transaction.action = action
  transaction.market = market
  transaction.from = sender.id
  transaction.gasLimit = event.transaction.gasLimit
  transaction.gasPrice = event.transaction.gasPrice
  transaction.createdBlockNumber = event.block.number
  transaction.createdTimestamp = event.block.timestamp
  transaction.save()
}

export function initDonate(event: Donate): void {
  let donateRecord = new DonateRecord(event.transaction.hash.toHexString())
  donateRecord.donor = event.params.sender
  donateRecord.amount = event.params.amount
  donateRecord.createdBlockNumber = event.block.number
  donateRecord.createdTimestamp = event.block.timestamp
  donateRecord.save()
}

export function getOrInitBotKeeper(
  event: BotKeeperChanged
): BotKeeper {
  let botKeeper = BotKeeper.load('Botkeeper')
  if (!botKeeper) {
    botKeeper = new BotKeeper('Botkeeper')
    botKeeper.txHash = event.transaction.hash
    botKeeper.creator = event.transaction.from
    botKeeper.currentAddress = event.params.newKeeper
    botKeeper.previousTxHashes = []
    botKeeper.previousAddresses = []
    botKeeper.createdBlockNumber = event.block.number
    botKeeper.createdTimestamp = event.block.timestamp
    botKeeper.updatedTimestamp = event.block.timestamp
    botKeeper.save()
  }

  return botKeeper
}

export function getOrInitTreasury(
  event: TreasuryContractChanged
): Treasury {
  let treasury = Treasury.load('Treasury')
  if (!treasury) {
    treasury = new Treasury('Treasury')
    treasury.txHash = event.transaction.hash
    treasury.creator = event.transaction.from
    treasury.currentAddress = event.params.newAddress
    treasury.previousTxHashes = []
    treasury.previousAddresses = []
    treasury.createdBlockNumber = event.block.number
    treasury.createdTimestamp = event.block.timestamp
    treasury.updatedTimestamp = event.block.timestamp
    treasury.save()
  }

  return treasury
}

export function getOrInitApprovalContract(
  address: string,
  event: ethereum.Event
): ApprovalContract {
  let contract = ApprovalContract.load(address)

  if (!contract) {
    contract = new ApprovalContract(address)
    contract.totalApprovals = ZERO_BI
    contract.createdBlockNumber = event.block.number
    contract.createdTimestamp = event.block.timestamp
    contract.updatedTimestamp = event.block.timestamp
    contract.save()
  }

  return contract
}
