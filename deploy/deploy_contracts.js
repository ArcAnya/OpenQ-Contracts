const { ethers, upgrades } = require("hardhat");
const fs = require('fs');
const { optionalSleep } = require('./utils');

async function deployContracts() {
	console.log('\n------------------------------------------');
	console.log('DEPLOY CONTRACTS');
	console.log('------------------------------------------');

	console.log('Deploying MockLink...');
	const MockLink = await ethers.getContractFactory('MockLink');
	const mockLink = await MockLink.deploy();
	await mockLink.deployed();
	await optionalSleep(10000);
	console.log(`MockLink Deployed to ${mockLink.address}\n`);

	console.log('Deploying MockDai...');
	const MockDai = await ethers.getContractFactory('MockDai');
	const mockDai = await MockDai.deploy();
	await mockDai.deployed();
	await optionalSleep(10000);
	console.log(`MockDai Deployed to ${mockDai.address}\n`);

	console.log('Deploying OpenQV0...');
	const OpenQ = await ethers.getContractFactory('OpenQV0');
	const openQ = await upgrades.deployProxy(OpenQ, [], { kind: 'uups' });
	await openQ.deployed();
	await optionalSleep(10000);
	console.log(`OpenQV0 Deployed to ${openQ.address}\n`);

	console.log('Deploying OpenQStorage...');
	const OpenQStorage = await ethers.getContractFactory('OpenQStorage');
	const openQStorage = await OpenQStorage.deploy();
	await openQStorage.deployed();
	await optionalSleep(10000);
	console.log(`OpenQStorage Deployed to ${openQStorage.address}\n`);

	console.log('Deploying BountyFactory...');
	const BountyFactory = await ethers.getContractFactory('BountyFactory');
	const bountyFactory = await BountyFactory.deploy();
	await bountyFactory.deployed();
	await optionalSleep(10000);
	console.log(`BountyFactory Deployed to ${bountyFactory.address}\n`);

	console.log(`MockLink deployed to: ${mockLink.address}`);
	console.log(`MockDai deployed to: ${mockDai.address}`);
	console.log(`OpenQV0 deployed to: ${openQ.address}`);
	console.log(`OpenQStorage deployed to: ${openQStorage.address}`);
	console.log(`BountyFactory deployed to: ${bountyFactory.address}`);

	console.log('\nConfiguring OpenQProxy with OpenQStorage...');
	console.log(`Setting OpenQStorage on OpenQProxy to ${openQStorage.address}...`);
	await openQ.setOpenQStorage(openQStorage.address);
	await optionalSleep(10000);
	console.log(`OpenQStorage successfully set on OpenQProxy to ${openQStorage.address}`);

	console.log('\nConfiguring OpenQProxy with BountyFactory...');
	console.log(`Setting BountyFactory on OpenQProxy to ${bountyFactory.address}...`);
	await openQ.setBountyFactory(bountyFactory.address);
	await optionalSleep(10000);
	console.log(`BountyFactory successfully set on OpenQProxy to ${bountyFactory.address}`);

	console.log('\nContracts deployed and configured successfully!');

	// Write contract addresses to .env.contracts file for use in OpenQ-Frontend and OpenQ-Oracle
	const addresses = `OPENQ_ADDRESS="${openQ.address}"
MOCK_DAI_TOKEN_ADDRESS="${mockDai.address}"
MOCK_LINK_TOKEN_ADDRESS="${mockLink.address}"`;

	fs.writeFileSync('.env.contracts', addresses);
}

async function main() {
	await deployContracts();
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});

module.exports = deployContracts;