// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.13;

/**
 * @dev Third party imports inherited by OpenQV1
 */
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';

/**
 * @dev Custom imports inherited by OpenQV0
 */
import '../BountyFactory/BountyFactory.sol';
import '../Tokens/OpenQTokenWhitelist.sol';
import '../Bounty/Implementations/BountyV1.sol';
import '../Oracle/Oraclize.sol';

/**
 * @title OpenQStorageV0
 * @dev Backwards compatible, append-only chain of storage contracts inherited by OpenQ implementations
 */
abstract contract OpenQStorageV0 is
    OwnableUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    Oraclize
{
    BountyFactory public bountyFactory;
    OpenQTokenWhitelist public openQTokenWhitelist;
    mapping(string => address) public bountyIdToAddress;
}

abstract contract OpenQStorageV1 is OpenQStorageV0 {
    uint256 public newStorageVar;
}
