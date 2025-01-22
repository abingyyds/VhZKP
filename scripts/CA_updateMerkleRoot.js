const { web3, contract, account } = require('./CA_config');

async function updateMerkleRoot(newRoot) {
    try {
        console.log("Updating Merkle root...");
        console.log("New root:", newRoot);

        const tx = await contract.methods.updateMerkleRoot(newRoot).send({
            from: account.address,
            gas: 200000
        });

        console.log("\nTransaction successful!");
        console.log("Transaction hash:", tx.transactionHash);
        return tx;
    } catch (error) {
        console.error("Error updating Merkle root:", error.message);
        throw error;
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const newRoot = process.argv[2] || "0x0";
    
    updateMerkleRoot(newRoot)
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = updateMerkleRoot; 