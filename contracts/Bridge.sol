//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Erc20Token.sol";

contract Bridge {

    address public immutable owner;

    Erc20Token public immutable token;

    mapping(address => mapping(bytes32 => bool)) public processedHashes;

    event SwapInitialized(
        address from,
        address to,
        uint256 amount, 
        uint256 nonce,
        uint256 chainTo,
        bytes32 hash
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
        emit SwapInitialized(msg.sender, _to, _amount, _nonce, _chainTo, hash);
    }

    function redeem(address _from, address _to, uint256 _amount, uint256 _chainTo, bytes32 _hash, uint8 _v, bytes32 _r, bytes32 _s) public {
        require(_chainTo == block.chainid, 'wrong chainId');
        bytes32 hash = hashMessage(_hash);     
        require(ecrecover(hash, _v, _r, _s)  == _from , 'wrong signature');
        require(processedHashes[_from][hash] == false, 'already processed');
        processedHashes[_from][hash] = true;
        token.mint(_to, _amount);
    }

    function hashMessage(bytes32 _message) private pure returns(bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message 1:\n32", _message));
    }
 
}