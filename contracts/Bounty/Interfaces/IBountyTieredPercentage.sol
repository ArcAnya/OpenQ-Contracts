// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.17;

import './IBountyCore.sol';
import './IBountyTiered.sol';

interface IBountyTieredPercentage is IBountyCore, IBountyTiered {
    function setPayoutSchedule(uint256[] calldata _payoutSchedule) external;
}
