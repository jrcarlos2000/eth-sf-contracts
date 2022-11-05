const { createFixtureLoader } = require("ethereum-waffle");
const {
  Semaphore,
  generateMerkleProof,
  StrBigInt,
  MerkleProof,
  SemaphoreSolidityProof,
} = require('@zk-kit/protocols');
const {addresses} = require("../utils/addresses");
const { solidityPack } = require('ethers/lib/utils')
const { ZkIdentity, Strategy } = require('@zk-kit/identity')

const forkedNetwork = process.env.NETWORK;
const isPolygon = hre.network.name === "polygon" || forkedNetwork == "polygon";
const isMainnet = hre.network.name === "mainnet" || forkedNetwork == "mainnet";
const isLocalHost = hre.network.name === "hardhat";
const actionID = "wid_test_1234";
console.log(hre.network.name);
const isFork = hre.network.name == "localhost";

const getTokenAddresses = async (deployments) => {
  if (isPolygon) {
    return {
      USDT: addresses.polygon.USDT,
      USDC: addresses.polygon.USDC,
      DAI: addresses.polygon.DAI,
    };
  }
};
const loadFixture = createFixtureLoader(
  [
    hre.ethers.provider.getSigner(0),
    hre.ethers.provider.getSigner(1),
    hre.ethers.provider.getSigner(2),
    hre.ethers.provider.getSigner(3),
    hre.ethers.provider.getSigner(4),
    hre.ethers.provider.getSigner(5),
    hre.ethers.provider.getSigner(6),
    hre.ethers.provider.getSigner(7),
    hre.ethers.provider.getSigner(8),
    hre.ethers.provider.getSigner(9),
  ],
  hre.ethers.provider
);
const getProof = async (externalNullifier,signal, identityString) => {
  const identity = new ZkIdentity(Strategy.MESSAGE, identityString)
  const identityCommitment = identity.genIdentityCommitment()

  const witness = generateSemaphoreWitness(
      identity.getTrapdoor(),
      identity.getNullifier(),
      generateMerkleProof(20, BigInt(0), [identityCommitment], identityCommitment),
      hashBytes(solidityPack(['string'], [externalNullifier])),
      // update here if changing the signal (you might need to wrap in a `pack()` call if there are multiple arguments), see above
      signal
  )

  const { proof, publicSignals } = await Semaphore.genProof(
      witness,
      './external-artifacts/semaphore.wasm',
      './external-artifacts/semaphore_final.zkey'
  )

  return [publicSignals.nullifierHash, Semaphore.packToSolidityProof(proof)]
}

const generateSemaphoreWitness = (
  identityTrapdoor,
  identityNullifier,
  merkleProof,
  externalNullifier,
  signal
) => ({
  identityNullifier: identityNullifier,
  identityTrapdoor: identityTrapdoor,
  treePathIndices: merkleProof.pathIndices,
  treeSiblings: merkleProof.siblings,
  externalNullifier: externalNullifier,
  signalHash: hashBytes(signal),
})

const hashBytes = (signal) => {
  return BigInt(ethers.utils.solidityKeccak256(['bytes'], [signal])) >> BigInt(8)
}
const registerIdentity = async (cSemaphore, identityString, groupId) => {
  const identity = new ZkIdentity(Strategy.MESSAGE, identityString)
  const tx = await cSemaphore.addMember(groupId, identity.genIdentityCommitment())
  await tx.wait()
}
module.exports = {
  actionID,
  getTokenAddresses,
  isPolygon,
  isMainnet,
  isLocalHost,
  isFork,
  forkedNetwork,
  loadFixture,
  getProof,
  registerIdentity
};
