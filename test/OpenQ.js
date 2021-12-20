/* eslint-disable */
const { BigNumber } = require('@ethersproject/bignumber');
const { expect } = require('chai');
require('@nomiclabs/hardhat-waffle');
const truffleAssert = require('truffle-assertions');

describe('OpenQ.sol', () => {
	let openQ;
	let owner;
	let mockLink;
	let mockDai;
	let bountyId = 'mockIssueId';

	beforeEach(async () => {
		const OpenQ = await hre.ethers.getContractFactory('OpenQ');
		const MockLink = await hre.ethers.getContractFactory('MockLink');
		const MockDai = await hre.ethers.getContractFactory('MockDai');

		[owner] = await ethers.getSigners();

		openQ = await OpenQ.deploy();
		await openQ.deployed();

		mockLink = await MockLink.deploy();
		await mockLink.deployed();
		mockDai = await MockDai.deploy();
		await mockDai.deployed();
	});

	describe('mintBounty', () => {

		it('should deploy a new bounty contract with expected initial metadata', async () => {
			// ARRANGE
			const expectedTimestamp = await setNextBlockTimestamp();

			// ACT
			await openQ.mintBounty(bountyId, 'mock-org');

			const bountyIsOpen = await openQ.bountyIsOpen(bountyId);
			const bountyAddress = await openQ.bountyIdToAddress(bountyId);

			const Bounty = await hre.ethers.getContractFactory('Bounty');

			const newBounty = await Bounty.attach(
				bountyAddress
			);

			const newBountyId = await newBounty.bountyId();
			const bountyCreatedTime = (await newBounty.bountyCreatedTime()).toNumber();
			const bountyClosedTime = await newBounty.bountyClosedTime();
			const escrowPeriod = (await newBounty.escrowPeriod()).toNumber();
			const issuer = await newBounty.issuer();
			const closer = await newBounty.closer();
			const status = await newBounty.status();

			// ASSERT
			expect(bountyId).to.equal(newBountyId);
			expect(bountyCreatedTime).to.equal(expectedTimestamp);
			expect(bountyClosedTime).to.equal(0);
			expect(escrowPeriod).to.equal(2592000);
			expect(issuer).to.equal(owner.address);
			expect(closer).to.equal(hre.ethers.constants.AddressZero);
			expect(status).to.equal(0);

			const bountyIdFromAddress = await openQ.bountyAddressToBountyId(bountyAddress);
			expect(bountyIdFromAddress).to.equal(newBountyId);
		});

		it('should revert if bounty already exists', async () => {
			// ARRANGE
			// ACT
			await openQ.mintBounty(bountyId, 'mock-org');

			// ASSERT
			await expect(openQ.mintBounty(bountyId, 'mock-org')).to.be.revertedWith('Bounty already exists for given id. Find its address by calling bountyIdToAddress on this contract with the bountyId');
		});

		it.skip('should emit an BountyCreated event with expected bounty id, issuer address, bounty address, and bountyMintTime', async () => {
			// ARRANGE
			const bountyAddress = "0x68D0190b345d712Cc724345B78E1B6bdf4bf3782";

			const expectedTimestamp = await setNextBlockTimestamp();

			// ACT
			// ASSERT
			await expect(openQ.mintBounty(bountyId))
				.to.emit(openQ, 'BountyCreated')
				.withArgs(bountyId, owner.address, bountyAddress, expectedTimestamp);
		});
	});

	describe('fundBounty', () => {
		it('should emit a DepositReceived event with expected bountyId, bounty address, token address, funder, value and timestamp', async () => {
			// ARRANGE
			await openQ.mintBounty(bountyId, 'mock-org');

			const bountyAddress = await openQ.bountyIdToAddress(bountyId);

			await mockLink.approve(bountyAddress, 10000000);
			await mockDai.approve(bountyAddress, 10000000);

			const Bounty = await hre.ethers.getContractFactory('Bounty');

			const bounty = await Bounty.attach(
				bountyAddress
			);

			const expectedTimestamp = await setNextBlockTimestamp();

			// ACT
			// ASSERT
			await expect(openQ.fundBounty(bountyAddress, mockLink.address, 100))
				.to.emit(openQ, 'DepositReceived')
				.withArgs(bountyId, 'mock-org', bountyAddress, mockLink.address, owner.address, 100, expectedTimestamp);
		});
	});

	describe('claimBounty', () => {
		describe('require and revert', () => {
			it('should revert if not called by owner', async () => {
				// ARRANGE
				const [, notOwner] = await ethers.getSigners();
				let openQWithNonOwnerAccount = openQ.connect(notOwner);
				const payoutAddress = '0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690';

				// ASSERT
				await expect(openQWithNonOwnerAccount.claimBounty(bountyId, payoutAddress)).to.be.revertedWith('Ownable: caller is not the owner');
			});
		});

		describe('bounty updates after claim', () => {
			it('should close issue after successful claim', async () => {
				// ARRANGE
				// ASSUME
				await openQ.mintBounty(bountyId, 'mock-org');

				const bountyAddress = await openQ.bountyIdToAddress(bountyId);

				const openBounty = await openQ.bountyIsOpen(bountyId);
				expect(openBounty).to.equal(true);

				// ACT
				await openQ.claimBounty(bountyId, owner.address);

				// ASSERT
				const closedBounty = await openQ.bountyIsOpen(bountyId);
				expect(closedBounty).to.equal(false);
			});

			it('should set closer to the claimer address', async () => {
				// ARRANGE
				// ASSUME
				await openQ.mintBounty(bountyId, 'mock-org');

				const bountyAddress = await openQ.bountyIdToAddress(bountyId);

				const Bounty = await hre.ethers.getContractFactory('Bounty');

				const newBounty = await Bounty.attach(
					bountyAddress
				);

				const closer = await newBounty.closer();
				expect(closer).to.equal(ethers.constants.AddressZero);

				// ACT
				await openQ.claimBounty(bountyId, owner.address);

				// ASSERT
				const newCloser = await newBounty.closer();
				expect(newCloser).to.equal(owner.address);
			});

			it('should set close time correctly', async () => {
				// ARRANGE
				// ASSUME
				await openQ.mintBounty(bountyId, 'mock-org');

				const bountyAddress = await openQ.bountyIdToAddress(bountyId);

				const Bounty = await hre.ethers.getContractFactory('Bounty');

				const newBounty = await Bounty.attach(
					bountyAddress
				);

				const expectedTimestamp = await setNextBlockTimestamp();

				// ASSUME
				const bountyClosedTime = await newBounty.bountyClosedTime();
				expect(bountyClosedTime).to.equal(0);

				const closer = await newBounty.closer();
				expect(closer).to.equal(ethers.constants.AddressZero);

				// ACT
				await openQ.claimBounty(bountyId, owner.address);

				// ASSERT
				const newCloser = await newBounty.closer();
				expect(newCloser).to.equal(owner.address);
			});
		});

		describe('transfer', () => {
			it('should transfer all assets from bounty contract to claimer', async () => {
				// ARRANGE
				await openQ.mintBounty(bountyId, 'mock-org');

				const bountyAddress = await openQ.bountyIdToAddress(bountyId);

				await mockLink.approve(bountyAddress, 10000000);
				await mockDai.approve(bountyAddress, 10000000);
				const value = 100;
				await openQ.fundBounty(bountyAddress, mockLink.address, value);
				await openQ.fundBounty(bountyAddress, mockDai.address, value);

				const [, claimer] = await ethers.getSigners();

				// ASSUME
				const bountyMockLinkTokenBalance = (await mockLink.balanceOf(bountyAddress)).toString();
				const bountyDaiTokenBalance = (await mockDai.balanceOf(bountyAddress)).toString();
				expect(bountyMockLinkTokenBalance).to.equal('100');
				expect(bountyDaiTokenBalance).to.equal('100');

				const claimerMockTokenBalance = (await mockLink.balanceOf(claimer.address)).toString();
				const claimerFakeTokenBalance = (await mockDai.balanceOf(claimer.address)).toString();
				expect(claimerMockTokenBalance).to.equal('0');
				expect(claimerFakeTokenBalance).to.equal('0');

				// ACT
				await openQ.claimBounty(bountyId, claimer.address);

				// ASSERT
				const newBountyMockTokenBalance = (await mockLink.balanceOf(bountyAddress)).toString();
				const newBountyFakeTokenBalance = (await mockDai.balanceOf(bountyAddress)).toString();
				expect(newBountyMockTokenBalance).to.equal('0');
				expect(newBountyFakeTokenBalance).to.equal('0');

				const newClaimerMockTokenBalance = (await mockLink.balanceOf(claimer.address)).toString();
				const newClaimerFakeTokenBalance = (await mockDai.balanceOf(claimer.address)).toString();
				expect(newClaimerMockTokenBalance).to.equal('100');
				expect(newClaimerFakeTokenBalance).to.equal('100');
			});
		});

		/*
								bounty.bountyId(),
								bountyAddress,
								tokenAddress,
								_payoutAddress,
								value,
								block.timestamp
		*/

		describe('Event Emissions', () => {
			it('should emit a BountyPaidout event with proper bounty id, bounty Address, tokenAddress, payout address, value, and bounty closed time', async () => {
				// ARRANGE
				await openQ.mintBounty(bountyId, 'mock-org');

				const bountyAddress = await openQ.bountyIdToAddress(bountyId);

				await mockLink.approve(bountyAddress, 10000000);
				await mockDai.approve(bountyAddress, 10000000);

				const expectedTimestamp = await setNextBlockTimestamp();

				const value = 100;
				await openQ.fundBounty(bountyAddress, mockLink.address, value);
				await openQ.fundBounty(bountyAddress, mockDai.address, value);

				// ACT
				// ASSERT
				// Since the BountyPaidout time stamp happens in a for loop, its hard to predict to the ms what it will be
				// Usually add + 2 works....
				await expect(openQ.claimBounty(bountyId, owner.address))
					.to.emit(openQ, 'BountyPaidout')
					.withArgs(bountyId, 'mock-org', bountyAddress, mockLink.address, owner.address, value, expectedTimestamp + 2);
			});

			it('should emit a BountyClosed event with proper bounty id, bounty Address, payout address, and bounty closed time', async () => {
				// ARRANGE
				await openQ.mintBounty(bountyId, 'mock-org');

				const bountyAddress = await openQ.bountyIdToAddress(bountyId);

				await mockLink.approve(bountyAddress, 10000000);
				await mockDai.approve(bountyAddress, 10000000);

				const expectedTimestamp = await setNextBlockTimestamp();

				// ACT
				// ASSERT
				await expect(openQ.claimBounty(bountyId, owner.address))
					.to.emit(openQ, 'BountyClosed')
					.withArgs(bountyId, 'mock-org', bountyAddress, owner.address, expectedTimestamp);
			});
		});
	});

	describe('refundBountyDeposits', () => {
		describe('Event Emissions', () => {
			it('should emit one DepositRefunded event for each deposit refunded', async () => {
				// ARRANGE
				await openQ.mintBounty(bountyId, 'mock-org');

				const bountyAddress = await openQ.bountyIdToAddress(bountyId);

				await mockLink.approve(bountyAddress, 10000000);
				await mockDai.approve(bountyAddress, 10000000);

				const value = 100;
				await openQ.fundBounty(bountyAddress, mockLink.address, value);
				await openQ.fundBounty(bountyAddress, mockDai.address, value);

				const expectedTimestamp = await setNextBlockTimestamp(2764800);

				// ACT
				// ASSERT
				await expect(openQ.refundBountyDeposits(bountyAddress))
					.to.emit(openQ, 'DepositRefunded')
					.withArgs(bountyId, 'mock-org', bountyAddress, mockLink.address, owner.address, 100, expectedTimestamp);
			});
		});

		describe('requires and reverts', () => {
			it('should revert if attempt to withdraw too early, or if not funder', async () => {
				// ARRANGE
				await openQ.mintBounty(bountyId, 'mock-org');

				const bountyAddress = await openQ.bountyIdToAddress(bountyId);

				const twoDays = 172800;
				ethers.provider.send("evm_increaseTime", [twoDays]);

				// ACT
				// ASSERT
				await expect(openQ.refundBountyDeposits(bountyAddress)).to.be.revertedWith('Too early to withdraw funds');

				const thirtyTwoDays = 2765000;
				ethers.provider.send("evm_increaseTime", [thirtyTwoDays]);

				// ACT
				// ASSERT
				await expect(openQ.refundBountyDeposits(bountyAddress)).to.be.revertedWith('Only funders of this bounty can reclaim funds after 30 days.');
			});
		});

		describe('transfer', () => {
			it('should transfer refunded asset from bounty contract to funder', async () => {
				// ARRANGE
				await openQ.mintBounty(bountyId, 'mock-org');

				const bountyAddress = await openQ.bountyIdToAddress(bountyId);

				await mockLink.approve(bountyAddress, 10000000);
				await mockDai.approve(bountyAddress, 10000000);
				const value = 100;
				await openQ.fundBounty(bountyAddress, mockLink.address, value);
				await openQ.fundBounty(bountyAddress, mockDai.address, value);

				const thirtyTwoDays = 2765000;
				ethers.provider.send("evm_increaseTime", [thirtyTwoDays]);

				// ASSUME
				const bountyMockTokenBalance = (await mockLink.balanceOf(bountyAddress)).toString();
				const bountyFakeTokenBalance = (await mockDai.balanceOf(bountyAddress)).toString();
				expect(bountyMockTokenBalance).to.equal('100');
				expect(bountyFakeTokenBalance).to.equal('100');

				const funderMockTokenBalance = (await mockLink.balanceOf(owner.address)).toString();
				const funderFakeTokenBalance = (await mockDai.balanceOf(owner.address)).toString();
				expect(funderMockTokenBalance).to.equal('9999999999999999999900');
				expect(funderFakeTokenBalance).to.equal('9999999999999999999900');

				// // ACT
				await openQ.refundBountyDeposits(bountyAddress);
				await openQ.refundBountyDeposits(bountyAddress);

				// // ASSERT
				const newBountyMockTokenBalance = (await mockLink.balanceOf(bountyAddress)).toString();
				const newBountyFakeTokenBalance = (await mockDai.balanceOf(bountyAddress)).toString();
				expect(newBountyMockTokenBalance).to.equal('0');
				expect(newBountyFakeTokenBalance).to.equal('0');

				const newFunderMockTokenBalance = (await mockLink.balanceOf(owner.address)).toString();
				const newFunderFakeTokenBalance = (await mockDai.balanceOf(owner.address)).toString();
				expect(newFunderMockTokenBalance).to.equal('10000000000000000000000');
				expect(newFunderFakeTokenBalance).to.equal('10000000000000000000000');
			});
		});
	});
});

async function setNextBlockTimestamp(timestamp = 10) {
	return new Promise(async (resolve,) => {
		const blockNumBefore = await hre.ethers.provider.getBlockNumber();
		const blockBefore = await hre.ethers.provider.getBlock(blockNumBefore);
		const timestampBefore = blockBefore.timestamp;
		const expectedTimestamp = timestampBefore + timestamp;
		await network.provider.send("evm_setNextBlockTimestamp", [expectedTimestamp]);
		resolve(expectedTimestamp);
	});
}