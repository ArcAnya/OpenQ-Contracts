const OctoBay = artifacts.require("OctoBay")
const OctoPin = artifacts.require("OctoPin")
const Oracle = artifacts.require("Oracle")
const LinkToken = artifacts.require("LinkToken")
const someAddress = "0xE781857C5b55ff0551Df167D0B0A4C53BFD08e1D"
const someGithubUser = "mktcode"
const someOtherGithubUser = "wehmoen"
const someIssueId = 'MDU6SXNzdWU3NjA2NDYzNjg='

contract("OctoBay", async accounts => {
  it("sets OctoPin token", async () => {
    const octobay = await OctoBay.deployed()
    const octopin = await OctoPin.deployed()
    await octobay.setOctoPin(octopin.address)
    const newAddress = await octobay.octoPin()
    assert.equal(octopin.address, newAddress)
  })

  it("sets Oracle", async () => {
    const octobay = await OctoBay.deployed()
    await octobay.setOracle(
      someAddress,
      "Main",
      web3.utils.toHex("0"),
      web3.utils.toHex("0"),
      web3.utils.toHex("0"),
      web3.utils.toHex("0"),
      web3.utils.toHex("0"),
      web3.utils.toHex("0"),
      web3.utils.toHex("0")
    )
    const oracles = await octobay.getOracles()
    assert.equal(oracles.includes(someAddress), true)
  })

  it("removes Oracle", async () => {
    const octobay = await OctoBay.deployed()
    await octobay.removeOracle(someAddress)
    const oracles = await octobay.getOracles()
    assert.equal(oracles.includes(someAddress), false)
  })

  it("sets Oracle fulfill permission", async () => {
    const oracle = await Oracle.deployed()
    const tx = await oracle.setFulfillmentPermission(accounts[0], true)
    assert.notEqual(tx, null)
  })

  it("receives LINK token", async () => {
    const octobay = await OctoBay.deployed()
    const link = await LinkToken.deployed()
    const transferBalance = '10000000000000000000'
    await link.transfer(octobay.address, transferBalance)
    const balance = await link.balanceOf(octobay.address)
    assert.equal(balance.toString(), transferBalance)
  })

  let registerRequestId, registerRequestTimestamp
  it("registers a user", async () => {
    const octobay = await OctoBay.deployed()
    const oracles = await octobay.getOracles()
    const oracle = await octobay.activeOracles(oracles[0])
    registerRequestTimestamp = Math.floor(Date.now() / 1000) + (5 * 60)
    const registerRequest = await octobay.register(oracles[0], oracle.registerJobId, someGithubUser)
    registerRequestId = registerRequest.logs[0].args.id
    const user = await octobay.users(registerRequestId)

    assert.equal(user.status.toString(), '1')
  })

  it("confirms the user", async () => {
    const octobay = await OctoBay.deployed()
    const oracle = await Oracle.deployed()
    await oracle.fulfillOracleRequest(
      registerRequestId,
      '100000000000000000',
      octobay.address,
      web3.eth.abi.encodeFunctionSignature("confirmRegistration(bytes32)"),
      registerRequestTimestamp,
      web3.utils.toHex("")
    )
    const user = await octobay.users(registerRequestId)

    assert.equal(user.status.toString(), '2')
  })

  it("deposits 1 ETH for user", async () => {
    const octobay = await OctoBay.deployed()
    const sendValue = '1000000000000000000'
    await octobay.depositEthForGithubUser(someOtherGithubUser, { from: accounts[0], value: sendValue })
    const claimAmount = await octobay.userClaimAmountByGithbUser(someOtherGithubUser)

    assert.equal(claimAmount, sendValue)
  })

  it("refunds 1 ETH to depositer", async () => {
    const octobay = await OctoBay.deployed()
    const depositIds = await octobay.getUserDepositIdsForSender()
    await octobay.refundUserDeposit(depositIds[0])
    const claimAmount = await octobay.userClaimAmountByGithbUser(someGithubUser)

    assert.equal(claimAmount.toString(), '0')
  })

  it("deposits 1 ETH for issue", async () => {
    const octobay = await OctoBay.deployed()
    const sendValue = '1000000000000000000'
    const tx = await octobay.depositEthForIssue(someIssueId, { from: accounts[0], value: sendValue })
    const event = tx.logs[0]
    const correctEventName = event.event === 'IssueDepositEvent'
    const correctArgs = event.args.account === accounts[0] && event.args.amount.toString() === sendValue && event.args.issueId === someIssueId
    assert.equal(correctEventName && correctArgs, true)
  })

  it("refunds 1 ETH to depositer", async () => {
    const octobay = await OctoBay.deployed()
    const depositIds = await octobay.getIssueDepositIdsForIssueId(someIssueId)
    await octobay.refundIssueDeposit(depositIds[0])
    const depositAmount = await octobay.issueDepositsAmountByIssueId(someIssueId)

    assert.equal(depositAmount.toString(), '0')
  })

  let releaseRequestId, releaseRequestTimestamp
  it("releases an issue deposit", async () => {
    const octobay = await OctoBay.deployed()
    // make deposit
    const sendValue = '1000000000000000000'
    await octobay.depositEthForIssue(someIssueId, { from: accounts[0], value: sendValue })

    // make request
    const oracles = await octobay.getOracles()
    const oracle = await octobay.activeOracles(oracles[0])
    releaseRequestTimestamp = Math.floor(Date.now() / 1000) + (5 * 60)
    const releaseRequest = await octobay.releaseIssueDeposits(oracles[0], oracle.releaseJobId, someIssueId, someGithubUser)
    releaseRequestId = releaseRequest.logs[0].args.id
    const issue = await octobay.releasedIssues(releaseRequestId)

    assert.equal(issue.status.toString(), '1')
  })

  it("confirms issue release", async () => {
    const octobay = await OctoBay.deployed()
    const oracle = await Oracle.deployed()
    await oracle.fulfillOracleRequest(
      releaseRequestId,
      '100000000000000000',
      octobay.address,
      web3.eth.abi.encodeFunctionSignature("confirmReleaseIssueDeposits(bytes32)"),
      releaseRequestTimestamp,
      web3.utils.toHex("")
    )
    const issue = await octobay.releasedIssues(releaseRequestId)

    assert.equal(issue.status.toString(), '2')
  })
})
