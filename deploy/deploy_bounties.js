const hre = require('hardhat');
const { optionalSleep } = require('./utils');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.contracts') });

async function deployBounties() {
	const OpenQ = await hre.ethers.getContractFactory('OpenQ');
	const openQ = await OpenQ.attach(process.env.OPENQ_ADDRESS);

	const githubIssueIds = ['I_kwDOE5zs-M480ik8', 'I_kwDOGAqhQc48U54v', 'I_kwDOGAqhQc48U5_r', 'I_kwDOGWnnz84-qyDq'];

	await openQ.mintBounty(githubIssueIds[0], 'openqdev');
	await optionalSleep(10000);

	await openQ.mintBounty(githubIssueIds[1], 'openqdev');
	await optionalSleep(10000);

	await openQ.mintBounty(githubIssueIds[2], 'openqdev');
	await optionalSleep(10000);

	await openQ.mintBounty(githubIssueIds[3], 'openqdev');
	await optionalSleep(10000);

	const bounty1Address = await openQ.getBountyAddress(githubIssueIds[0]);
	const bounty2Address = await openQ.getBountyAddress(githubIssueIds[1]);
	const bounty3Address = await openQ.getBountyAddress(githubIssueIds[2]);
	const bounty4Address = await openQ.getBountyAddress(githubIssueIds[3]);

	console.log(`Bounty 1 with id ${githubIssueIds[0]} minted to ${bounty1Address}`);
	console.log(`Bounty 2 with id ${githubIssueIds[1]} minted to ${bounty2Address}`);
	console.log(`Bounty 3 with id ${githubIssueIds[2]} minted to ${bounty3Address}`);
	console.log(`Bounty 4 with id ${githubIssueIds[3]} minted to ${bounty4Address}`);
}

module.exports = deployBounties;