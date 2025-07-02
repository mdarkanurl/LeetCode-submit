const express = require('express');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { v4: uuid } = require('uuid');

const app = express();
app.use(express.json());

app.post('/api/submit', async (req, res) => {
    const { problemId, code } = req.body;

    // Load problem test cases
    const problem = JSON.parse(fs.readFileSync(`./problems/${problemId}.json`, 'utf-8'));

    // Create temp directory for this run
    const submissionId = uuid();
    const tempDir = path.join(__dirname, 'temp', submissionId);
    fs.mkdirSync(tempDir, { recursive: true });

    // Save user code to temp dir
    const userCodePath = path.join(tempDir, 'user_code.js');
    fs.writeFileSync(userCodePath, code);

    // Save function name to temp dir
    const functionNamePath = path.join(tempDir, 'function_name.txt');
    fs.writeFileSync(functionNamePath, problem.functionName);

    // Copy runner.js
    const runnerSrc = path.resolve(__dirname, '../runner/javascript/template/runner.js');
    const runnerDest = path.join(tempDir, 'runner.js');
    fs.copyFileSync(runnerSrc, runnerDest);

    const results = [];

    try {
        for (let test of problem.testCases) {
            // Always pass input as a JSON array or string
            const input = test.input;
            const dockerArgs = [
                'run', '--rm',
                '-v', `${tempDir}:/app`,
                '--memory', '100m', '--cpus', '0.5',
                'leetcode-js',
                'node', 'runner.js', JSON.stringify(JSON.parse(input))
            ];
            const result = spawnSync('docker', dockerArgs, { cwd: tempDir, timeout: 10000, encoding: 'utf-8' });

            if (result.error) throw result.error;
            if (result.status !== 0) throw new Error(result.stderr);

            const output = result.stdout.trim();
            const passed = JSON.stringify(JSON.parse(output)) === JSON.stringify(JSON.parse(test.expected));
            results.push({
                input: test.input,
                output,
                expected: test.expected,
                passed
            });
        }

        const allPassed = results.every(r => r.passed);

        res.json({ status: 'success', results, passedAll: allPassed });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Execution failed', details: err.message });
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
