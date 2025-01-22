const { web3, contract, account } = require('./CA_config');

async function uploadHasher(proof, hasher) {
    try {
        console.log("Uploading hasher...");
        console.log("Proof:", proof);
        console.log("Hasher:", hasher);

        // 确保 proof 是数组而不是字符串
        const proofArray = Array.isArray(proof) ? proof : JSON.parse(proof);

        const tx = await contract.methods.uploadHasher(proofArray, hasher).send({
            from: account.address,
            gas: 300000
        });

        console.log("\nTransaction successful!");
        console.log("Transaction hash:", tx.transactionHash);
        return tx;
    } catch (error) {
        console.error("Error uploading hasher:", error.message);
        throw error;
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    try {
        const proof = [
            "0x45cb360b8de848e34ed49afa65437bb2334852efb51e28a4b9c4f75c860ea83c",
            "0xdf909d5397157aba3a1ea60dd4764cb5b1bf3bf78b115a5fb6d010060cbd9a10"
        ];
        const hasher = "0x22d0ae462961c4cc15b7a368970afc115a29563a262963d28bf52035f73f2f7f";

        console.log("Using parameters:");
        console.log("Proof:", proof);
        console.log("Hasher:", hasher);

        uploadHasher(proof, hasher)
            .then(() => process.exit(0))
            .catch(error => {
                console.error(error);
                process.exit(1);
            });
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

module.exports = uploadHasher; 