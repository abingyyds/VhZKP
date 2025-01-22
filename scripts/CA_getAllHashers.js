const { web3, contract } = require('./CA_config');

async function getAllHashers() {
    try {
        console.log("Getting all hashers...");
        const hashers = await contract.methods.getAllHashers().call();
        console.log("\nAll hashers:", hashers);
        return hashers;
    } catch (error) {
        console.error("Error getting all hashers:", error);
        throw error;
    }
}

// 立即执行函数
(async () => {
    try {
        await getAllHashers();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();

module.exports = getAllHashers; 