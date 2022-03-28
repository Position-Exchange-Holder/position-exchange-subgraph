# Postion Referral Subgraph

## Available Events
  - **OperatorUpdated(indexed address,indexed bool)**
  - OwnershipTransferred(indexed address,indexed address)
  - **ReferralCommissionRecorded(indexed address,uint256)**
  - **ReferralRecorded(indexed address,indexed address)**

## Query Data

### Query Total Referrals and Commissions of Protocol
```graphql
query PositionReferral($positionReferralId: ID!) {
  positionReferral(id: $positionReferralId) {
    totalReferrals
    totalReferralCommissions
    createdTimestamp
    updatedTimestamp
  }
}

Query Variables
{
  "positionReferralId": "1"
}
```

### Query top 10 Referrer by Total Referrals or Commissions
```graphql
query Referrers($orderBy: Referrer_orderBy, $orderDirection: OrderDirection, $first: Int) {
  referrers(orderBy: $orderBy, orderDirection: $orderDirection, first: $first) {
    id
    totalReferrals
    totalReferralCommissions
    createdTimestamp
    updatedTimestamp
  }
}

Query Variables
{
  "first": 10,
  "orderBy": "totalReferrals" | "totalReferralCommissions",
  "orderDirection": "desc"
}
```

### Query recent referral transactions
```graphql
query UserReferralRecords($first: Int, $skip: Int, $orderBy: UserReferralRecord_orderBy, $orderDirection: OrderDirection) {
  userReferralRecords(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
    id
    user
    referrer {
      id
    }
    refTxHash
    createdTimestamp
  }
}

Query Variables
{
  "skip": 0,
  "first": 10,
  "orderBy": "createdBlockNumber",
  "orderDirection": "desc"
}
```

### Query recent referral transactions of referrer
```graphql
query Referrer($referrerId: ID!, $skip: Int, $first: Int, $orderBy: UserReferralRecord_orderBy) {
  referrer(id: $referrerId) {
    recordsRef(skip: $skip, first: $first, orderBy: $orderBy) {
      id
      user
      refTxHash
      createdTimestamp
    }
  }
}

{
  "referrerId": "0x7f35bf7d973fd613a9b280b385f63cbff9430fd4",
  "skip": 0,
  "first": 10,
  "orderBy": "createdBlockNumber",
  "orderDirection": "desc"
}
```
