// contracts/MockToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract Issue is Ownable {
    string public issueId;
    address public closer;
    address[] public tokenAddresses;

    enum IssueStatus {
        OPEN,
        CLOSED
    }

    IssueStatus public status;

    constructor(string memory _id, address[] memory _tokenAddresses) {
        issueId = _id;
        tokenAddresses = _tokenAddresses;
        status = IssueStatus.OPEN;
    }

    function getERC20Balance(address _tokenAddress)
        public
        view
        returns (uint256 balance)
    {
        ERC20 tokenAddress = ERC20(_tokenAddress);
        return tokenAddress.balanceOf(address(this));
    }

    function transferAllERC20(address _payoutAddress) public onlyOwner {
        require(
            this.status() == IssueStatus.OPEN,
            'This is issue is closed. Cannot withdraw again.'
        );

        for (uint256 i; i < tokenAddresses.length; i++) {
            ERC20 tokenContract = ERC20(tokenAddresses[i]);
            tokenContract.transfer(
                _payoutAddress,
                tokenContract.balanceOf(address(this))
            );
        }
        status = IssueStatus.CLOSED;
        closer = _payoutAddress;
    }
}
