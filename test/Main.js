const { expect } = require("chai");
const { ethers, getNamedAccounts } = require("hardhat");
const {defaultFixture} = require('./_fixture');
const {loadFixture, actionID, getProof, registerIdentity} = require('../utils/helpers');
const { parseUnits, solidityPack } = require("ethers/lib/utils");
const { getOpcodeLength } = require("hardhat/internal/hardhat-network/stack-traces/opcodes");



describe("Test Contract", async () => {

  // beforeEach(async () => {

  // })
  describe("Jom tx", async ()=>{
    it("accepts and validates calls from various users", async () => {
      const {deployerAddr} = await getNamedAccounts();
      const { cJomTx,cMockWorldID } = await loadFixture(defaultFixture);

      await registerIdentity(cMockWorldID,"test-identity",0);
      let storeSignal = 54;

      const sDeployer = await ethers.provider.getSigner(deployerAddr);
      let [nullifierHash, proof] = await getProof(actionID, solidityPack(["uint256"],[storeSignal]), "test-identity");

      const currGroupID = await cJomTx.getCurrGroupId();
      console.log(currGroupID);
      await cJomTx.connect(sDeployer).submitNonVerifiedUserTx(
        "test-cid",
        storeSignal,
        await cMockWorldID.getRoot(currGroupID),
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
