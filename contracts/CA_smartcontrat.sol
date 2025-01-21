// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20; 

// 导入 OpenZeppelin 的 MerkleProof 库，用于验证 Merkle 树证明
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

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

    // 当 Merkle 根被更新时触发的事件
    event MerkleRootUpdated(bytes32 oldRoot, bytes32 newRoot);
    // 当新的 hasher(nullifier) 被上传时触发的事件
    event HasherMappingUpdated(bytes32 indexed hasher, bool status);

    // 修饰器：限制只有合约拥有者可以调用某些函数
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can perform this action");
        _;
    }

    // 构造函数：初始化 Merkle 根并设置合约拥有者
    constructor(bytes32 _merkleRoot) {
        owner = msg.sender; // 将部署合约的地址设置为合约拥有者
        merkleRoot = _merkleRoot; // 初始化 Merkle 根
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
        require(!hasherMapping[_hasher], "Hasher is already set to false");

        // 记录 hasher 并发出事件
        hasherMapping[_hasher] = true;
        allHashers.push(_hasher);
        emit HasherMappingUpdated(_hasher, true);
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
