const snarkjs = require("snarkjs");
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// File paths
const wasmPath = path.join(__dirname, '../build/circuits/police_verify_js/police_verify.wasm');
const zkeyPath = path.join(__dirname, '../build/circuits/police_verify_final.zkey');
const inputPath = path.join(__dirname, '../build/circuits/input.json');

// Test configuration
const config = {
    testRounds: 5,       // Total test rounds
    cooldownMs: 2000,    // Cooldown time between tests (ms)
    outputStats: true    // Whether to output detailed statistics
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

// Single proof generation function
async function generateProof(input, wasmFile, zkeyFile) {
    const startTime = process.hrtime.bigint();
    
    // Generate proof
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        wasmFile,
        zkeyFile
    );
    
    const endTime = process.hrtime.bigint();
    const timeNs = Number(endTime - startTime);
    
    return {
        timeNs,
        proof,
        publicSignals
    };
}

// Prepare for cold start
async function prepareColdStart() {
    console.log('\nPreparing for cold start...');
    
    // Force garbage collection
    forceGC();
    
    // Clear system cache
    await clearSystemCache();
    
    // Wait for system cooldown
    console.log(`Waiting for system cooldown ${config.cooldownMs}ms...`);
    await sleep(config.cooldownMs);
}

// Main benchmark function
async function runProofGenerationBenchmark() {
    try {
        console.log('Starting proof generation performance test...\n');
        console.log(`Configuration:
- Test rounds: ${config.testRounds}
- Cooldown time: ${config.cooldownMs}ms
`);

        // Read input file
        const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
        
        // Verify that all required files exist
        if (!fs.existsSync(wasmPath)) {
            throw new Error('WASM file not found');
        }
        if (!fs.existsSync(zkeyPath)) {
            throw new Error('Zkey file not found');
        }

        const times = [];
        let firstTime = null;
        let totalWitnessGenTime = 0;
        let totalProofGenTime = 0;

        // Execute tests
        for (let i = 0; i < config.testRounds; i++) {
            console.log(`\nExecuting test ${i + 1}/${config.testRounds}`);
            
            // Prepare for cold start
            await prepareColdStart();
            
            // Generate proof
            const result = await generateProof(input, wasmPath, zkeyPath);
            const timeMs = result.timeNs / 1_000_000;
            
            if (i === 0) {
                firstTime = timeMs;
                console.log(`First proof generation time: ${timeMs.toFixed(2)} ms`);
            } else {
                times.push(result.timeNs);
                console.log(`Current proof generation time: ${timeMs.toFixed(2)} ms`);
            }
        }

        // Calculate statistics
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);

        // Output results
        console.log('\n=== Test Results ===');
        console.log(`First proof generation time: ${firstTime.toFixed(2)} ms`);
        console.log(`Subsequent proof generation statistics:`);
        console.log(`- Average time: ${(avgTime / 1_000_000).toFixed(2)} ms`);
        console.log(`- Fastest time: ${(minTime / 1_000_000).toFixed(2)} ms`);
        console.log(`- Slowest time: ${(maxTime / 1_000_000).toFixed(2)} ms`);
        console.log(`- Throughput: ${(1000 / (avgTime / 1_000_000)).toFixed(2)} proofs/second`);

        // Output memory usage
        const memoryUsage = process.memoryUsage();
        console.log('\nMemory Usage:');
        console.log(`- Heap used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        console.log(`- Total heap: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);

    } catch (error) {
        console.error('Error occurred during test:', error);
    }
}

// Run benchmark
if (require.main === module) {
    runProofGenerationBenchmark().catch(console.error);
} 