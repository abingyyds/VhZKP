const { web3, contract } = require('./CA_config');

async function isHasherSet(hasher) {
    try {
        console.log("Checking hasher status for:", hasher);
        const result = await contract.methods.isHasherSet(hasher).call();
        console.log("\nHasher status:", result);
        return result;
    } catch (error) {
        console.error("Error checking hasher status:", error);
        throw error;
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const hasher = process.argv[2];
    if (!hasher) {
        console.error("Please provide a hasher value");
        process.exit(1);
    }

    isHasherSet(hasher)
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = isHasherSet; 