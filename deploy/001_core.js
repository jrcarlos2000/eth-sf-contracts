require("hardhat");
const { utils } = require("ethers");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { parseUnits, formatUnits } = require("ethers").utils;
const { getTokenAddresses, isFork,actionID } = require("../utils/helpers");
const { poseidon_gencontract } = require('circomlibjs');
const IncrementalBinaryTree = require("../artifacts/contracts/zk-kit/packages/incremental-merkle-tree.sol/contracts/IncrementalBinaryTree.sol/IncrementalBinaryTree.json");
const MockWorldID = require("../artifacts/contracts/MockWorldID.sol/MockWorldID.json");
const {
  deployWithConfirmation,
  withConfirmation,
  log,
} = require("../utils/deploy");

const deployPoseidon = async () => {
  const { deployerAddr, governorAddr } = await getNamedAccounts();
  const sDeployer  = ethers.provider.getSigner(deployerAddr);
  let tx = await sDeployer.sendTransaction({data : poseidon_gencontract.createCode(2)});
  tx = await tx.wait();
  log(`Poseidon deployed to :: ${tx.contractAddress}`); 
  return tx.contractAddress;
};

const deployIBT = async (poseidonAddr) => {
  const { deployerAddr, governorAddr } = await getNamedAccounts();
  const sDeployer  = ethers.provider.getSigner(deployerAddr);
  let tx = await sDeployer.sendTransaction({
    data: IncrementalBinaryTree.bytecode.replace(
        /__\$\w*?\$__/g,
        poseidonAddr.slice(2)
    ),
  });

  tx = await tx.wait();
  log(`IBT deployed to :: ${tx.contractAddress}`); 
  return tx.contractAddress;
}

const deployMockWorldID = async (ibtAddr) => {
  const {deployerAddr, governorAddr} = await getNamedAccounts();
  const sDeployer = ethers.provider.getSigner(deployerAddr);
  let tx = await sDeployer.sendTransaction({
    data: MockWorldID.bytecode.replace(/__\$\w*?\$__/g, ibtAddr.slice(2)),
  })
  tx = await tx.wait();
  log(`MockWorldID deployed to :: ${tx.contractAddress}`); 
  const cMockWorldID = await ethers.getContractAt("MockWorldID",tx.contractAddress);
  await withConfirmation(cMockWorldID.createGroup(0,20));
  return tx.contractAddress;
};

const deployContract = async (worldIDAddr) => {
  const {deployerAddr} = await getNamedAccounts();
  await deployWithConfirmation('JomTx',[worldIDAddr,actionID]);
}

const main = async () => {
  const poseidonAddr = await deployPoseidon();
  const IBTAddr = await deployIBT(poseidonAddr);
  const worldIDAddr = await deployMockWorldID(IBTAddr);
  await deployContract(worldIDAddr);
};

main.id = "001_core";
main.skip = () => false;
module.exports = main;
