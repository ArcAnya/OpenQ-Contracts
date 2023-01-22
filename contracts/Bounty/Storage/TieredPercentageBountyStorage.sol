// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.17;

import '../Implementations/BountyCore.sol';
import '../Storage/TieredBountyStorage.sol';

/**
 * @title BountyStorageV1
 * @dev Backwards compatible, append-only chain of storage contracts inherited by Bounty implementations
 */
abstract contract TieredPercentageBountyStorageV1 is
    TieredBountyStorageV1,
    BountyCore
{

}
