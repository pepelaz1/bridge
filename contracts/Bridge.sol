//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Erc20Token.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Bridge {
    using ECDSA for bytes32;

    address public immutable owner;

    Erc20Token public immutable token;

    mapping(address => mapping(bytes32 => bool)) public processedHashes;

    enum Operation {Swap, Redeem}

    event BridgeOperation(
        address from,
        address to,
        uint256 amount, 
        uint256 nonce,
        uint256 chainTo,
        bytes32 hash,
        Operation indexed operation
    );

    constructor(address _address) {
        token = Erc20Token(_address);
        owner = msg.sender;
    }

    function swap(address _to, uint256 _amount, uint256 _nonce, uint256 _chainTo) public {
        bytes32 hash = keccak256(abi.encodePacked(msg.sender, _to, _amount, _nonce, _chainTo));
        require(processedHashes[msg.sender][hash] == false, 'already processed');
        processedHashes[msg.sender][hash] = true;
        token.burn(msg.sender, _amount);
        emit BridgeOperation(msg.sender, _to, _amount, _nonce, _chainTo, hash, Operation.Swap);
    }

   function redeem(address _from, address _to, uint256 _amount, uint256 _chainTo, uint256 _nonce, bytes calldata _signature) public {
        require(_chainTo == block.chainid, 'wrong chainId');
        bytes32 hash = keccak256(abi.encodePacked(_from, _to, _amount, _nonce, _chainTo));       
        require(verify(hash, _signature, _from) , 'wrong signature');
        require(processedHashes[_from][hash] == false, 'already processed');
        processedHashes[_from][hash] = true;
        token.mint(_to, _amount);
        emit BridgeOperation(msg.sender, _to, _amount, _nonce, _chainTo, hash, Operation.Redeem);
    }

    function verify(bytes32 _data, bytes calldata _signature, address _address) private pure returns (bool) {
        return _data.toEthSignedMessageHash().recover(_signature) == _address;
    }

}