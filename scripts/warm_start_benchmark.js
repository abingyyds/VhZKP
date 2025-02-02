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

// Warm start test configuration
const config = {
    testRounds: 10,      // Total test rounds
    warmupRounds: 10,    // Number of warmup rounds before each test
    cooldownMs: 2000     // Cooldown time between tests (ms)
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

// Reload modules and files
async function reloadModules() {
    // Clear require cache
    Object.keys(require.cache).forEach(key => {
        delete require.cache[key];
    });
    
    // Reload snarkjs
    const newSnarkjs = require('snarkjs');
    return newSnarkjs;
}

// Execute cold start preparation
async function prepareColdStart() {
    console.log('\nExecuting cold start preparation...');
    
    // Force garbage collection
    forceGC();
    
    // Clear system cache
    await clearSystemCache();
    
    // Wait for system cooldown
    console.log(`Waiting for system cooldown ${config.cooldownMs}ms...`);
    await sleep(config.cooldownMs);
    
    // Reload modules
    const newSnarkjs = await reloadModules();
    return newSnarkjs;
}

// Single verification function
async function singleVerification(proof, publicSignals, vkey, snarkjsInstance) {
    const startTime = process.hrtime.bigint();
    const result = await snarkjsInstance.groth16.verify(vkey, publicSignals, proof);
    const endTime = process.hrtime.bigint();
    return {
        timeNs: Number(endTime - startTime),
        success: result
    };
}

// Sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Warmup function
async function warmup(proof, publicSignals, vkey, snarkjsInstance, rounds) {
    console.log(`Executing ${rounds} warmup rounds...`);
    for (let i = 0; i < rounds; i++) {
        await snarkjsInstance.groth16.verify(vkey, publicSignals, proof);
    }
}

// Main function
async function runWarmStartBenchmark() {
    try {
        console.log('Starting warm start performance test...\n');
        console.log(`Configuration:
- Test rounds: ${config.testRounds}
- Warmup rounds: ${config.warmupRounds}
- Cooldown time: ${config.cooldownMs}ms
`);

        // Read necessary files
        const proof = JSON.parse(fs.readFileSync(proofPath, 'utf8'));
        const publicSignals = JSON.parse(fs.readFileSync(publicPath, 'utf8'));
        const vkey = JSON.parse(fs.readFileSync(vkeyPath, 'utf8'));

        const times = [];
        let firstTime = null;

        // Execute tests
        for (let i = 0; i < config.testRounds; i++) {
            console.log(`\nExecuting test ${i + 1}/${config.testRounds}`);
            
            // Execute cold start preparation before each test
            const snarkjsInstance = await prepareColdStart();

            // Warmup
            await warmup(proof, publicSignals, vkey, snarkjsInstance, config.warmupRounds);
            
            // Execute verification
            const result = await singleVerification(proof, publicSignals, vkey, snarkjsInstance);
            const timeMs = result.timeNs / 1_000_000;
            
            if (i === 0) {
                firstTime = timeMs;
                console.log(`First verification time after warmup: ${timeMs.toFixed(2)} ms`);
            } else {
                times.push(result.timeNs);
                console.log(`Current verification time after warmup: ${timeMs.toFixed(2)} ms`);
            }
        }

        // Calculate statistics
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);

        // Output results
        console.log('\n=== Test Results ===');
        console.log(`First verification time after warmup: ${firstTime.toFixed(2)} ms`);
        console.log(`Subsequent verification statistics:`);
        console.log(`- Average time: ${(avgTime / 1_000_000).toFixed(2)} ms`);
        console.log(`- Fastest time: ${(minTime / 1_000_000).toFixed(2)} ms`);
        console.log(`- Slowest time: ${(maxTime / 1_000_000).toFixed(2)} ms`);

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
    runWarmStartBenchmark().catch(console.error);
} 