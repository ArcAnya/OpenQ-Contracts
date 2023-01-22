// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.17;

/**
 * @dev Custom imports - all transitive imports live in BountyStorage
 */
import '../Storage/TieredBountyStorage.sol';

/**
 * @title BountyV1
 * @dev Bounty Implementation Version 1
 */
contract TieredBountyV1 is TieredBountyStorageV1 {
    /**
     * INITIALIZATION
     */

    using SafeERC20Upgradeable for IERC20Upgradeable;
    using AddressUpgradeable for address payable;
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

    constructor() {}

    /**
     * @dev Initializes a bounty proxy with initial state
     * @param _bountyId The unique bounty identifier
     * @param _issuer The sender of the mint bounty transaction
     * @param _organization The organization associated with the bounty
     * @param _openQ The OpenQProxy address
     * @param _claimManager The Claim Manager proxy address
     * @param _depositManager The Deposit Manager proxy address
     * @param _operation The ABI encoded data determining the type of bounty being initialized and associated data
     */
    function initialize(
        string memory _bountyId,
        address _issuer,
        string memory _organization,
        address _openQ,
        address _claimManager,
        address _depositManager,
        OpenQDefinitions.InitOperation memory _operation
    ) external initializer {
        require(bytes(_bountyId).length != 0, Errors.NO_EMPTY_BOUNTY_ID);
        require(bytes(_organization).length != 0, Errors.NO_EMPTY_ORGANIZATION);

        __ReentrancyGuard_init();

        __OnlyOpenQ_init(_openQ);
        __ClaimManagerOwnable_init(_claimManager);
        __DepositManagerOwnable_init(_depositManager);

        bountyId = _bountyId;
        issuer = _issuer;
        organization = _organization;
        bountyCreatedTime = block.timestamp;
        nftDepositLimit = 5;

        (
            bool _hasFundingGoal,
            address _fundingToken,
            uint256 _fundingGoal,
            bool _invoiceable,
            bool _kycRequired,
            bool _supportingDocuments,
            string memory _externalUserId,
            ,

        ) = abi.decode(
                _operation.data,
                (
                    bool,
                    address,
                    uint256,
                    bool,
                    bool,
                    bool,
                    string,
                    string,
                    string
                )
            );

        bountyType = OpenQDefinitions.ATOMIC;
        hasFundingGoal = _hasFundingGoal;
        fundingToken = _fundingToken;
        fundingGoal = _fundingGoal;
        invoiceable = _invoiceable;
        kycRequired = _kycRequired;
        supportingDocuments = _supportingDocuments;
        externalUserId = _externalUserId;
    }

    /**
     * @dev Changes bounty status from 0 (OPEN) to 1 (CLOSED)
     * @param _payoutAddress The closer of the bounty
     * @param _closerData ABI-encoded data about the claimant and claimant asset
     */
    function close(address _payoutAddress, bytes calldata _closerData)
        external
        onlyClaimManager
    {
        require(
            status == OpenQDefinitions.OPEN,
            Errors.CONTRACT_ALREADY_CLOSED
        );
        require(_payoutAddress != address(0), Errors.NO_ZERO_ADDRESS);
        status = OpenQDefinitions.CLOSED;
        closer = _payoutAddress;
        bountyClosedTime = block.timestamp;
        closerData = _closerData;
    }

    /**
     * @dev Whether or not KYC is required to fund and claim the bounty
     * @param _data Whether or not KYC is required to fund and claim the bounty
     */
    function setInvoiceComplete(bytes calldata _data) external onlyOpenQ {
        (uint256 _tier, bool _invoiceComplete) = abi.decode(
            _data,
            (uint256, bool)
        );
        invoiceComplete[_tier] = _invoiceComplete;
    }

    /**
     * @dev Whether or not KYC is required to fund and claim the bounty
     * @param _data Whether or not KYC is required to fund and claim the bounty
     */
    function setSupportingDocumentsComplete(bytes calldata _data)
        external
        onlyOpenQ
    {
        (uint256 _tier, bool _supportingDocumentsComplete) = abi.decode(
            _data,
            (uint256, bool)
        );
        supportingDocumentsComplete[_tier] = _supportingDocumentsComplete;
    }

    /**
     * @dev receive() method to accept protocol tokens
     */
    receive() external payable {
        revert(
            'Cannot send Ether directly to boutny contract. Please use the BountyV1.receiveFunds() method.'
        );
    }
}
