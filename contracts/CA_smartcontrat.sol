// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20; 

// 导入 OpenZeppelin 的 MerkleProof 库，用于验证 Merkle 树证明
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

// 验证器接口
interface IVerifier {
    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[1] memory input
    ) external view returns (bool);
}

// Merkle树白名单合约
contract MerkleTreeWhitelist {
    // 合约拥有者地址
    address public owner;
    // 当前 Merkle 树的根哈希值
    bytes32 public merkleRoot;

    // 用于存储 hasher(nullifier) 值的映射，标记为 true 表示已使用
    mapping(bytes32 => bool) public hasherMapping;
    // 存储所有上传的 hasher(nullifier) 值的数组，方便检索
    bytes32[] public allHashers;

    // 验证器合约接口
    IVerifier public immutable verifier;

    // 当 Merkle 根被更新时触发的事件
    event MerkleRootUpdated(bytes32 oldRoot, bytes32 newRoot);
    // 当新的 hasher(nullifier) 被上传时触发的事件
    event HasherMappingUpdated(bytes32 indexed hasher, bool status);
    event HasherStatusChanged(bytes32 indexed hasher, bool newStatus);

    // 错误定义
    error ZKPVerificationFailed();
    error HasherNotFound();
    error HasherAlreadyUsed();
    error ReplayAttack();

    // 修饰器：限制只有合约拥有者可以调用某些函数
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can perform this action");
        _;
    }

    // 构造函数：初始化 Merkle 根并设置合约拥有者
    constructor(bytes32 _merkleRoot, address _verifier) {
        owner = msg.sender; // 将部署合约的地址设置为合约拥有者
        merkleRoot = _merkleRoot; // 初始化 Merkle 根
        verifier = IVerifier(_verifier);
    }

    // 允许合约拥有者更新 Merkle 树根的函数
    function updateMerkleRoot(bytes32 _newRoot) external onlyOwner {
        emit MerkleRootUpdated(merkleRoot, _newRoot); // 发出更新事件以追踪变更
        merkleRoot = _newRoot; // 更新存储的 Merkle 根
    }

    // 允许白名单用户上传 hasher(nullifier) 值的函数
    function uploadHasher(bytes32[] calldata proof, bytes32 _hasher) external {
        // 验证发送者的地址是否在 Merkle 树中
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(MerkleProof.verify(proof, merkleRoot, leaf), "Invalid Merkle proof");

        // 确保 hasher 尚未被设置
        require(!hasherMapping[_hasher], "Hasher is already set");

        // 记录 hasher 并发出事件
        hasherMapping[_hasher] = true;
        allHashers.push(_hasher);
        emit HasherMappingUpdated(_hasher, true);
    }

    // 新增：验证并使用hasher的函数
    function verifyAndUseHasher(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[1] memory input
    ) external {
        // 1. 验证零知识证明
        bool isValid = verifier.verifyProof(a, b, c, input);
        if (!isValid) {
            revert ZKPVerificationFailed();
        }

        // 2. 将input转换为bytes32以便查找
        bytes32 hasher = bytes32(input[0]);

        // 3. 检查hasher是否存在
        if (!hasherMapping[hasher]) {
            revert HasherNotFound();
        }

        // 4. 检查hasher是否可用（状态为true）
        if (hasherMapping[hasher] == false) {  // 如果状态已经是false，说明是重放攻击
            revert ReplayAttack();
        }

        // 5. 更新hasher状态为已使用（false）
        hasherMapping[hasher] = false;
        emit HasherStatusChanged(hasher, false);
    }

    // 查看函数：检查特定的 hasher(nullifier) 是否已被设置
    function isHasherSet(bytes32 _hasher) external view returns (bool) {
        return hasherMapping[_hasher]; // 如果 hasher 存在于映射中则返回 true
    }

    // 查看函数：获取所有已上传的 hasher(nullifier) 值
    function getAllHashers() external view returns (bytes32[] memory) {
        return allHashers; // 返回所有 hasher 的数组
    }
}