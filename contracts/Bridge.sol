//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Erc20Token.sol";

contract Bridge {

    mapping(address => mapping(uint256 => bool)) public dirtyNonces;

    address public owner;

    Erc20Token public token;

    event SwapInitialized(address from,
        address to,
        uint256 amount, 
        uint256 nonce,
        bytes signature);

    constructor(address _address) {
        token = Erc20Token(_address);
        owner = msg.sender;
    }

    function swap(address _to, uint256 _amount, uint256 _nonce, bytes calldata _signature) public {
        require(dirtyNonces[msg.sender][_nonce] == false, 'already processed');
        dirtyNonces[msg.sender][_nonce] = true;
        token.burn(msg.sender, _amount);
        emit SwapInitialized(msg.sender, _to, _amount, _nonce, _signature);
    }

    function redeem(address _from, address _to, uint256 _amount, uint256 _nonce, uint8 _v, bytes32 _r, bytes32 _s) public {
        bytes32 message = hashMessage(keccak256(abi.encodePacked(_from, _to, _amount, _nonce)));     
        require(ecrecover(message, _v, _r, _s)  == _from , 'wrong signature');
       // require(dirtyNonces[_from][_nonce] == false, 'already processed');
        dirtyNonces[_from][_nonce] = true;
        token.mint(_to, _amount);
    }

    function hashMessage(bytes32 _message) private pure returns(bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _message));
    }
 
}