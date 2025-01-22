const { web3, contract, account } = require('./CA_config');

async function verifyAndUseHasher(a, b, c, input) {
    try {
        console.log("Verifying and using hasher...");
        console.log("Parameters:");
        console.log("a:", a);
        console.log("b:", b);
        console.log("c:", c);
        console.log("input:", input);

        const tx = await contract.methods.verifyAndUseHasher(a, b, c, input).send({
            from: account.address,
            gas: 500000
        });

        console.log("\nTransaction successful!");
        console.log("Transaction hash:", tx.transactionHash);
        return tx;
    } catch (error) {
        console.error("Error verifying and using hasher:", error.message);
        throw error;
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    try {
        // 从命令行获取完整的参数字符串
        const fullParamsStr = process.argv[2] || '["0x2790dfbd961886f20fc54b1ab272bd4760f40b9f9b69a7d45c1c757efdee26ce", "0x2573a025562e8e35a4ddf44b42d3e3d0b225576b97d4bd5f9dbbea380af1b984"],[["0x1c7e42976cc14f92eda4a7bc1833570fb7ace398fedb701b80d6d42efb849b52", "0x0e19f3dfe382ec5ac73dcd3e3d2d71cd84083ac67d7e3daa9c01c76a2a4420a9"],["0x15b7f9886b4e7444391009b14255ec2795d5520808ebc4c92ce8837d5680052c", "0x1b9f4f6c04b26d3364fc5ced0dff90e99d97e8b665b1a8d249c8064174b27c9c"]],["0x0db9af99b49a6e879fdbfa7820d58922a9cda3fa333d7dcc2dd08b94f968b036", "0x174394d73494a9a2a260be623fa507420268ac7792644c0f97fd0d16e87f22ab"],["0x22d0ae462961c4cc15b7a368970afc115a29563a262963d28bf52035f73f2f7f"]'
        // 将字符串转换为数组
        const [a, b, c, input] = JSON.parse(`[${fullParamsStr}]`);

        console.log("Using parsed parameters...");
        verifyAndUseHasher(a, b, c, input)
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

module.exports = verifyAndUseHasher; 