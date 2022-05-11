# OpenQ Smart Contracts 

Welcome! By luck or misfortune you've found yourself in the OpenQ on-chain universe. Let's get you started.

## Core User Actions

OpenQ revolves around 4 core user actions, each with a corresponding Event which can be found in [IOpenQ.sol](https://github.com/OpenQDev/OpenQ-Contracts/blob/production/contracts/OpenQ/IOpenQ.sol).

Those actions are:

- Bounty Creation
- Bounty Funding (Tokens and NFTs)
- Bounty Claim
- Bounty Refund

All of these actions are triggered on the main current version of OpenQ, [OpenQV0](https://github.com/OpenQDev/OpenQ-Contracts/blob/production/contracts/OpenQ/Implementations/OpenQV0.sol), via the [OpenQProxy](https://github.com/OpenQDev/OpenQ-Contracts/blob/production/contracts/OpenQ/proxy/OpenQProxy.sol).

<hr/>

### Bounty Creation

Bounty creation occurs when a user, through the frontend or directly to the contract, submits a GitHub issueUrl to the [mintBounty method](https://github.com/OpenQDev/OpenQ-Contracts/blob/production/contracts/OpenQ/Implementations/OpenQV0.sol#L80).

This emits a `BountyCreated` event from the OpenQ Proxy address.

`mintBounty` should only be callable through the OpenQProxy.

<hr/>

### Bounty Funding - Tokens and NFTs

Bounties can be funded with:
- MATIC
- ERC20 tokens approved on the [OpenQTokenWhitelist](https://github.com/OpenQDev/OpenQ-Contracts/blob/production/contracts/Tokens/OpenQTokenWhitelist.sol) contract.
- NFTs

The atomic unit of funding is a `deposit` which is timelocked until the `expiration` date is reached, at which point it can be refunded.

Rather than use a struct, deposits are [decomposed mappings]](https://github.com/OpenQDev/OpenQ-Contracts/blob/production/contracts/Storage/BountyStorage.sol#L43) to keep things nice and primitive.

Bounty funding emits a `TokenDepositReceived` event if funded with the [fundBountyToken](https://github.com/OpenQDev/OpenQ-Contracts/blob/production/contracts/OpenQ/Implementations/OpenQV0.sol#L114) method from the OpenQ Proxy address.

Bounty funding emits a `NFTDepositReceived` event if funded with the [fundBountyNft](https://github.com/OpenQDev/OpenQ-Contracts/blob/production/contracts/OpenQ/Implementations/OpenQV0.sol#L150) method from the OpenQ Proxy address.

#### Access Restrictions

Funding is permissionless - anyone can fund a bounty from any address.

Since during claim we loop over all funded addresses, we do however whitelist tokens to prevent Out-of-Gas DOS Attacks

This limits loop iterations to:

`20 Whitelisted ERC20 Token Addresses + 5 NFT Addresses = 25 array iterations`

`fundBountyToken` and `fundBountyNft` should only be callable through the OpenQProxy.

<hr/>

### Bounty Claim

Claiming is still a relatively centralized process.

A potential claimant uses GitHub OAuth to sign-in on OpenQ. This bestows them with a signed OAuth token.

This token, along with the desired `payoutAddress` is sent to our oracle which runs as an [Open Zeppelin Defender Autotask](https://github.com/OpenQDev/OpenQ-OZ-Claim-Autotask).

The oracle verifies that the authenticated claimant is indeed the author of the merged pull request on GitHub according to OpenQ's [withdrawal criteria](https://github.com/OpenQDev/OpenQ-OZ-Claim-Autotask/blob/local/lib/checkWithdrawalEligibility.js#L26).

If they verified, then the oracle calls [claimBounty(address)](https://github.com/OpenQDev/OpenQ-Contracts/blob/production/contracts/OpenQ/Implementations/OpenQV0.sol#L187) with the `bountyId` (same as GitHub Issue Id) and the `closer` address.

`claimBounty` first checks that the bounty is still open.

It then loops over the subset of the 20 whitelisted token addresses, calling `transfer` on each to send funds to the `payoutAddress`.

Each loop emits and event called `TokenBalanceClaimed`.

After transferring all tokens, it then does the same for all NFTs. Here, rather than looping over NFT addresses, we loop over the NFT deposits so we know which tokenId to transfer.

Each loop emits and event called `TokenBalanceClaimed`.

After all of this, `claimBounty` finally calls `bounty.close()` to toggles the status of an issue from 0 to 1, from open to closed.

This emits a `BountyClosed` event.

#### Access Restrictions

The `claimBounty` method is only callable by the OpenQ Oracle. This is achieved with the [Oraclize](https://github.com/OpenQDev/OpenQ-Contracts/blob/production/contracts/Oracle/Oraclize.sol) contract modeled off of the Open Zeppelin Ownable contract.

We needed to make a clone of the Ownable contract for this because OpenQ already inherits Ownable, which is used for upgrade admin purposes.

<hr/>

### Deposit Refunded

Successful refunds occur when the initial funder calls the [refundDeposit](https://github.com/OpenQDev/OpenQ-Contracts/blob/production/contracts/OpenQ/Implementations/OpenQV0.sol#L232) method with the desired `bountyId` and `depositId` after that deposits `expiration` escrow period has passed.

#### Access Restrictions

Refund should revert if the targeted deposits `expiration` has not yet been reached as reflected by `block.timestamp`.

Refunds should only be returned to the initial funder.

`refundDeposit` should only be callable through the OpenQProxy.

<hr />

## Contract Architecture

The four core OpenQ actions defined above are composed across five contracts.

- OpenQV0 (Proxy) Deployed automatically by the [hardhat-upgrades](https://www.npmjs.com/package/@openzeppelin/hardhat-upgrades) plugin. It is an ERC-1967 [UUPSUpgradeable](https://docs.openzeppelin.com/contracts/4.x/api/proxy#UUPSUpgradeable) contract.
- [OpenQV0 (Implementation)](https://github.com/OpenQDev/OpenQ-Contracts/blob/development/contracts/OpenQ/Implementations/OpenQV0.sol)
- [OpenQStorageV0.sol](https://github.com/OpenQDev/OpenQ-Contracts/blob/development/contracts/Storage/OpenQStorage.sol)

- [BountyV0.sol](https://github.com/OpenQDev/OpenQ-Contracts/blob/production/contracts/Bounty/Implementations/BountyV0.sol)
- [BountyStorageV0.sol](https://github.com/OpenQDev/OpenQ-Contracts/blob/production/contracts/Storage/BountyStorage.sol)
- [BountyFactory.sol](https://github.com/OpenQDev/OpenQ-Contracts/blob/development/contracts/BountyFactory/BountyFactory.sol)
- [BountyBeacon.sol](https://github.com/OpenQDev/OpenQ-Contracts/blob/production/contracts/Bounty/Proxy/BountyBeacon.sol)

We will cover each of those five contracts below.

### [BountyV0.sol](https://github.com/OpenQDev/OpenQ-Contracts/blob/development/contracts/Bounty/Implementations/BountyV0.sol)

Each BountyV0 contract represent one bounty linked to one GitHub Issue. 

The `bountyId` is the [Global Node Id](https://docs.github.com/en/graphql/guides/using-global-node-ids) of the issue linked to that bounty.

The one-to-one link between a bounty, a GitHub issue and a smart contract enables OpenQ to offboard much of the deposit accounting to the tried and true ERC-20 standard.

Any exploit against a BountyV0 contract could acquire at most all of the deposits on that one issue. The core contract OpenQV0 holds no deposits.

This flexiibility allows us to accept any ERC-20, and in the future ERC-721, as bounty.

Since only the [runtime bytecode](https://medium.com/authereum/bytecode-and-init-code-and-runtime-code-oh-my-7bcd89065904) is available, which does not include the constructor the BountyV0 implementation only has an [initialize](https://github.com/OpenQDev/OpenQ-Contracts/blob/development/contracts/Bounty/Bounty.sol#L53) method.

The initialize method is protected from being called mutiple times by [OpenZeppelin's Initializable](https://github.com/OpenZeppelin/openzeppelin-upgrades/blob/master/packages/core/contracts/Initializable.sol) interface.

### Upgradeability



### Additional Information on Access Control Modifiers

#### onlyOpenQ

To prevent any calls which may trigger bounty state transitions without emitting an indexable event in the core OpenQ contract, we protect all methods on BountyV0 with the `onlyOpenQ` modifier defined in [Bounty.sol](https://github.com/OpenQDev/OpenQ-Contracts/blob/development/contracts/Bounty/Bounty.sol#L150), an abstract contract inhereited by BountyV0.

### [BountyFactory.sol](https://github.com/OpenQDev/OpenQ-Contracts/blob/development/contracts/BountyFactory/BountyFactory.sol)

The BountyFactory is responsible for minting new bounties using the [ERC-1167 Minimal Proxy](https://eips.ethereum.org/EIPS/eip-1167) pattern to mint new bounties using the least gas possible.

The implementation contract hardcoded into the BountyFactory is [BountyV0](https://github.com/OpenQDev/OpenQ-Contracts/blob/development/contracts/Bounty/Implementations/BountyV0.sol).

### [OpenQV0](https://github.com/OpenQDev/OpenQ-Contracts/blob/development/contracts/OpenQ/Implementations/OpenQV0.sol)

This is the core contract with which both the frontend and the [OpenQ Oracle](https://github.com/OpenQDev/OpenQ-OZ-Claim-Autotask) interacts.

It is hosted behind an ERC-1967 [UUPSUpgradeable](https://docs.openzeppelin.com/contracts/4.x/api/proxy#UUPSUpgradeable) contract.

For that reason it does not have a constructor - it only has an [initialize](https://github.com/OpenQDev/OpenQ-Contracts/blob/development/contracts/OpenQ/Implementations/OpenQV0.sol#L27) method.

Being behind an upgradable proxy, the five Events decalred in [IOpenQ](https://github.com/OpenQDev/OpenQ-Contracts/blob/development/contracts/OpenQ/IOpenQ.sol) will continue to be emitted from the same proxy even after the implementation is upgraded.

#### onlyOracle

The [`claimBounty`](https://github.com/OpenQDev/OpenQ-Contracts/blob/development/contracts/OpenQ/Implementations/OpenQV0.sol#L120) method is protected by the `onlyOracle` modifier defined in [Oraclize](https://github.com/OpenQDev/OpenQ-Contracts/blob/development/contracts/Oracle/Oraclize.sol).

Oraclize is a contract based off of OpenZeppelin's [Ownable](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol) contract. It exposes methods for updating the oracle's address which is allowed to call claim on the OpenQV0 contract.

The OpenQ Oracle private keys are held in a vault and transaction signer hosted on [OpenZepplelin Defender Relay](https://docs.openzeppelin.com/defender/relay). 

The OpenQ Oracle calls `claimBounty` when the [OpenZeppelin Defender Autotask](https://docs.openzeppelin.com/defender/autotasks) confirms that the person authenticated by the GitHub OAuth token present in the [X-Authorization header](https://github.com/OpenQDev/OpenQ-OZ-Claim-Autotask/blob/development/main.js#L12) is indeed the person who [closed the bounty with their pull request](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue).

#### onlyProxy

We do not want to allow users to maliciously or accidentally call the OpenQV0.sol contract directly. If they were to do so, the Event would be emitted from the implementation and not from the proxy. Since our subgraph is indexing only the proxy address, this would break our accounting.

`onlyProxy` is from the Open Zeppelin contract-upgradeable library on the [UUPSUpgradable.sol](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/master/contracts/proxy/utils/UUPSUpgradeable.sol#L38) contract.

`onlyProxy` requries that `address(this)` (the caller) is NOT an immutable `_self` set when the implementation contract is deployed.