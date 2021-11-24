/* eslint-disable */
const { BigNumber } = require('@ethersproject/bignumber');
const { expect } = require('chai');
require('@nomiclabs/hardhat-waffle');
const truffleAssert = require('truffle-assertions');

describe('Bounty.sol', () => {
	let bounty;
	let mockToken;
	let fakeToken;
	let owner;

	beforeEach(async () => {
		const Bounty = await hre.ethers.getContractFactory('Bounty');
		const MockToken = await hre.ethers.getContractFactory('MockToken');
		const FakeToken = await hre.ethers.getContractFactory('FakeToken');

		[owner] = await ethers.getSigners();

		bounty = await Bounty.deploy("mockId", owner.address);
		await bounty.deployed();

		mockToken = await MockToken.deploy();
		await mockToken.deployed();
		fakeToken = await FakeToken.deploy();
		await fakeToken.deployed();

		await mockToken.approve(bounty.address, 10000000);
		await fakeToken.approve(bounty.address, 10000000);
	});

	describe('receiveFunds', () => {

		describe('require and revert', () => {
			it('should revert if not called by owner', async () => {
				// ARRANGE
				const [, notOwner] = await ethers.getSigners();

				const value = 10000;

				let issueWithNonOwnerAccount = bounty.connect(notOwner);

				// ASSERT
				await expect(issueWithNonOwnerAccount.receiveFunds(notOwner.address, mockToken.address, value)).to.be.revertedWith('Ownable: caller is not the owner');
			});

			it('should revert if no value is sent', async () => {
				// ARRANGE
				const [, notOwner] = await ethers.getSigners();
				const value = 0;

				// ASSERT
				await expect(bounty.receiveFunds(owner.address, mockToken.address, value)).to.be.revertedWith('Must send some value');
			});

			it('should revert if funder tries to send more than allowance', async () => {
				// ARRANGE
				// ACT
				// ASSERT
				const greaterThanAllowance = 100000000;
				await expect(bounty.receiveFunds(owner.address, mockToken.address, greaterThanAllowance)).to.be.revertedWith('TransferHelper::transferFrom: transferFrom failed');
			});
		});

		describe('isAFunder', () => {
			it('should set isAFunder to true for the deposit sender', async () => {
				// ARRANGE
				const value = 10000;

				// ASSUME
				const isNotAFunder = await bounty.isAFunder(owner.address);
				expect(isNotAFunder).to.be.false;

				// ACT
				await bounty.receiveFunds(owner.address, mockToken.address, value);

				// ASSERT
				const isAFunderNow = await bounty.isAFunder(owner.address);
				expect(isAFunderNow).to.be.true;
			});
		});

		describe('bountyTokenAddresses', () => {
			it('should add that token address to tokenAddresses if its a new address', async () => {
				// ARRANGE
				const value = 10000;

				// ASSUME
				const zeroLength = await bounty.getBountyTokenAddresses();
				expect(zeroLength.length).to.equal(0);

				// ACT
				await bounty.receiveFunds(owner.address, mockToken.address, value);

				// ASSERT
				const newTokenAddress = await bounty.bountyTokenAddresses(0);
				expect(newTokenAddress).to.equal(mockToken.address);
			});

			it('should NOT add that token address to tokenAddresses if it is already there', async () => {
				// ARRANGE
				const [owner] = await ethers.getSigners();
				const value = 10000;

				// ASSUME
				const zeroLength = await bounty.getBountyTokenAddresses();
				expect(zeroLength.length).to.equal(0);

				// ACT
				await bounty.receiveFunds(owner.address, mockToken.address, value);
				await bounty.receiveFunds(owner.address, mockToken.address, value);

				// ASSERT
				const newTokenAddress = await bounty.bountyTokenAddresses(0);
				expect(newTokenAddress).to.equal(mockToken.address);

				const tokenAddresses = await bounty.getBountyTokenAddresses();
				expect(tokenAddresses.length).to.equal(1);
			});
		});

		describe('funderTokenAddresses', () => {
			it('should add that token address to fundersTokenAddresses if its a new address', async () => {
				// ARRANGE
				const value = 10000;

				// ASSUME
				const zeroLength = await bounty.getFunderTokenAddresses(owner.address);
				expect(zeroLength.length).to.equal(0);

				// ACT
				await bounty.receiveFunds(owner.address, mockToken.address, value);

				// ASSERT
				const fundersTokenAddress = await bounty.getFunderTokenAddresses(owner.address);
				expect(fundersTokenAddress[0]).to.equal(mockToken.address);
			});

			it('should NOT add that token address to fundersTokenAddresses if its NOT a new address', async () => {
				// ARRANGE
				const value = 10000;

				// ASSUME
				const zeroLength = await bounty.getFunderTokenAddresses(owner.address);
				expect(zeroLength.length).to.equal(0);

				// ACT
				await bounty.receiveFunds(owner.address, mockToken.address, value);

				// ASSERT
				const fundersTokenAddress = await bounty.getFunderTokenAddresses(owner.address);
				expect(fundersTokenAddress[0]).to.equal(mockToken.address);

				// ACT
				await bounty.receiveFunds(owner.address, mockToken.address, value);

				// ASSERT
				const fundersTokenNewAddress = await bounty.getFunderTokenAddresses(owner.address);
				expect(fundersTokenNewAddress.length).to.equal(1);
			});
		});

		describe('bountyDeposits', () => {
			it('should increment bountyDeposits by value for that token address', async () => {
				// ARRANGE
				const value = 10000;

				// ASSUME
				const zeroLength = await bounty.getBountyTokenAddresses();
				expect(zeroLength.length).to.equal(0);

				// ACT
				await bounty.receiveFunds(owner.address, mockToken.address, value);

				// ASSERT
				const newValue = await bounty.bountyDeposits(mockToken.address);
				expect(newValue).to.equal(value);

				// ACT
				await bounty.receiveFunds(owner.address, mockToken.address, value);

				// ASSERT
				const newerValue = await bounty.bountyDeposits(mockToken.address);
				expect(newerValue).to.equal(value + value);

				// ACT
				await bounty.receiveFunds(owner.address, fakeToken.address, value);

				// ASSERT
				const newValueOtherToken = await bounty.bountyDeposits(fakeToken.address);
				expect(newValueOtherToken).to.equal(value);

				// ACT
				await bounty.receiveFunds(owner.address, fakeToken.address, value);

				// ASSERT
				const newerValueOtherToken = await bounty.bountyDeposits(fakeToken.address);
				expect(newerValueOtherToken).to.equal(value + value);
			});
		});

		describe('fundersDeposits', () => {
			it('should increment fundersDeposits at tokenAddress by value', async () => {
				// ARRANGE
				const value = 10000;

				// ASSUME
				const zeroValue = (await bounty.funderDeposits(owner.address, mockToken.address)).toNumber();
				expect(zeroValue).to.equal(0);

				// ACT
				await bounty.receiveFunds(owner.address, mockToken.address, value);

				// ASSERT
				const funderDepositsForTokenAddress = (await bounty.funderDeposits(owner.address, mockToken.address)).toNumber();
				expect(funderDepositsForTokenAddress).to.equal(value);

				// ACT
				await bounty.receiveFunds(owner.address, mockToken.address, value);

				// ASSERT
				const funderNewDeposits = (await bounty.funderDeposits(owner.address, mockToken.address)).toNumber();
				expect(funderNewDeposits).to.equal(value + value);

				// ACT
				await bounty.receiveFunds(owner.address, fakeToken.address, value);

				// ASSERT
				const funderNewDepositsOnOtherAddress = (await bounty.funderDeposits(owner.address, fakeToken.address)).toNumber();
				expect(funderNewDepositsOnOtherAddress).to.equal(value);

				// ACT
				await bounty.receiveFunds(owner.address, fakeToken.address, value);

				// ASSERT
				const funderNewDepositsOnOtherAddressNewer = (await bounty.funderDeposits(owner.address, fakeToken.address)).toNumber();
				expect(funderNewDepositsOnOtherAddressNewer).to.equal(value + value);
			});
		});

		describe('transferFrom', () => {
			it('should transfer the resepctive amount from sender to this bounty address for the token address', async () => {
				// ASSUME
				const initialFunderMockTokenBalance = (await fakeToken.balanceOf(owner.address)).toString();
				const initialFunderFakeTokenBalance = (await mockToken.balanceOf(owner.address)).toString();
				expect(initialFunderMockTokenBalance).to.equal('10000000000000000000000');
				expect(initialFunderFakeTokenBalance).to.equal('10000000000000000000000');

				const initialIssueMockTokenBalance = (await mockToken.balanceOf(bounty.address)).toString();
				const initialIssueFakeTokenBalance = (await fakeToken.balanceOf(bounty.address)).toString();
				expect(initialIssueMockTokenBalance).to.equal('0');
				expect(initialIssueFakeTokenBalance).to.equal('0');

				// ARRANGE
				const value = 100;

				// ACT
				await bounty.receiveFunds(owner.address, mockToken.address, value);
				await bounty.receiveFunds(owner.address, fakeToken.address, value);

				// ASSERT
				const funderMockTokenBalance = (await fakeToken.balanceOf(owner.address)).toString();
				const funderFakeTokenBalance = (await mockToken.balanceOf(owner.address)).toString();
				expect(funderMockTokenBalance).to.equal('9999999999999999999900');
				expect(funderFakeTokenBalance).to.equal('9999999999999999999900');

				const bountyMockTokenBalance = (await mockToken.balanceOf(bounty.address)).toString();
				const bountyFakeTokenBalance = (await fakeToken.balanceOf(bounty.address)).toString();
				expect(bountyMockTokenBalance).to.equal('100');
				expect(bountyFakeTokenBalance).to.equal('100');
			});
		});
	});

	describe('claimBounty', () => {
		describe('require and revert', () => {
			it('should revert if not called by owner', async () => {
				// ARRANGE
				const [, notOwner] = await ethers.getSigners();
				const value = 10000;
				let issueWithNonOwnerAccount = bounty.connect(notOwner);

				// ASSERT
				await expect(issueWithNonOwnerAccount.claim(notOwner.address)).to.be.revertedWith('Ownable: caller is not the owner');
			});

			it.skip('should revert if issue is already closed', async () => {
				// ARRANGE
				// ACT
				// ASSERT
			});
		});

		describe('bounty updates after claim', () => {
			it('should close issue after successful claim', async () => {
				// ARRANGE
				// ASSUME
				const openBounty = await bounty.status();
				console.log(openBounty);
				expect(openBounty).to.equal(0);

				// ACT
				await bounty.claim(owner.address);

				// ASSERT
				const closedBounty = await bounty.status();
				expect(closedBounty).to.equal(1);
			});

			it('should set closer to the claimer address', async () => {
				// ARRANGE
				// ASSUME
				const closer = await bounty.closer();
				expect(closer).to.equal(ethers.constants.AddressZero);

				// ACT
				await bounty.claim(owner.address);

				// ASSERT
				const udpatedCloser = await bounty.closer();
				expect(udpatedCloser).to.equal(owner.address);
			});

			it('should set close time correctly', async () => {
				// ARRANGE
				const expectedTimestamp = await setNextBlockTimestamp();

				// ASSUME
				const bountyClosedTime = await bounty.bountyClosedTime();
				expect(bountyClosedTime).to.equal(0);


				// ACT
				await bounty.claim(owner.address);

				// ASSERT
				const updatedBountyClosedTime = await bounty.bountyClosedTime();
				expect(updatedBountyClosedTime).to.equal(expectedTimestamp);
			});
		});

		describe('transfer', () => {
			it('should transfer all assets from bounty contract to claimer', async () => {
				// ARRANGE
				const value = 100;
				await bounty.receiveFunds(owner.address, mockToken.address, value);
				await bounty.receiveFunds(owner.address, fakeToken.address, value);
				const [, claimer] = await ethers.getSigners();

				// ASSUME
				const bountyMockTokenBalance = (await mockToken.balanceOf(bounty.address)).toString();
				const bountyFakeTokenBalance = (await fakeToken.balanceOf(bounty.address)).toString();
				expect(bountyMockTokenBalance).to.equal('100');
				expect(bountyFakeTokenBalance).to.equal('100');

				const claimerMockTokenBalance = (await mockToken.balanceOf(claimer.address)).toString();
				const claimerFakeTokenBalance = (await fakeToken.balanceOf(claimer.address)).toString();
				expect(claimerMockTokenBalance).to.equal('0');
				expect(claimerFakeTokenBalance).to.equal('0');

				// // ACT
				await bounty.claim(claimer.address);

				// // ASSERT
				const newBountyMockTokenBalance = (await mockToken.balanceOf(bounty.address)).toString();
				const newBountyFakeTokenBalance = (await fakeToken.balanceOf(bounty.address)).toString();
				expect(newBountyMockTokenBalance).to.equal('0');
				expect(newBountyFakeTokenBalance).to.equal('0');

				const newClaimerMockTokenBalance = (await mockToken.balanceOf(claimer.address)).toString();
				const newClaimerFakeTokenBalance = (await fakeToken.balanceOf(claimer.address)).toString();
				expect(newClaimerMockTokenBalance).to.equal('100');
				expect(newClaimerFakeTokenBalance).to.equal('100');
			});
		});
	});
});

async function setNextBlockTimestamp() {
	return new Promise(async (resolve,) => {
		const blockNumBefore = await hre.ethers.provider.getBlockNumber();
		const blockBefore = await hre.ethers.provider.getBlock(blockNumBefore);
		const timestampBefore = blockBefore.timestamp;
		const expectedTimestamp = timestampBefore + 10;
		await network.provider.send("evm_setNextBlockTimestamp", [expectedTimestamp]);
		resolve(expectedTimestamp);
	});
}