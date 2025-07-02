const express = require('express');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
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

    // Copy runner.js
    const runnerSrc = path.resolve(__dirname, '../runner/javascript/template/runner.js');
    const runnerDest = path.join(tempDir, 'runner.js');
    fs.copyFileSync(runnerSrc, runnerDest);

    const results = [];

    try {
        for (let test of problem.testCases) {
            // Always pass input as a JSON array
            const input = test.input;
            const cmd = [
                'node', 'runner.js', JSON.stringify(JSON.parse(input))
            ];
            const output = execSync(cmd.join(' '), { cwd: tempDir, timeout: 2000 }).toString().trim();

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
