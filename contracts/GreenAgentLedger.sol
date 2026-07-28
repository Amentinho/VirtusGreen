// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GreenAgentLedger {
    struct BatchRecord {
        bytes32 dataHash;
        string  skin;
        uint256 timestamp;
        address recorder;
    }

    mapping(string => BatchRecord) private records;
    string[] private batchCodes;

    event BatchAnchored(
        string  indexed batchCode,
        bytes32 indexed dataHash,
        string  skin,
        uint256 timestamp,
        address recorder
    );

    function anchor(
        string calldata batchCode,
        bytes32 dataHash,
        string calldata skin
    ) external {
        require(bytes(batchCode).length > 0, "empty batchCode");
        require(records[batchCode].timestamp == 0, "already anchored");

        records[batchCode] = BatchRecord({
            dataHash:  dataHash,
            skin:      skin,
            timestamp: block.timestamp,
            recorder:  msg.sender
        });
        batchCodes.push(batchCode);

        emit BatchAnchored(batchCode, dataHash, skin, block.timestamp, msg.sender);
    }

    function getRecord(string calldata batchCode)
        external view
        returns (bytes32 dataHash, string memory skin, uint256 timestamp, address recorder)
    {
        BatchRecord storage r = records[batchCode];
        return (r.dataHash, r.skin, r.timestamp, r.recorder);
    }

    function totalAnchored() external view returns (uint256) {
        return batchCodes.length;
    }
}
