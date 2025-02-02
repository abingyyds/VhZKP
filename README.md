# VhZKP

[English](./README_EN.md) | 简体中文

- 基于零知识证明的哈希验证系统。
- A hash verification system based on Zero-Knowledge Proofs.

## 文件说明 | File Description

### 合约文件 | Contract Files
- `contracts/MerkleTreeWhitelist.sol`：主合约，实现了基于Merkle树的白名单系统和哈希验证功能
  > Main contract implementing Merkle tree-based whitelist system and hash verification functionality

### 脚本文件 | Script Files
- `scripts/CA_config.js`：配置文件，包含网络配置、合约ABI和地址信息
  > Configuration file containing network settings, contract ABI and address information

- `scripts/CA_getAllHashers.js`：获取合约中所有已验证的哈希值
  > Retrieve all verified hashes from the contract

- `scripts/CA_isHasherSet.js`：检查特定哈希值是否已被验证
  > Check if a specific hash has been verified

- `scripts/CA_uploadHasher.js`：将新的哈希值上传到合约
  > Upload new hash value to the contract

- `scripts/CA_verifyAndUseHasher.js`：验证并使用哈希值的零知识证明
  > Verify and use zero-knowledge proof of hash value

- `scripts/calculate_hash.js`：计算输入值的哈希值，生成电路输入
  > Calculate hash of input value and generate circuit input

- `scripts/run_all.js`：自动运行从计算哈希到生成证明的完整流程
  > Automatically run the complete process from hash calculation to proof generation

### 构建文件 | Build Files
- `build/circuits/input.json`：存储电路输入数据的配置文件
  > Configuration file storing circuit input data

### 配置文件 | Configuration Files
- `package.json`：项目依赖和脚本配置文件
  > Project dependencies and script configuration file


sudo node --expose-gc cold_start_benchmark.js
sudo node --expose-gc warm_start_benchmark.js
sudo node --expose-gc real_load_benchmark.js




## 部署信息 | Deployment Information
- 网络 | Network: Sepolia测试网 (Sepolia Testnet)
- 合约地址 | Contract Address: 0xd99c3961c3601E4a8D3a74879d5C4691E5469224 