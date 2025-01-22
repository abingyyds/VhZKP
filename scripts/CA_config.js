// 禁用废弃警告
process.noDeprecation = true;

const { Web3 } = require('web3');

// 合约 ABI - 从合约代码生成
const contractABI = [
    {
        "inputs": [{"internalType": "bytes32", "name": "_merkleRoot", "type": "bytes32"},
                  {"internalType": "address", "name": "_verifier", "type": "address"}],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [{"internalType": "bytes32[]", "name": "proof", "type": "bytes32[]"},
                  {"internalType": "bytes32", "name": "_hasher", "type": "bytes32"}],
        "name": "uploadHasher",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "bytes32", "name": "_hasher", "type": "bytes32"}],
        "name": "isHasherSet",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAllHashers",
        "outputs": [{"internalType": "bytes32[]", "name": "", "type": "bytes32[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256[2]", "name": "a", "type": "uint256[2]"},
                  {"internalType": "uint256[2][2]", "name": "b", "type": "uint256[2][2]"},
                  {"internalType": "uint256[2]", "name": "c", "type": "uint256[2]"},
                  {"internalType": "uint256[1]", "name": "input", "type": "uint256[1]"}],
        "name": "verifyAndUseHasher",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "bytes32", "name": "_newRoot", "type": "bytes32"}],
        "name": "updateMerkleRoot",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// 配置
const config = {
    infuraUrl: "https://sepolia.infura.io/v3/5509941f428c4f3e80686ac9f080dbdc",
    privateKey: "0xd7279c31397e3218c90007a9a6f7f11a47194dcde739dc142229f2f9d538d6f0",
    contractAddress: "0xd99c3961c3601E4a8D3a74879d5C4691E5469224"
};

// 初始化Web3
const web3 = new Web3(config.infuraUrl);

// 添加账户
const account = web3.eth.accounts.privateKeyToAccount(config.privateKey);
web3.eth.accounts.wallet.add(account);

// 合约实例 - 修改创建方式
const contract = {
    methods: new web3.eth.Contract(
        contractABI,
        config.contractAddress
    ).methods
};

module.exports = {
    web3,
    contract,
    account,
    config
}; 