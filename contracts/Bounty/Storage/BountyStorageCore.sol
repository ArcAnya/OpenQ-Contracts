// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.17;

/**
 * @dev Third party imports inherited by BountyV0
 */
import '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/utils/ERC721HolderUpgradeable.sol';

/**
 * @dev Custom imports inherited by BountyV0
 */
import '../../OnlyOpenQ/OnlyOpenQ.sol';
import '../../ClaimManager/ClaimManagerOwnable.sol';
import '../../DepositManager/DepositManagerOwnable.sol';
import '../../Library/OpenQDefinitions.sol';
import '../../Library/Errors.sol';

import '../Interfaces/IBounty.sol';

/**
 * @title BountyStorageV1
 * @dev Backwards compatible, append-only chain of storage contracts inherited by Bounty implementations
 */
abstract contract BountyStorageCore is
    IBounty,
    ReentrancyGuardUpgradeable,
    ERC721HolderUpgradeable,
    OnlyOpenQ,
    ClaimManagerOwnable,
    DepositManagerOwnable
{
    /**
     * @dev Bounty data
     */
    string public bountyId;
    uint256 public bountyCreatedTime;
    uint256 public bountyClosedTime;
    address public issuer;
    string public organization;
    address public closer;
    uint256 public status;
    uint256 public nftDepositLimit;

    /**
     * @dev Deconstructed deposit struct
     */
    mapping(bytes32 => address) public funder;
    mapping(bytes32 => address) public tokenAddress;
    mapping(bytes32 => uint256) public volume;
    mapping(bytes32 => uint256) public depositTime;
    mapping(bytes32 => bool) public refunded;
    mapping(bytes32 => address) public payoutAddress;
    mapping(bytes32 => uint256) public tokenId;
    mapping(bytes32 => uint256) public expiration;
    mapping(bytes32 => bool) public isNFT;

    /**
     * @dev Array of depositIds
     */
    bytes32[] public deposits;
    bytes32[] public nftDeposits;

    /**
     * @dev Set of unique token address
     */
    EnumerableSetUpgradeable.AddressSet internal tokenAddresses;

    /**
     * @dev Data related to the closer of this bounty
     */
    bytes public closerData;

    /**
    The class/type of bounty (Single, Ongoing, or Tiered)
    type is a reserved word in Solidity
		 */
    uint256 public bountyType;

    bool public hasFundingGoal;
    address public fundingToken;
    uint256 public fundingGoal;
    bool public invoiceable;
    bool public kycRequired;
    bool public supportingDocuments;
    string public externalUserId;
}
