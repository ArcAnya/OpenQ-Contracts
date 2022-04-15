/* eslint-disable */
require('@nomiclabs/hardhat-waffle');
const { BigNumber } = require('@ethersproject/bignumber');
const { expect } = require('chai');
const truffleAssert = require('truffle-assertions');
const { ethers, upgrades } = require("hardhat");

describe('OpenQTokenWhitelist.sol', () => {
	let owner;
	let notOwner;
	let mockLink;
	let mockDai;
	let openQTokenWhitelist;

	beforeEach(async () => {
		const MockLink = await ethers.getContractFactory('MockLink');
		const MockDai = await ethers.getContractFactory('MockDai');
		const OpenQTokenWhitelist = await ethers.getContractFactory('OpenQTokenWhitelist');

		[owner, notOwner] = await ethers.getSigners();

		openQTokenWhitelist = await OpenQTokenWhitelist.deploy(2);
		await openQTokenWhitelist.deployed();

		mockLink = await MockLink.deploy();
		await mockLink.deployed();

		mockDai = await MockDai.deploy();
		await mockDai.deployed();
	});

	describe('OpenQTokenWhitelist methods', () => {
		it('initializes', async () => {
			const totalTokenAddresses = await openQTokenWhitelist.TOKEN_ADDRESS_LIMIT();
			expect(totalTokenAddresses).to.equal(2);
		});

		it('can add token', async () => {
			// ASSUME
			let mockLinkWhitelist = await openQTokenWhitelist.isWhitelisted(mockLink.address);
			expect(mockLinkWhitelist).to.equal(false);

			// ACT
			await openQTokenWhitelist.addToken(mockLink.address);

			// ASSERT
			mockLinkWhitelist = await openQTokenWhitelist.isWhitelisted(mockLink.address);
			expect(mockLinkWhitelist).to.equal(true);
		});

		it('can remove token', async () => {
			// ASSUME
			let mockLinkWhitelist = await openQTokenWhitelist.isWhitelisted(mockLink.address);
			expect(mockLinkWhitelist).to.equal(false);

			// ACT
			await openQTokenWhitelist.addToken(mockLink.address);

			// ASSERT
			mockLinkWhitelist = await openQTokenWhitelist.isWhitelisted(mockLink.address);
			expect(mockLinkWhitelist).to.equal(true);

			// ACT
			await openQTokenWhitelist.removeToken(mockLink.address);

			// ASSERT
			mockLinkWhitelist = await openQTokenWhitelist.isWhitelisted(mockLink.address);
			expect(mockLinkWhitelist).to.equal(false);
		});

		it('updates token count on add and remove', async () => {
			// ASSUME
			let tokenCount = await openQTokenWhitelist.tokenCount();
			expect(tokenCount).to.equal(0);

			// ACT
			await openQTokenWhitelist.addToken(mockLink.address);

			// ASSERT
			tokenCount = await openQTokenWhitelist.tokenCount();
			expect(tokenCount).to.equal(1);

			// ACT
			await openQTokenWhitelist.removeToken(mockLink.address);

			// ASSERT
			tokenCount = await openQTokenWhitelist.tokenCount();
			expect(tokenCount).to.equal(0);
		});

		it('reverts if above token limit', async () => {
			// ACT
			await openQTokenWhitelist.addToken(mockLink.address);
			await openQTokenWhitelist.addToken(mockDai.address);

			// ASSERT
			expect(openQTokenWhitelist.addToken(mockDai.address)).to.be.revertedWith('TOO_MANY_TOKEN_ADDRESSES');
		});

		it('increases token address limit', async () => {
			// ASSUME
			let tokenAddressLimit = await openQTokenWhitelist.TOKEN_ADDRESS_LIMIT();
			expect(tokenAddressLimit).to.equal(2);

			// ACT
			await openQTokenWhitelist.setTokenAddressLimit(5);

			// ASSERT
			tokenAddressLimit = await openQTokenWhitelist.TOKEN_ADDRESS_LIMIT();
			expect(tokenAddressLimit).to.equal(5);
		});
	});
});