pragma solidity ^0.8.4;

import { ByteHasher } from './helpers/ByteHasher.sol';
import { IWorldID } from './interfaces/IWorldID.sol';
import "@openzeppelin/contracts/utils/Counters.sol";

/*
//   @dev JomTx contract, implemented for ETH SF hackathon
//   @title JomTx
//   @author Carlos Ramos
//   @note we infer that everyStore using this contract has already been verified.
*/
contract JomTx {
    using ByteHasher for bytes;
    using Counters for Counters.Counter;

    /// @notice Thrown when attempting to reuse a nullifier
    error InvalidNullifier();
    error UserVerified();
    error UserNotVerified();

    event transactionSubmitted(uint256 identityCommitment, string ipfs_uri, address buyer_addr, string detail);

    /// @dev The WorldID instance that will be used for verifying proofs
    IWorldID internal immutable worldId;

    /// @dev The application's action ID
    uint256 internal immutable actionId;

    /// @dev The WorldID group ID (1)
    uint256 internal immutable groupId = 0;

    /// @dev Whether a nullifier hash has been used already. Used to prevent double-signaling
    mapping(uint256 => bool) internal nullifierHashes;
    mapping(address => bool) public registeredUser;

    // PROTOCOL VARIABLES //
    mapping(uint256 => string[]) internal storeTransactions;
    mapping(address => string[]) internal userTransactions;

    Counters.Counter private groupIds;

    /// @param _worldId The WorldID instance that will verify the proofs
    /// @param _actionId The action ID for your application
    constructor(IWorldID _worldId, string memory _actionId) {
        worldId = _worldId;
        actionId = abi.encodePacked(_actionId).hashToField();
    }

    /// @dev if store is verified
    function submitNonVerifiedUserTx (
        string memory ipfs_uri,
        string memory detail,
        uint256 storeSignal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof 
        ) external {

        storeTransactions[nullifierHash].push(ipfs_uri);

        worldId.verifyProof(
            root,
            storeSignal,
            abi.encodePacked(storeSignal).hashToField(),
            nullifierHash,
            actionId,
            proof
        );

        emit transactionSubmitted(nullifierHash, ipfs_uri, address(0),detail);
    }

    /// @dev iff user and store are both verified
    function submitVerifiedTx (
        string memory ipfs_uri,
        string memory detail,
        address buyer_addr,
        uint256 storeSignal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
        ) external {

        require(registeredUser[buyer_addr], "User hasnt been verified");

        worldId.verifyProof(
            root,
            groupId,
            abi.encodePacked(storeSignal).hashToField(),
            nullifierHash,
            actionId,
            proof
        );

        storeTransactions[nullifierHash].push(ipfs_uri);
        userTransactions[buyer_addr].push(ipfs_uri);

        emit transactionSubmitted(nullifierHash, ipfs_uri, buyer_addr,detail);
    }

    function verifyUser (
        address callerAddr,
        uint256 groupIdd,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external {
        if (nullifierHashes[nullifierHash]) revert InvalidNullifier();
        if (registeredUser[callerAddr]) revert UserVerified();

        worldId.verifyProof(
            root,
            groupId,
            abi.encodePacked(callerAddr).hashToField(),
            nullifierHash,
            actionId,
            proof
        );

        nullifierHashes[nullifierHash] = true;
        registeredUser[callerAddr] = true;
    }

    function verifyForTaxDeclaration(
        address callerAddr, 
        uint256 root,
        uint256 groupIdd,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external {
        if (registeredUser[msg.sender]) revert UserNotVerified();

        worldId.verifyProof(
            root,
            groupId,
            abi.encodePacked(callerAddr).hashToField(),
            nullifierHash,
            actionId,
            proof
        );
    }

    function getCurrGroupId() external view returns(uint256) {
        return groupIds.current();
    }

    function incrementGroupIds() external {
        groupIds.increment();
    }


    function getWorldIDAddr () external view returns(address){
        return address(worldId);
    }
}