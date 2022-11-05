const { ethers } = require("hardhat");
const hre = require("hardhat");

async function defaultFixture() {
    await deployments.fixture();
    const cJomTx = await ethers.getContract('JomTx');
    const semaphoreAddr = await cJomTx.getWorldIDAddr();
    const cMockWorldID = await ethers.getContractAt('MockWorldID',semaphoreAddr);
    return {
        cJomTx,
        cMockWorldID
    }
}

module.exports = {
    defaultFixture
}