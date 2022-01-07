// contracts/BountyFactory.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/proxy/Clones.sol';
import '../Bounty/Implementations/BountyV0.sol';

contract BountyFactory {
    address public immutable bountyImplementation;

    constructor() {
        bountyImplementation = address(new BountyV0());
    }

    function mintBounty(
        string memory _id,
        address _issuer,
        string memory _organization
    ) external returns (address) {
        address clone = Clones.cloneDeterministic(
            bountyImplementation,
            keccak256(abi.encode(_id))
        );
        BountyV0(clone).initialize(_id, _issuer, _organization);
        return clone;
    }

    function predictDeterministicAddress(string memory _id)
        public
        view
        returns (address predicted)
    {
        return
            Clones.predictDeterministicAddress(
                bountyImplementation,
                keccak256(abi.encode(_id)),
                address(this)
            );
    }
}
