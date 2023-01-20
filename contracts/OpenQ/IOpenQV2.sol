// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.17;

/**
 * @title IOpenQ
 * @dev Interface declaring all OpenQ Events
 */
interface IOpenQV2 {
    function externalUserIdToAddress(string calldata)
        external
        returns (address);

    function addressToExternalUserId(address) external returns (string memory);
}
