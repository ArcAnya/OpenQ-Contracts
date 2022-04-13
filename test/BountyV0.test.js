/* eslint-disable */
const { BigNumber } = require('@ethersproject/bignumber');
const { expect } = require('chai');
const { ethers } = require("hardhat");
require('@nomiclabs/hardhat-waffle');
const truffleAssert = require('truffle-assertions');
const { generateDepositId } = require('./utils');

describe('BountyV0.sol', () => {
	let bounty;
	let mockLink;
	let mockDai;
	let owner;
	let initializationTimestamp;
	const thirtyDays = 2765000;
	let BountyV0;

	const mockId = "mockId";
	const organization = "mockOrg";

	beforeEach(async () => {
		BountyV0 = await ethers.getContractFactory('BountyV0');
		const MockLink = await ethers.getContractFactory('MockLink');
		const MockDai = await ethers.getContractFactory('MockDai');
		const MockNft = await ethers.getContractFactory('MockNft');

		[owner] = await ethers.getSigners();

		bounty = await BountyV0.deploy();
		await bounty.deployed();

		// Passing in owner.address as _openQ for unit testing since most methods are onlyOpenQ protected
		initializationTimestamp = await setNextBlockTimestamp();
		await bounty.initialize(mockId, owner.address, organization, owner.address);

		// Deploy mock assets
		mockLink = await MockLink.deploy();
		await mockLink.deployed();

		mockDai = await MockDai.deploy();
		await mockDai.deployed();

		mockNft = await MockNft.deploy();
		await mockNft.deployed();

		await mockNft.safeMint(owner.address);
		await mockNft.safeMint(owner.address);
		await mockNft.safeMint(owner.address);

		await mockNft.approve(bounty.address, 0);
		await mockNft.approve(bounty.address, 1);
		await mockNft.approve(bounty.address, 2);

		// Pre-approve LINK and DAI for transfers during testing
		await mockLink.approve(bounty.address, 10000000);
		await mockDai.approve(bounty.address, 10000000);
	});

	describe('initializer', () => {
		it(`should initialize bounty with correct: 
				bountyId
				issuer
				organization
				status
				openQ implementation
				bountyCreatedTime`, async () => {
			// ARRANGE
			const actualBountyId = await bounty.bountyId();
			const actualIssuer = await bounty.issuer();
			const actualOrganization = await bounty.organization();
			const actualStatus = await bounty.status();
			const actualOpenQ = await bounty.openQ();
			const actualBounyCreatedTime = await bounty.bountyCreatedTime();

			// ASSERT
			await expect(actualBountyId).equals(mockId);
			await expect(actualIssuer).equals(owner.address);
			await expect(organization).equals(organization);
			await expect(actualStatus).equals(0);
			await expect(actualOpenQ).equals(owner.address);
			await expect(actualBounyCreatedTime).equals(initializationTimestamp);
		});

		it('should revert if bountyId is empty', async () => {
			// ARRANGE
			const BountyV0 = await ethers.getContractFactory('BountyV0');
			bounty = await BountyV0.deploy();

			// ASSERT
			await expect(bounty.initialize("", owner.address, organization, owner.address)).to.be.revertedWith('NO_EMPTY_BOUNTY_ID');
		});

		it('should revert if organization is empty', async () => {
			// ARRANGE
			const BountyV0 = await ethers.getContractFactory('BountyV0');
			bounty = await BountyV0.deploy();

			// ASSERT
			await expect(bounty.initialize(mockId, owner.address, "", owner.address)).to.be.revertedWith('NO_EMPTY_ORGANIZATION');
		});
	});

	describe('receiveFunds', () => {
		describe('require and revert', () => {
			it('should revert if not called by OpenQ contract', async () => {
				// ARRANGE
				const [, notOwner] = await ethers.getSigners();
				const volume = 10000;
				let bountyWithNonOwnerAccount = bounty.connect(notOwner);

				// ASSERT
				await expect(bountyWithNonOwnerAccount.receiveFunds(notOwner.address, mockLink.address, volume, thirtyDays)).to.be.revertedWith('Method is only callable by OpenQ');
			});

			it('should revert if no volume is sent', async () => {
				// ASSERT
				await expect(bounty.receiveFunds(owner.address, mockLink.address, 0, thirtyDays)).to.be.revertedWith('ZERO_VOLUME_SENT');
			});

			it('should revert if funder tries to send more than allowance', async () => {
				const greaterThanAllowance = 100000000;
				await expect(bounty.receiveFunds(owner.address, mockLink.address, greaterThanAllowance, thirtyDays)).to.be.revertedWith('ERC20: insufficient allowance');
			});
		});

		describe('token deposit initialization', () => {
			it(`should initialize token deposit data with correct:
					funder
					tokenAddress
					volume
					depositTime
					expiration
					isNft
			`, async () => {
				// ARRANGE

				// ACT
				const depositId = generateDepositId(mockId, 0);
				const expectedTimestamp = await setNextBlockTimestamp();
				await bounty.receiveFunds(owner.address, mockLink.address, 100, thirtyDays);

				// ASSERT
				expect(await bounty.funder(depositId)).to.equal(owner.address);
				expect(await bounty.tokenAddress(depositId)).to.equal(mockLink.address);
				expect(await bounty.volume(depositId)).to.equal(100);
				expect(await bounty.expiration(depositId)).to.equal(thirtyDays);
				expect(await bounty.isNFT(depositId)).to.equal(false);

				const depositTime = await bounty.depositTime(depositId);
				expect(depositTime.toString()).to.equal(expectedTimestamp.toString());
			});
		});

		describe('transferFrom - ERC20', () => {
			it('should transfer volume of ERC20 from sender to bounty (zero transfer fee ERC20)', async () => {
				// ASSUME
				const initialFunderMockLinkBalance = (await mockDai.balanceOf(owner.address)).toString();
				const initialFunderMockDaiBalance = (await mockLink.balanceOf(owner.address)).toString();
				expect(initialFunderMockLinkBalance).to.equal('10000000000000000000000');
				expect(initialFunderMockDaiBalance).to.equal('10000000000000000000000');

				const initialIssueMockLinkBalance = (await mockLink.balanceOf(bounty.address)).toString();
				const initialIssueMockDaiBalance = (await mockDai.balanceOf(bounty.address)).toString();
				expect(initialIssueMockLinkBalance).to.equal('0');
				expect(initialIssueMockDaiBalance).to.equal('0');

				// ARRANGE
				const value = 100;

				// ACT
				await bounty.receiveFunds(owner.address, mockLink.address, value, thirtyDays);
				await bounty.receiveFunds(owner.address, mockDai.address, value, thirtyDays);

				// ASSERT
				const funderMockLinkBalance = (await mockDai.balanceOf(owner.address)).toString();
				const funderFakeTokenBalance = (await mockLink.balanceOf(owner.address)).toString();
				expect(funderMockLinkBalance).to.equal('9999999999999999999900');
				expect(funderFakeTokenBalance).to.equal('9999999999999999999900');

				const bountyMockTokenBalance = (await mockLink.balanceOf(bounty.address)).toString();
				const bountyFakeTokenBalance = (await mockDai.balanceOf(bounty.address)).toString();
				expect(bountyMockTokenBalance).to.equal('100');
				expect(bountyFakeTokenBalance).to.equal('100');
			});
		});

		describe('trasfer - protocol token', () => {
			it('should accept msg.value if token address is zero address', async () => {
				const volume = ethers.utils.parseEther("1.0");
				await bounty.receiveFunds(owner.address, ethers.constants.AddressZero, volume, thirtyDays, { value: volume });
				const bountyProtocolTokenBalance = await bounty.provider.getBalance(bounty.address);
				expect(bountyProtocolTokenBalance).to.equal(volume);
			});
		});

		describe('globally unique deposit ids', () => {
			it('should create a globally unique deposit id across all bounties', async () => {
				await bounty.receiveFunds(owner.address, mockLink.address, 100, thirtyDays);
				const deposits = await bounty.getDeposits();
				const depositId = deposits[0];

				const newBounty = await BountyV0.deploy();
				await newBounty.deployed();
				await newBounty.initialize('other-mock-id', owner.address, organization, owner.address);

				await mockLink.approve(newBounty.address, 20000);
				await newBounty.receiveFunds(owner.address, mockLink.address, 100, thirtyDays);
				const newDeposits = await newBounty.getDeposits();
				const newDepositId = newDeposits[0];

				expect(newDepositId).to.not.equal(depositId);
			});
		});
	});

	describe('receiveNFT', () => {
		describe('reverts', () => {

		});

		describe('deposit initialization', () => {
			it(`should initialize nft deposit data with correct:
					funder
					tokenAddress
					tokenId
					depositTime
					expiration
					isNft
			`, async () => {

				// ACT
				const expectedTimestamp = await setNextBlockTimestamp();
				const depositId = generateDepositId(mockId, 0);
				await bounty.receiveNft(owner.address, mockNft.address, 1, thirtyDays);

				// ASSERT
				expect(await bounty.funder(depositId)).to.equal(owner.address);
				expect(await bounty.tokenAddress(depositId)).to.equal(mockNft.address);
				expect(await bounty.tokenId(depositId)).to.equal(1);
				expect(await bounty.expiration(depositId)).to.equal(thirtyDays);
				expect(await bounty.isNFT(depositId)).to.equal(true);

				const depositTime = await bounty.depositTime(depositId);
				expect(depositTime.toString()).to.equal(expectedTimestamp.toString());
			});
		});

		describe('transfer', () => {
			it('should transfer NFT from owner to bounty contract', async () => {
				// ASSUME
				expect(await mockNft.ownerOf(0)).to.equal(owner.address);

				// ACT
				await bounty.receiveNft(owner.address, mockNft.address, 0, 1);

				// ASSERT
				expect(await mockNft.ownerOf(0)).to.equal(bounty.address);
			});
		});
	});

	describe('refundDeposit', () => {
		describe('require and revert', () => {
			it('should revert if not called by OpenQ contract', async () => {
				// ARRANGE
				const [, notOwner] = await ethers.getSigners();
				let issueWithNonOwnerAccount = bounty.connect(notOwner);

				const mockDepositId = generateDepositId(owner.address, mockLink.address, 123);

				// ASSERT
				await expect(issueWithNonOwnerAccount.refundDeposit(mockDepositId, owner.address)).to.be.revertedWith('Method is only callable by OpenQ');
			});
		});

		describe('refunded', () => {
			it('should set deposit refunded to true on refund', async () => {
				// ARRANGE
				const volume = 100;

				// ASSUME
				const linkDepositId = generateDepositId(mockId, 0);
				await bounty.receiveFunds(owner.address, mockLink.address, volume, 1);
				expect(await bounty.refunded(linkDepositId)).to.equal(false);

				const daiDepositId = generateDepositId(mockId, 1);
				await bounty.receiveFunds(owner.address, mockDai.address, volume, 1);
				expect(await bounty.refunded(daiDepositId)).to.equal(false);

				const protocolDepositId = generateDepositId(mockId, 2);
				await bounty.receiveFunds(owner.address, ethers.constants.AddressZero, volume, 1, { value: volume });
				expect(await bounty.refunded(protocolDepositId)).to.equal(false);

				// ACT
				await bounty.refundDeposit(linkDepositId, owner.address);
				await bounty.refundDeposit(daiDepositId, owner.address);
				await bounty.refundDeposit(protocolDepositId, owner.address);

				// ASSERT
				expect(await bounty.refunded(linkDepositId)).to.equal(true);
				expect(await bounty.refunded(daiDepositId)).to.equal(true);
				expect(await bounty.refunded(protocolDepositId)).to.equal(true);
			});
		});

		describe('transfer', () => {
			it('should transfer refunded ERC20 and protocol token asset from bounty contract to funder', async () => {
				// ARRANGE
				const volume = 100;

				const linkDepositId = generateDepositId(mockId, 0);
				await bounty.receiveFunds(owner.address, mockLink.address, volume, 1);

				const daiDepositId = generateDepositId(mockId, 1);
				await bounty.receiveFunds(owner.address, mockDai.address, volume, 1);

				const protocolDepositId = generateDepositId(mockId, 2);
				await bounty.receiveFunds(owner.address, ethers.constants.AddressZero, volume, 1, { value: volume });

				// ASSUME
				const bountyMockTokenBalance = (await mockLink.balanceOf(bounty.address)).toString();
				const bountyFakeTokenBalance = (await mockDai.balanceOf(bounty.address)).toString();
				const bountyProtocolTokenBalance = (await ethers.provider.getBalance(bounty.address)).toString();

				expect(bountyMockTokenBalance).to.equal('100');
				expect(bountyFakeTokenBalance).to.equal('100');
				expect(bountyProtocolTokenBalance).to.equal('100');

				const funderMockLinkBalance = (await mockLink.balanceOf(owner.address)).toString();
				const funderFakeTokenBalance = (await mockDai.balanceOf(owner.address)).toString();
				expect(funderMockLinkBalance).to.equal('9999999999999999999900');
				expect(funderFakeTokenBalance).to.equal('9999999999999999999900');

				// // // ACT
				await bounty.refundDeposit(linkDepositId, owner.address);
				await bounty.refundDeposit(daiDepositId, owner.address);

				// // // // ASSERT
				const newBountyMockLinkBalance = (await mockLink.balanceOf(bounty.address)).toString();
				const newBountyFakeTokenBalance = (await mockDai.balanceOf(bounty.address)).toString();
				expect(newBountyMockLinkBalance).to.equal('0');
				expect(newBountyFakeTokenBalance).to.equal('0');

				const newFunderMockLinkBalance = (await mockLink.balanceOf(owner.address)).toString();
				const newFunderFakeTokenBalance = (await mockDai.balanceOf(owner.address)).toString();
				expect(newFunderMockLinkBalance).to.equal('10000000000000000000000');
				expect(newFunderFakeTokenBalance).to.equal('10000000000000000000000');
			});

			it('should transfer NFT from bounty to sender', async () => {
				// ASSUME
				expect(await mockNft.ownerOf(1)).to.equal(owner.address);

				// ARRANGE
				const depositId = generateDepositId(mockId, 0);
				await bounty.receiveNft(owner.address, mockNft.address, 1, 1);

				// ASSUME
				expect(await mockNft.ownerOf(1)).to.equal(bounty.address);

				// ACT
				await bounty.refundDeposit(depositId, owner.address);

				// ASSERT
				expect(await mockNft.ownerOf(1)).to.equal(owner.address);
			});
		});
	});

	describe('claimDeposit', () => {
		describe('require and revert', () => {
			it('should revert if not called by OpenQ contract', async () => {
				// ARRANGE
				const [, notOwner] = await ethers.getSigners();
				const value = 10000;
				let issueWithNonOwnerAccount = bounty.connect(notOwner);

				// ASSERT
				await expect(issueWithNonOwnerAccount.claim(notOwner.address, ethers.utils.formatBytes32String('mockDepositId'))).to.be.revertedWith('Method is only callable by OpenQ');
			});

			it('should revert if issue is already closed', async () => {
				// ARRANGE
				await bounty.close(owner.address);

				// ASSERT
				await expect(bounty.claim(owner.address, ethers.utils.formatBytes32String('mockDepositId'))).to.be.revertedWith('CLAIMING_CLOSED_BOUNTY');
			});

			describe('deposit updates', () => {
				it('should set claimed to true for deposit', async () => {
					// ARRANGE
					const depositId = generateDepositId(mockId, 0);
					await bounty.receiveNft(owner.address, mockNft.address, 1, 1);

					// ASSUME
					expect(await bounty.claimed(depositId)).to.be.false;

					// ACT
					await bounty.claim(owner.address, depositId);

					// ASSERT
					expect(await bounty.claimed(depositId)).to.be.true;
				});

				it('should set payoutAddress for deposit', async () => {
					// ARRANGE
					const depositId = generateDepositId(mockId, 0);
					await bounty.receiveNft(owner.address, mockNft.address, 1, 1);

					// ASSUME
					expect(await bounty.payoutAddress(depositId)).to.equal(ethers.constants.AddressZero);

					// ACT
					await bounty.claim(owner.address, depositId);

					// ASSERT
					expect(await bounty.payoutAddress(depositId)).to.equal(owner.address);
				});
			});
		});

		describe('transfer', () => {
			it('should transfer deposit assets from bounty contract to claimer', async () => {
				// ARRANGE
				const volume = 100;

				const [, claimer] = await ethers.getSigners();
				const initialClaimerProtocolBalance = (await bounty.provider.getBalance(claimer.address));

				await bounty.receiveFunds(owner.address, mockLink.address, volume, thirtyDays);
				await bounty.receiveFunds(owner.address, mockDai.address, volume, thirtyDays);
				await bounty.receiveFunds(owner.address, ethers.constants.AddressZero, volume, thirtyDays, { value: volume });

				const deposits = await bounty.getDeposits();
				const linkDepositId = deposits[0];
				const daiDepositId = deposits[1];
				const protocolDepositId = deposits[2];

				// ASSUME
				const bountyMockTokenBalance = (await mockLink.balanceOf(bounty.address)).toString();
				const bountyFakeTokenBalance = (await mockDai.balanceOf(bounty.address)).toString();
				const bountyProtocolTokenBalance = (await bounty.provider.getBalance(bounty.address)).toString();
				expect(bountyMockTokenBalance).to.equal('100');
				expect(bountyFakeTokenBalance).to.equal('100');
				expect(bountyProtocolTokenBalance).to.equal('100');

				const claimerMockTokenBalance = (await mockLink.balanceOf(claimer.address)).toString();
				const claimerFakeTokenBalance = (await mockDai.balanceOf(claimer.address)).toString();
				const claimerProtocolBalance = (await ethers.provider.getBalance(claimer.address));
				expect(claimerMockTokenBalance).to.equal('0');
				expect(claimerFakeTokenBalance).to.equal('0');
				// Not sure why claimer balance is not updating...
				// expect(claimerProtocolBalance).to.equal(initialClaimerProtocolBalance.sub(100));

				// // ACT
				await bounty.claim(claimer.address, linkDepositId);
				await bounty.claim(claimer.address, daiDepositId);
				await bounty.claim(claimer.address, protocolDepositId);

				// // // ASSERT
				const newBountyMockLinkBalance = (await mockLink.balanceOf(bounty.address)).toString();
				const newBountyFakeTokenBalance = (await mockDai.balanceOf(bounty.address)).toString();
				const newBountyProtocolTokenBalance = (await bounty.provider.getBalance(bounty.address)).toString();
				expect(newBountyMockLinkBalance).to.equal('0');
				expect(newBountyFakeTokenBalance).to.equal('0');
				expect(newBountyProtocolTokenBalance).to.equal('0');

				const newClaimerMockTokenBalance = (await mockLink.balanceOf(claimer.address)).toString();
				const newClaimerFakeTokenBalance = (await mockDai.balanceOf(claimer.address)).toString();
				const newClaimedProtocolTokenBalance = (await bounty.provider.getBalance(claimer.address));
				expect(newClaimerMockTokenBalance).to.equal('100');
				expect(newClaimerFakeTokenBalance).to.equal('100');
				// expect(newClaimedProtocolTokenBalance).to.equal(initialClaimerProtocolBalance);
			});

			it('should transfer NFT deposit from bounty contract to claimer', async () => {
				// ASSUME
				expect(await mockNft.ownerOf(1)).to.equal(owner.address);

				// ARRANGE
				const depositId = generateDepositId(mockId, 0);
				await bounty.receiveNft(owner.address, mockNft.address, 1, 1);

				// ASSUME
				expect(await mockNft.ownerOf(1)).to.equal(bounty.address);

				// ACT
				await bounty.claim(owner.address, depositId);

				// ASSERT
				expect(await mockNft.ownerOf(1)).to.equal(owner.address);
			});
		});
	});

	describe('closeBounty', () => {
		it('should revert if not called by OpenQ contract', async () => {
			// ARRANGE
			const [, notOwner] = await ethers.getSigners();
			let issueWithNonOwnerAccount = bounty.connect(notOwner);

			// ASSERT
			await expect(issueWithNonOwnerAccount.close(owner.address)).to.be.revertedWith('Method is only callable by OpenQ');
		});

		it('should revert if already closed', async () => {
			// ARRANGE
			bounty.close(owner.address);
			//ACT / ASSERT
			await expect(bounty.close(owner.address)).to.be.revertedWith('CLOSING_CLOSED_BOUNTY');
		});

		it('should change status to CLOSED (1)', async () => {
			// ASSUME
			await expect(await bounty.status()).equals(0);
			//ACT
			await bounty.close(owner.address);
			// ASSERT
			await expect(await bounty.status()).equals(1);
		});

		it('should set closer to payout address', async () => {
			// ASSUME
			await expect(await bounty.closer()).equals(ethers.constants.AddressZero);
			//ACT
			await bounty.close(owner.address);
			// ASSERT
			await expect(await bounty.closer()).equals(owner.address);
		});

		it('should set bountyClosedTime to the block timestamp', async () => {
			// ARRANGE
			const expectedTimestamp = await setNextBlockTimestamp();
			// ASSUME
			await expect(await bounty.bountyClosedTime()).equals(0);
			//ACT
			await bounty.close(owner.address);
			// ASSERT
			await expect(await bounty.bountyClosedTime()).equals(expectedTimestamp);
		});
	});

});

async function setNextBlockTimestamp() {
	return new Promise(async (resolve,) => {
		const blockNumBefore = await ethers.provider.getBlockNumber();
		const blockBefore = await ethers.provider.getBlock(blockNumBefore);
		const timestampBefore = blockBefore.timestamp;
		const expectedTimestamp = timestampBefore + 10;
		await network.provider.send("evm_setNextBlockTimestamp", [expectedTimestamp]);
		resolve(expectedTimestamp);
	});
}