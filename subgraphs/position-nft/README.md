# Position NFT Subgraph

## Available Events

### NFT
  - Approval(indexed address,indexed address,indexed uint256)
  - **ApprovalForAll(indexed address,indexed address,bool)**
  - GovernanceTransferred(indexed address,indexed address)
  - **Transfer(indexed address,indexed address,indexed uint256)**

### Factory
  - **GegoAdded(indexed uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,address,address,uint256,uint256,uint256)**
  - **GegoBurn(indexed uint256,uint256,address)**
  - GovernanceTransferred(indexed address,indexed address)
  - NFTReceived(address,address,uint256,bytes)

## RewardPool
  - GovernanceTransferred(indexed address,indexed address)
  - NFTReceived(address,address,uint256,bytes)
  - **RewardAdded(uint256)**
  - RewardLockedUp(indexed address,uint256)
  - RewardPaid(indexed address,uint256)
  - StakedGEGO(indexed address,uint256)
  - WithdrawnGego(indexed address,uint256)