const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

// Sample leaves data - 修正地址格式，确保每个地址都是有效的
const leaves = [
    "0x53B38Da6a701c568545dCfcB03f87B87556BeddC5",
    "0xA4B4F364C96d1Ce98b49Ae9C7dD39131855Cb3B2",
    "0x4B20993BC481177ec7E8f51c7ecA2b8A92E020edb",
    "0x78713DcA6b7B34ac0F824c42a7C18A495cabaB"
];

// 直接对原始数据进行哈希处理
const hashedLeaves = leaves.map(leaf => keccak256(leaf));

// Generate Merkle Tree
const tree = new MerkleTree(hashedLeaves, keccak256, { 
    sortPairs: true
});

// 输出 Merkle Root
console.log('\nRoot:');
console.log(tree.getHexRoot());

// 输出叶子节点的哈希值
console.log('\nLeaves:');
console.log(hashedLeaves.map(leaf => '0x' + leaf.toString('hex')));

// 输出所有层级
console.log('\nLayers:');
console.log(JSON.stringify(tree.getLayers().map(layer => 
    layer.map(x => '0x' + x.toString('hex'))
), null, 2));

console.log("\nProofs for each leaf:");
for (let i = 0; i < hashedLeaves.length; i++) {
    const hashedLeaf = '0x' + hashedLeaves[i].toString('hex');
    console.log(`\nLeaf #${i} - ${hashedLeaf}`);
    console.log("Proof:");
    const proof = tree.getHexProof(hashedLeaves[i]);
    console.log(JSON.stringify(proof, null, 2));
}
