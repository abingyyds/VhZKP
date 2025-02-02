const snarkjs = require("snarkjs");
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Read proof and public input
const proofPath = path.join(__dirname, '../build/circuits/proof.json');
const publicPath = path.join(__dirname, '../build/circuits/public.json');
const vkeyPath = path.join(__dirname, '../build/circuits/verification_key.json');

// Load test configuration
const config = {
    totalUsers: 5,           // Total number of users
    requestsPerUser: 20,     // Number of requests per user
    cooldownMs: 2000         // Cooldown time between users (ms)
};

// Clear system cache (only works on Linux/macOS)
async function clearSystemCache() {
    try {
        if (process.platform === 'darwin') {
            // macOS
            await execAsync('sudo purge');
        } else if (process.platform === 'linux') {
            // Linux
            await execAsync('sync && echo 3 | sudo tee /proc/sys/vm/drop_caches');
        }
        console.log('System cache cleared');
    } catch (error) {
        console.log('Failed to clear system cache, sudo permission may be required');
    }
}

// Force garbage collection
function forceGC() {
    try {
        if (global.gc) {
            global.gc();
            console.log('V8 garbage collection executed');
        }
    } catch (error) {
        console.log('Failed to force garbage collection, please run Node.js with --expose-gc flag');
    }
}

// Sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Single verification function
async function singleVerification(proof, publicSignals, vkey) {
    const startTime = process.hrtime.bigint();
    const result = await snarkjs.groth16.verify(vkey, publicSignals, proof);
    const endTime = process.hrtime.bigint();
    return {
        timeNs: Number(endTime - startTime),
        success: result
    };
}

// Simulate single user
async function simulateUser(userId, proof, publicSignals, vkey) {
    console.log(`\nUser ${userId} starting verification tests...`);
    const times = [];
    let firstTime = null;
    const startTime = process.hrtime.bigint();

    for (let i = 0; i < config.requestsPerUser; i++) {
        const result = await singleVerification(proof, publicSignals, vkey);
        const timeMs = result.timeNs / 1_000_000;

        if (i === 0) {
            firstTime = timeMs;
            console.log(`User ${userId} - First verification time: ${timeMs.toFixed(2)} ms`);
        } else {
            times.push(result.timeNs);
            console.log(`User ${userId} - Request ${i + 1}/${config.requestsPerUser}: ${timeMs.toFixed(2)} ms`);
        }
    }

    const endTime = process.hrtime.bigint();
    const totalTimeMs = Number(endTime - startTime) / 1_000_000;

    // Calculate statistics
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    return {
        userId,
        firstTime,
        avgTime: avgTime / 1_000_000,
        minTime: minTime / 1_000_000,
        maxTime: maxTime / 1_000_000,
        totalTimeMs
    };
}

// Main function
async function runRealLoadBenchmark() {
    try {
        console.log('Starting real load performance test...\n');
        console.log(`Configuration:
- Total users: ${config.totalUsers}
- Requests per user: ${config.requestsPerUser}
- Cooldown time between users: ${config.cooldownMs}ms
`);

        // Read necessary files
        const proof = JSON.parse(fs.readFileSync(proofPath, 'utf8'));
        const publicSignals = JSON.parse(fs.readFileSync(publicPath, 'utf8'));
        const vkey = JSON.parse(fs.readFileSync(vkeyPath, 'utf8'));

        const userResults = [];
        const startTime = process.hrtime.bigint();

        // Execute tests for each user sequentially
        for (let userId = 1; userId <= config.totalUsers; userId++) {
            // Clear cache and force GC before each user
            await clearSystemCache();
            forceGC();
            
            const result = await simulateUser(userId, proof, publicSignals, vkey);
            userResults.push(result);

            if (userId < config.totalUsers) {
                console.log(`\nCooldown period between users (${config.cooldownMs}ms)...`);
                await sleep(config.cooldownMs);
            }
        }

        const endTime = process.hrtime.bigint();
        const totalTimeWithCooldownMs = Number(endTime - startTime) / 1_000_000;
        const totalTimeWithoutCooldownMs = userResults.reduce((sum, r) => sum + r.totalTimeMs, 0);

        // Output results
        console.log('\n=== Test Results ===');
        
        // Individual user results
        userResults.forEach(result => {
            console.log(`\nUser ${result.userId} Statistics:`);
            console.log(`- First verification time: ${result.firstTime.toFixed(2)} ms`);
            console.log(`- Average time: ${result.avgTime.toFixed(2)} ms`);
            console.log(`- Fastest time: ${result.minTime.toFixed(2)} ms`);
            console.log(`- Slowest time: ${result.maxTime.toFixed(2)} ms`);
            console.log(`- Total execution time: ${result.totalTimeMs.toFixed(2)} ms`);
        });

        // Overall system performance
        console.log('\nSystem Performance:');
        console.log(`- Total execution time (with cooldowns): ${totalTimeWithCooldownMs.toFixed(2)} ms`);
        console.log(`- Total execution time (without cooldowns): ${totalTimeWithoutCooldownMs.toFixed(2)} ms`);
        console.log(`- Average time per verification: ${(totalTimeWithoutCooldownMs / (config.totalUsers * config.requestsPerUser)).toFixed(2)} ms`);
        console.log(`- Effective throughput: ${((config.totalUsers * config.requestsPerUser) / (totalTimeWithoutCooldownMs / 1000)).toFixed(2)} verifications/second`);

        // Output memory usage
        const memoryUsage = process.memoryUsage();
        console.log('\nMemory Usage:');
        console.log(`- Heap used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        console.log(`- Total heap: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);

    } catch (error) {
        console.error('Error occurred during test:', error);
    }
}

// Run test
if (require.main === module) {
    runRealLoadBenchmark().catch(console.error);
} 