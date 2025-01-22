// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HashVerifier {
    // 验证器合约接口
    IVerifier public immutable verifier;

    // 部署时需要传入 Verifier.sol 合约的地址
    // 例如: 如果 Verifier 合约部署在 0x1234...，则部署本合约时传入这个地址
    constructor(address _verifier) {
        // ↓↓↓ Verifier合约地址在这里传入 ↓↓↓
        verifier = IVerifier(_verifier);
        // ↑↑↑ 例如: verifier = IVerifier(0x1234...); ↑↑↑
    }

    // 验证函数：证明知道某个哈希值的原像
    function verifyKnowledge(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint256 hasher
    ) external view returns (bool) {
        // 验证零知识证明
        return verifier.verifyProof(a, b, c, [hasher]);
    }
}

interface IVerifier {
    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[1] memory input
    ) external view returns (bool);
} 