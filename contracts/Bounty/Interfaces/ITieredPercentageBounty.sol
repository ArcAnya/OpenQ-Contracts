// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.17;

import './IBountyCore.sol';
import './ITieredBounty.sol';

interface ITieredPercentageBounty is IBountyCore, ITieredBounty {
    function setPayoutSchedule(uint256[] calldata _payoutSchedule) external;

    function claimTiered(
        address _payoutAddress,
        uint256 _tier,
        address _tokenAddress
    ) external returns (uint256);
}
