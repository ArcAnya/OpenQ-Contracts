require("dotenv").config({ path: './../.env' })

const Octobay = artifacts.require("Octobay")
const LinkToken = artifacts.require("link-token/LinkToken")
const OctobayVisibilityToken = artifacts.require("OctobayVisibilityToken")
const UserAddressStorage = artifacts.require("UserAddressStorage")
const OracleStorage = artifacts.require("OracleStorage")
const OctobayGovernor = artifacts.require("OctobayGovernor")
const OctobayGovNFT = artifacts.require("OctobayGovNFT")
const DepositStorage = artifacts.require("DepositStorage")
const zeroAddress = "0x0000000000000000000000000000000000000000"

module.exports = function (deployer, network) {
  if (network == 'test') return;
  if (network == 'development') {
    deployer.deploy(
      Octobay,
      LinkToken.address,
      zeroAddress,
      OctobayVisibilityToken.address,
      UserAddressStorage.address,
      OracleStorage.address,
      OctobayGovernor.address,
      zeroAddress,
      OctobayGovNFT.address,
      DepositStorage.address

    ).then(octobayInstance => {
      octobayInstance.setTwitterAccountId(process.env.OCTOBAY_TWITTER_ACCOUNT_ID)
      LinkToken.deployed().then(linkTokenInstance => {
        linkTokenInstance.transfer(octobayInstance.address, "10000000000000000000")
      })

      OctobayVisibilityToken.deployed().then(OctobayVisibilityTokenInstance => {
        OctobayVisibilityTokenInstance.setOctobay(octobayInstance.address)
      })
      UserAddressStorage.deployed().then(UserAddressStorageInstance => {
        UserAddressStorageInstance.setOctobay(octobayInstance.address)
      })
      OracleStorage.deployed().then(OracleStorageInstance => {
        OracleStorageInstance.setOctobay(octobayInstance.address)
      })
      OctobayGovernor.deployed().then(OctobayGovernorInstance => {
        OctobayGovernorInstance.setOctobay(octobayInstance.address)
      })     
      OctobayGovNFT.deployed().then(OctobayGovNFTInstance => {
        OctobayGovNFTInstance.setOctobay(octobayInstance.address)
      })
      DepositStorage.deployed().then(DepositStorageInstance => {
        DepositStorageInstance.setOctobay(octobayInstance.address)
      })      
    })
  } else if (network == 'kovan') {
    deployer.deploy(
      Octobay,
      '0xa36085F69e2889c224210F603D836748e7dC0088',
      zeroAddress,
      OctobayVisibilityToken.address,
      UserAddressStorage.address,
      OracleStorage.address,
      OctobayGovernor.address,
      '0x9326BFA02ADD2366b30bacB125260Af641031331',
      OctobayGovNFT.address,
      DepositStorage.address
    ).then(octobayInstance => {
      OctobayVisibilityToken.deployed().then(OctobayVisibilityTokenInstance => {
        OctobayVisibilityTokenInstance.setOctobay(octobayInstance.address)
      })
      UserAddressStorage.deployed().then(UserAddressStorageInstance => {
        UserAddressStorageInstance.setOctobay(octobayInstance.address)
      })
      OracleStorage.deployed().then(OracleStorageInstance => {
        OracleStorageInstance.setOctobay(octobayInstance.address)
      })
      OctobayGovernor.deployed().then(OctobayGovernorInstance => {
        OctobayGovernorInstance.setOctobay(octobayInstance.address)
      })     
      OctobayGovNFT.deployed().then(OctobayGovNFTInstance => {
        OctobayGovNFTInstance.setOctobay(octobayInstance.address)
      })
      DepositStorage.deployed().then(DepositStorageInstance => {
        DepositStorageInstance.setOctobay(octobayInstance.address)
      })      
    })
  }
}
