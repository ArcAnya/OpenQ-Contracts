// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.12;

import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';

abstract contract BountyStorageV0 {
    // Bounty Metadata
    string public bountyId;
    uint256 public bountyCreatedTime;
    uint256 public bountyClosedTime;
    address public issuer;
    string public organization;
    address public closer;
    uint256 public status;

    // Deposit Data - A Deconstructed Deposit Struct
    mapping(bytes32 => address) public funder;
    mapping(bytes32 => address) public tokenAddress;
    mapping(bytes32 => uint256) public volume;
    mapping(bytes32 => uint256) public depositTime;
    mapping(bytes32 => bool) public refunded;
    mapping(bytes32 => address) public payoutAddress;
    mapping(bytes32 => uint256) public tokenId;
    mapping(bytes32 => uint256) public expiration;
    mapping(bytes32 => bool) public isNFT;

    // Deposit Count and IDs
    bytes32[] public deposits;
    bytes32[] public nftDeposits;

    // Token Addresses and Volumes
    EnumerableSet.AddressSet internal tokenAddresses;

    // Constants
    uint256 constant nftDepositLimit = 5;
}
