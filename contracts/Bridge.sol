//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Erc20Token.sol";

contract Bridge {

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

    function redeem(address _from, address _to, uint256 _amount, uint256 _chainTo, uint256 _nonce, uint8 _v, bytes32 _r, bytes32 _s) public {
        require(_chainTo == block.chainid, 'wrong chainId');
        bytes32 hash = addPrefix(keccak256(abi.encodePacked(_from, _to, _amount, _nonce, _chainTo)));          
        require(ecrecover(hash, _v, _r, _s)  == _from , 'wrong signature');
        require(processedHashes[_from][hash] == false, 'already processed');
        processedHashes[_from][hash] = true;
        token.mint(_to, _amount);
        emit BridgeOperation(msg.sender, _to, _amount, _nonce, _chainTo, hash, Operation.Redeem);
    }

    function addPrefix(bytes32 _message) private pure returns(bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _message));
    }
 
}