// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.13;

// Third Party
import '@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol';

/// @title BountyBeacon
/// @author OpenQ
/// @dev UpgradeableBeacon holding the current bounty implementation referred to by all BeaconProxy bounties
contract BountyBeacon is UpgradeableBeacon {
    /*///////////////////////////////////////////////////////////////
												INIITIALIZATION
    //////////////////////////////////////////////////////////////*/

    /**
		Initializes an UpgradeableBeacon which will transmit the current implementation of Bounty to all BeaconProxy bounties
		@param _implementation The initial implementation of Bounty
		 */
    constructor(address _implementation) UpgradeableBeacon(_implementation) {}
}
