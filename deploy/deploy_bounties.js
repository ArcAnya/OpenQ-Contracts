const { ethers, network } = require('hardhat');
const { optionalSleep } = require('./utils');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.contracts') });

async function deployBounties() {
	console.log('\n------------------------------------------');
	console.log(`DEPLOYING BOUNTIES to ${network.name.toUpperCase()}`);
	console.log('------------------------------------------');
	const OpenQ = await ethers.getContractFactory('OpenQV1');

	// We fetch the contract factory for the implementation contract (OpenQV1) but attach it to the address of OpenQProxy
	const openQ = await OpenQ.attach(process.env.OPENQ_PROXY_ADDRESS);

	const githubIssueIds = ['I_kwDOE5zs-M480ik8', 'I_kwDOGWnnz85GjwA1', 'I_kwDOGAqhQc48U5_r', 'I_kwDOGWnnz84-qyDq', 'I_kwDOGWnnz85CZwGJ', 'I_kwDOGWnnz85AkiDt', 'I_kwDOGWnnz85Oi-oQ'];
	const githubIssueIdsOtherOrgs = ['I_kwDOCHE8585AYvGo', 'I_kwDOGWnnz85AkkDW', 'I_kwDOB7jojM5HoxGM', 'I_kwDOBhc8WM5Fqi_o', 'I_kwDOCQWAHM5EzBw7'];

	let abiCoder = new ethers.utils.AbiCoder;

	const abiEncodedParamsAtomic = abiCoder.encode(['bool', 'address', 'uint256'], [true, process.env.MOCK_LINK_TOKEN_ADDRESS, '100']);
	let bountyInitOperation = [0, abiEncodedParamsAtomic];

	const abiEncodedParams = abiCoder.encode(['address', 'uint256', 'bool', 'address', 'uint256'], [process.env.MOCK_LINK_TOKEN_ADDRESS, '100', true, process.env.MOCK_LINK_TOKEN_ADDRESS, '1000']);
	let ongoingBountyInitOperation = [1, abiEncodedParams];

	console.log('Minting Bounty 1...');
	await openQ.mintBounty(githubIssueIds[0], 'MDEyOk9yZ2FuaXphdGlvbjc3NDAyNTM4', bountyInitOperation);
	await optionalSleep(10000);
	console.log('Bounty 1 deployed');

	console.log('Minting Bounty 1.5...');
	await openQ.mintBounty(githubIssueIds[4], 'MDEyOk9yZ2FuaXphdGlvbjc3NDAyNTM4', bountyInitOperation);
	await optionalSleep(10000);
	console.log('Bounty 1.5 deployed');

	console.log('Minting Bounty 1.75...');
	await openQ.mintBounty(githubIssueIds[5], 'MDEyOk9yZ2FuaXphdGlvbjc3NDAyNTM4', bountyInitOperation);
	await optionalSleep(10000);
	console.log('Bounty 1.75 deployed');

	console.log('Minting Bounty 2...');
	await openQ.mintBounty(githubIssueIds[1], 'MDEyOk9yZ2FuaXphdGlvbjc3NDAyNTM4', bountyInitOperation);
	await optionalSleep(10000);
	console.log('Bounty 2 deployed');

	console.log('Minting Bounty 3...');
	await openQ.mintBounty(githubIssueIds[2], 'MDEyOk9yZ2FuaXphdGlvbjc3NDAyNTM4', bountyInitOperation);
	await optionalSleep(10000);
	console.log('Bounty 3 deployed');

	console.log('Minting Bounty 4...');
	await openQ.mintBounty(githubIssueIds[3], 'MDEyOk9yZ2FuaXphdGlvbjc3NDAyNTM4', bountyInitOperation);
	await optionalSleep(10000);
	console.log('Bounty 4 deployed');

	console.log('Minting Ongoing Bounty...');
	await openQ.mintBounty(githubIssueIds[6], 'MDEyOk9yZ2FuaXphdGlvbjc3NDAyNTM4', ongoingBountyInitOperation);
	await optionalSleep(10000);
	console.log('Ongoing Bounty deployed');

	// console.log('Minting Bounty 5...');
	// await openQ.mintBounty(githubIssueIdsOtherOrgs[0], 'Uniswap');
	// await optionalSleep(10000);
	// console.log('Bounty 5 deployed');

	// console.log('Minting Bounty 6...');
	// await openQ.mintBounty(githubIssueIdsOtherOrgs[1], 'ethereum');
	// await optionalSleep(10000);
	// console.log('Bounty 6 deployed');

	// console.log('Minting Bounty 7...');
	// await openQ.mintBounty(githubIssueIdsOtherOrgs[2], 'balancer-labs');
	// await optionalSleep(10000);
	// console.log('Bounty 7 deployed');

	console.log('Minting Bounty 8...');
	await openQ.mintBounty(githubIssueIdsOtherOrgs[0], 'MDEyOk9yZ2FuaXphdGlvbjM0OTY2NDY0', bountyInitOperation);
	await optionalSleep(10000);
	console.log('Bounty 8 deployed');

	console.log('Minting Bounty 9...');
	await openQ.mintBounty(githubIssueIdsOtherOrgs[1], 'MDEyOk9yZ2FuaXphdGlvbjc3NDAyNTM4', bountyInitOperation);
	await optionalSleep(10000);
	console.log('Bounty 9 deployed');


	console.log('Minting Bounty 10...');
	await openQ.mintBounty(githubIssueIdsOtherOrgs[2], 'MDEyOk9yZ2FuaXphdGlvbjM4OTE3MTM3', bountyInitOperation);
	await optionalSleep(10000);
	console.log('Bounty 10 deployed');

	console.log('Minting Bounty 11...');
	await openQ.mintBounty(githubIssueIdsOtherOrgs[3], 'MDEyOk9yZ2FuaXphdGlvbjI0OTU0NDY4', bountyInitOperation);
	await optionalSleep(10000);
	console.log('Bounty 11 deployed');

	console.log('Minting Bounty 12...');
	await openQ.mintBounty(githubIssueIdsOtherOrgs[4], 'MDEyOk9yZ2FuaXphdGlvbjEyNTIzMDI1', bountyInitOperation);
	await optionalSleep(10000);
	console.log('Bounty 12 deployed');

	// await sleep(2000);

	// const bounty1Address = await openQ.bountyIdToAddress(githubIssueIds[0]);
	// const bounty2Address = await openQ.bountyIdToAddress(githubIssueIds[1]);
	// const bounty3Address = await openQ.bountyIdToAddress(githubIssueIds[2]);
	// const bounty4Address = await openQ.bountyIdToAddress(githubIssueIds[3]);

	// const bounty5Address = await openQ.bountyIdToAddress(githubIssueIds[0]);
	// const bounty6Address = await openQ.bountyIdToAddress(githubIssueIds[1]);
	// const bounty7Address = await openQ.bountyIdToAddress(githubIssueIds[2]);
	// const bounty8Address = await openQ.bountyIdToAddress(githubIssueIds[3]);

	// console.log(`Bounty 1 with id ${githubIssueIds[0]} minted to ${bounty1Address}`);
	// console.log(`Bounty 2 with id ${githubIssueIds[1]} minted to ${bounty2Address}`);
	// console.log(`Bounty 3 with id ${githubIssueIds[2]} minted to ${bounty3Address}`);
	// console.log(`Bounty 4 with id ${githubIssueIds[3]} minted to ${bounty4Address}`);
	// console.log(`Bounty 5 with id ${githubIssueIdsOtherOrgs[0]} minted to ${bounty5Address}`);
	// console.log(`Bounty 6 with id ${githubIssueIdsOtherOrgs[1]} minted to ${bounty6Address}`);
	// console.log(`Bounty 7 with id ${githubIssueIdsOtherOrgs[2]} minted to ${bounty7Address}`);
	// console.log(`Bounty 8 with id ${githubIssueIdsOtherOrgs[3]} minted to ${bounty8Address}`);

	console.log('\nBounties Deployed Successfully!');
}

async function main() {
	await deployBounties();
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});

module.exports = deployBounties;