const { expect } = require("chai");
const { ethers, getNamedAccounts } = require("hardhat");
const {defaultFixture} = require('./_fixture');
const {loadFixture, actionID, getProof, registerIdentity} = require('../utils/helpers');
const { parseUnits, solidityPack } = require("ethers/lib/utils");
const { getOpcodeLength } = require("hardhat/internal/hardhat-network/stack-traces/opcodes");



describe("Test Contract", async () => {

  // beforeEach(async () => {

  // })
  describe("JomTx", async ()=>{
    it("can register many users", async () => {
      const {deployerAddr, governorAddr} = await getNamedAccounts();
      const { cJomTx,cMockWorldID } = await loadFixture(defaultFixture);

      await registerIdentity(cMockWorldID,governorAddr,1);

      let [nullifierHash, proof] = await getProof(actionID, solidityPack(["address"],[governorAddr]), governorAddr);

      let currGroupID = await cJomTx.getCurrGroupId();

      await cJomTx.verifyUser(
        governorAddr,
        1,
        await cMockWorldID.getRoot(1),
        nullifierHash,
        proof
      )

      // const tx = await cMockWorldID.createGroup(1,20);
      // await tx.wait();
      // const tx2 = await cJomTx.incrementGroupIds();
      // await tx2.wait();
      // Verify 

      await registerIdentity(cMockWorldID,deployerAddr,1);

      [nullifierHash, proof] = await getProof(actionID, solidityPack(["address"],[deployerAddr]), deployerAddr);

      // currGroupID = await cJomTx.getCurrGroupId();

      await cJomTx.verifyUser(
        deployerAddr,
        1,
        await cMockWorldID.getRoot(1),
        nullifierHash,
        proof
      )




      // await registerIdentity(cMockWorldID,"test-identity-dos",1);

      // let [nullifierHash2, proof2] = await getProof(actionID, solidityPack(["uint256"],[storeSignal]), "test-identity-dos");

      // await cJomTx.connect(sDeployer).submitNonVerifiedUserTx(
      //   "test-cid",
      //   storeSignal,
      //   await cMockWorldID.getRoot(1),
      //   nullifierHash2,
      //   proof2
      // )

      // storeSignal = 45;

      // let [nullifierHash2, proof2] = await getProof(actionID, solidityPack(["uint256"],[storeSignal]), "test-identity");
      // await cJomTx.connect(sDeployer).submitNonVerifiedUserTx(
      //   "test-cid",
      //   storeSignal,
      //   await cMockWorldID.getRoot(1),
      //   nullifierHash2,
      //   proof2
      // )
    });
  })
});
