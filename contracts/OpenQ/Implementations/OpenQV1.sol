// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.12;

// Custom
import '../../Bounty/Implementations/BountyV0.sol';
import '../../BountyFactory/BountyFactory.sol';
import '../IOpenQ.sol';
import '../../Storage/OpenQStorage.sol';
import '../../Tokens/OpenQTokenWhitelist.sol';

contract OpenQV1 is OpenQStorageV1, IOpenQ {
    using SafeMathUpgradeable for uint256;

    function setNewStorageVar(uint256 _newStorageVar) public {
        newStorageVar = _newStorageVar;
    }

    constructor() {}

    function initialize(address oracle) external initializer onlyProxy {
        __Ownable_init();
        __UUPSUpgradeable_init();
        __Oraclize_init(oracle);
        __ReentrancyGuard_init();
    }

    // Transactions
    function mintBounty(
        string calldata _bountyId,
        string calldata _organization
    ) external nonReentrant onlyProxy returns (address) {
        require(
            bountyIdToAddress[_bountyId] == address(0),
            'BOUNTY_ALREADY_EXISTS'
        );
        address bountyAddress = bountyFactory.mintBounty(
            _bountyId,
            msg.sender,
            _organization
        );

        bountyIdToAddress[_bountyId] = bountyAddress;

        emit BountyCreated(
            _bountyId,
            _organization,
            msg.sender,
            bountyAddress,
            block.timestamp
        );

        return bountyAddress;
    }

    function fundBountyNFT(
        string calldata _bountyId,
        address _tokenAddress,
        uint256 _tokenId,
        uint256 _expiration
    ) external nonReentrant onlyProxy returns (bool success) {
        address bountyAddress = bountyIdToAddress[_bountyId];
        BountyV0 bounty = BountyV0(payable(bountyAddress));

        require(isWhitelisted(_tokenAddress), 'TOKEN_NOT_ACCEPTED');
        require(bountyIsOpen(_bountyId) == true, 'FUNDING_CLOSED_BOUNTY');

        bytes32 depositId = bounty.receiveNft(
            msg.sender,
            _tokenAddress,
            _tokenId,
            _expiration
        );

        emit NFTDepositReceived(
            depositId,
            bountyAddress,
            _bountyId,
            bounty.organization(),
            _tokenAddress,
            block.timestamp,
            msg.sender,
            _expiration,
            _tokenId
        );

        return true;
    }

    function isWhitelisted(address tokenAddress) public view returns (bool) {
        return openQTokenWhitelist.isWhitelisted(tokenAddress);
    }

    function fundBountyToken(
        string calldata _bountyId,
        address _tokenAddress,
        uint256 _volume,
        uint256 _expiration
    ) external payable nonReentrant onlyProxy returns (bool success) {
        address bountyAddress = bountyIdToAddress[_bountyId];
        BountyV0 bounty = BountyV0(payable(bountyAddress));

        require(isWhitelisted(_tokenAddress), 'TOKEN_NOT_ACCEPTED');
        require(bountyIsOpen(_bountyId), 'FUNDING_CLOSED_BOUNTY');

        (bytes32 depositId, uint256 volumeReceived) = bounty.receiveFunds{
            value: msg.value
        }(msg.sender, _tokenAddress, _volume, _expiration);

        emit TokenDepositReceived(
            depositId,
            bountyAddress,
            _bountyId,
            bounty.organization(),
            _tokenAddress,
            block.timestamp,
            msg.sender,
            _expiration,
            volumeReceived
        );

        return true;
    }

    function claimBounty(string calldata _bountyId, address closer)
        external
        onlyOracle
        nonReentrant
    {
        require(bountyIsOpen(_bountyId) == true, 'CLAIMING_CLOSED_BOUNTY');

        address bountyAddress = bountyIdToAddress[_bountyId];
        BountyV0 bounty = BountyV0(payable(bountyAddress));

        for (uint256 i = 0; i < bounty.getTokenAddresses().length; i++) {
            address tokenAddress = bounty.getTokenAddresses()[i];
            uint256 volume = bounty.claimBalance(closer, tokenAddress);

            emit TokenBalanceClaimed(
                bounty.bountyId(),
                bountyAddress,
                bounty.organization(),
                closer,
                block.timestamp,
                tokenAddress,
                volume
            );
        }

        for (uint256 i = 0; i < bounty.getNftDeposits().length; i++) {
            bounty.claimNft(closer, bounty.nftDeposits(i));
        }

        bounty.close(closer);

        emit BountyClosed(
            _bountyId,
            bountyAddress,
            bounty.organization(),
            closer,
            block.timestamp
        );
    }

    function refundDeposit(string calldata _bountyId, bytes32 _depositId)
        external
        nonReentrant
        onlyProxy
        returns (bool success)
    {
        address bountyAddress = bountyIdToAddress[_bountyId];
        BountyV0 bounty = BountyV0(payable(bountyAddress));

        require(bountyIsOpen(_bountyId) == true, 'REFUNDING_CLOSED_BOUNTY');

        require(
            bounty.funder(_depositId) == msg.sender,
            'ONLY_FUNDER_CAN_REQUEST_REFUND'
        );

        require(
            block.timestamp >=
                bounty.depositTime(_depositId).add(
                    bounty.expiration(_depositId)
                ),
            'PREMATURE_REFUND_REQUEST'
        );

        bounty.refundDeposit(_depositId, msg.sender);

        emit DepositRefunded(
            _depositId,
            _bountyId,
            bountyAddress,
            bounty.organization(),
            block.timestamp
        );

        return true;
    }

    // Convenience Methods
    function bountyIsOpen(string calldata _bountyId)
        public
        view
        returns (bool)
    {
        address bountyAddress = bountyIdToAddress[_bountyId];
        BountyV0 bounty = BountyV0(payable(bountyAddress));
        bool isOpen = bounty.status() == 0;
        return isOpen;
    }

    function bountyAddressToBountyId(address bountyAddress)
        external
        view
        returns (string memory)
    {
        BountyV0 bounty = BountyV0(payable(bountyAddress));
        return bounty.bountyId();
    }

    // Upgrades
    function _authorizeUpgrade(address) internal override onlyOwner {}

    function getImplementation() external view returns (address) {
        return _getImplementation();
    }

    function setBountyFactory(address _bountyFactory)
        external
        onlyProxy
        onlyOwner
    {
        bountyFactory = BountyFactory(_bountyFactory);
    }

    function setTokenWhitelist(address _openQTokenWhitelist)
        external
        onlyProxy
        onlyOwner
    {
        openQTokenWhitelist = OpenQTokenWhitelist(_openQTokenWhitelist);
    }

    function transferOracle(address _newOracle) external onlyProxy onlyOwner {
        require(
            _newOracle != address(0),
            'Oraclize: new oracle is the zero address'
        );
        _transferOracle(_newOracle);
    }
}
