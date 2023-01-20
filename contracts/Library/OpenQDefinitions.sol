// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.17;

library OpenQDefinitions {
    struct InitOperation {
        uint32 operationType;
        bytes data;
    }

    // Bounty Types
    uint32 internal constant ATOMIC = 0;
    uint32 internal constant ONGOING = 1;
    uint32 internal constant TIERED = 2;
    uint32 internal constant TIERED_FIXED = 3;

    uint32 internal constant OPEN = 0;
    uint32 internal constant CLOSED = 1;
}
