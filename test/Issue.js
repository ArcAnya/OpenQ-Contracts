/* eslint-disable */
const { BigNumber } = require('@ethersproject/bignumber');
const { expect } = require('chai');
require('@nomiclabs/hardhat-waffle');
const truffleAssert = require('truffle-assertions');

describe('Issue.sol receiveFunds', () => {
	let issue;

	beforeEach(async () => {
		const Issue = await hre.ethers.getContractFactory('Issue');

		const [owner] = await ethers.getSigners();

		issue = await Issue.deploy("mockId", owner.address);
		await issue.deployed();
	});

	it('should revert if not called by owner', async () => {
		// ARRANGE
		const [owner, notOwner] = await ethers.getSigners();

		const funder = notOwner.address;
		const tokenAddress = "0x514910771af9ca656af840dff83e8264ecf986ca";
		const value = 10000;

		let issueWithNonOwnerAccount = issue.connect(notOwner);

		// ASSERT
		await expect(issueWithNonOwnerAccount.receiveFunds(funder, tokenAddress, value)).to.be.revertedWith('Ownable: caller is not the owner');
	});

	it('should revert if no value is sent', async () => {
		// ARRANGE
		const [owner, notOwner] = await ethers.getSigners();

		const funder = notOwner.address;
		const tokenAddress = "0x514910771af9ca656af840dff83e8264ecf986ca";
		const value = 0;

		// ASSERT
		await expect(issue.receiveFunds(funder, tokenAddress, value)).to.be.revertedWith('Must send some value');
	});

	it('should set isAFunder to true for the deposit sender', async () => {
		// ARRANGE
		const [owner] = await ethers.getSigners();
		const funder = owner.address;
		const tokenAddress = "0x514910771af9ca656af840dff83e8264ecf986ca";
		const value = 10000;

		// ASSUME
		const isNotAFunder = await issue.isAFunder(funder);
		expect(isNotAFunder).to.be.false;

		// ACT
		await issue.receiveFunds(funder, tokenAddress, value);

		// ASSERT
		const isAFunderNow = await issue.isAFunder(funder);
		expect(isAFunderNow).to.be.true;
	});

	it.only('should add that token address to tokenAddresses if its a new address', async () => {
		// ARRANGE
		const [owner] = await ethers.getSigners();
		const funder = owner.address;
		const tokenAddress = "0x514910771AF9Ca656af840dff83E8264EcF986CA";
		const value = 10000;

		// ASSUME
		const zeroLength = await issue.getIssuesTokenAddresses();
		expect(zeroLength.length).to.equal(0);

		// ACT
		await issue.receiveFunds(funder, tokenAddress, value);

		// ASSERT
		const newTokenAddress = await issue.tokenAddresses(0);
		expect(newTokenAddress).to.equal(tokenAddress);
	});
});