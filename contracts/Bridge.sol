//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Erc20Token.sol";

contract Bridge {

    mapping(address => mapping(bytes32 => bool)) public processedHashes;

    address public immutable owner;

    Erc20Token public immutable token;

    event SwapInitialized(address from,
        address to,
        uint256 amount, 
        uint256 nonce,
        uint256 chainId,
        bytes32 hash,
        bytes signature);

    constructor(address _address) {
        token = Erc20Token(_address);
        owner = msg.sender;
    }

    function setTokenOwner(address _address) public {
        token.setOwner(_address);
    }

    function swap(address _to, uint256 _amount, uint256 _nonce, uint256 _chainTo, bytes32 _hash, bytes calldata _signature) public {
        require(processedHashes[msg.sender][_hash] == false, 'already processed');
        processedHashes[msg.sender][_hash] = true;
        token.burn(msg.sender, _amount);
        emit SwapInitialized(msg.sender, _to, _amount, _nonce, _chainTo, _hash, _signature);
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
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _message));
    }
 
}