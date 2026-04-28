/**
 * 📊 Auto Performance Report Generator
 * 
 * Runs k6 tests and generates an HTML performance report.
 * 
 * Usage:
 *   node tests/load/generate-report.js
 * 
 * This will:
 *   1. Run the full load test suite
 *   2. Save JSON results
 *   3. Generate a styled HTML report
 *   4. Open it in your browser
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const K6_PATH = 'C:\\Program Files\\k6\\k6.exe';
const RESULTS_FILE = join(__dirname, 'results.json');
const REPORT_FILE = join(__dirname, 'performance-report.html');

// ── Step 1: Run k6 with JSON output ─────────────────────────────
console.log('\n🚀 Running k6 load tests...\n');

try {
    execSync(
        `"${K6_PATH}" run --out json="${RESULTS_FILE}" tests/load/run-all.js`,
        { stdio: 'inherit', cwd: join(__dirname, '..', '..') }
    );
} catch {
    console.log('\n⚠️  Tests completed with some threshold failures. Generating report anyway...\n');
}

// ── Step 2: Parse results ────────────────────────────────────────
if (!existsSync(RESULTS_FILE)) {
    console.error('❌ No results file found. Make sure k6 ran successfully.');
    process.exit(1);
}

const lines = readFileSync(RESULTS_FILE, 'utf8').trim().split('\n');
const metrics = {};

for (const line of lines) {
    try {
        const obj = JSON.parse(line);
        if (obj.type === 'Point') {
            const name = obj.metric;
            if (!metrics[name]) metrics[name] = [];
            metrics[name].push(obj.data.value);
        }
    } catch { /* skip malformed lines */ }
}

// Calculate stats
function calcStats(values) {
    if (!values || values.length === 0) return { avg: 0, min: 0, max: 0, p90: 0, p95: 0 };
    const sorted = [...values].sort((a, b) => a - b);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const p90 = sorted[Math.floor(sorted.length * 0.90)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    return {
        avg: avg.toFixed(0),
        min: sorted[0].toFixed(0),
        max: sorted[sorted.length - 1].toFixed(0),
        p90: p90.toFixed(0),
        p95: p95.toFixed(0),
    };
}

const duration = calcStats(metrics['http_req_duration']);
const failedVals = metrics['http_req_failed'] || [];
const totalReqs = metrics['http_reqs']?.length || 0;
const failRate = failedVals.length > 0
    ? ((failedVals.filter(v => v === 1).length / failedVals.length) * 100).toFixed(1)
    : '0.0';

const passed = parseFloat(failRate) < 30 && parseFloat(duration.p95) < 1500;
const status = passed ? '✅ PASSED' : '❌ FAILED';
const statusColor = passed ? '#22c55e' : '#ef4444';

const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

// ── Step 3: Generate HTML Report ────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>k6 Performance Report — GenZ Clothes</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; padding: 2rem; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; color: #f8fafc; }
    .subtitle { color: #94a3b8; margin-bottom: 2rem; font-size: 0.9rem; }
    .badge { display: inline-block; padding: 0.4rem 1.2rem; border-radius: 999px; font-weight: 700; font-size: 1.1rem; color: #fff; background: ${statusColor}; margin-bottom: 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .card { background: #1e293b; border-radius: 12px; padding: 1.5rem; border: 1px solid #334155; }
    .card .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 0.5rem; }
    .card .value { font-size: 2rem; font-weight: 700; color: #f1f5f9; }
    .card .unit { font-size: 0.8rem; color: #94a3b8; margin-left: 4px; }
    .section { background: #1e293b; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; border: 1px solid #334155; }
    .section h2 { margin-bottom: 1rem; color: #f1f5f9; font-size: 1rem; text-transform: uppercase; letter-spacing: 0.05em; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 0.75rem 1rem; background: #0f172a; font-size: 0.75rem; text-transform: uppercase; color: #64748b; }
    td { padding: 0.75rem 1rem; border-top: 1px solid #334155; font-size: 0.9rem; }
    .good { color: #22c55e; font-weight: 600; }
    .bad  { color: #ef4444; font-weight: 600; }
    .warn { color: #f59e0b; font-weight: 600; }
    footer { text-align: center; margin-top: 2rem; color: #475569; font-size: 0.8rem; }
  </style>
</head>
<body>
  <h1>⚡ k6 Performance Report</h1>
  <div class="subtitle">GenZ Clothes API • Generated: ${timestamp}</div>
  <div class="badge">${status}</div>

  <div class="grid">
    <div class="card">
      <div class="label">Total Requests</div>
      <div class="value">${totalReqs.toLocaleString()}<span class="unit">reqs</span></div>
    </div>
    <div class="card">
      <div class="label">Avg Response Time</div>
      <div class="value">${duration.avg}<span class="unit">ms</span></div>
    </div>
    <div class="card">
      <div class="label">p95 Response Time</div>
      <div class="value" style="color: ${parseFloat(duration.p95) < 1500 ? '#22c55e' : '#ef4444'}">${duration.p95}<span class="unit">ms</span></div>
    </div>
    <div class="card">
      <div class="label">Failure Rate</div>
      <div class="value" style="color: ${parseFloat(failRate) < 30 ? '#22c55e' : '#ef4444'}">${failRate}<span class="unit">%</span></div>
    </div>
    <div class="card">
      <div class="label">Min Response</div>
      <div class="value">${duration.min}<span class="unit">ms</span></div>
    </div>
    <div class="card">
      <div class="label">Max Response</div>
      <div class="value">${duration.max}<span class="unit">ms</span></div>
    </div>
  </div>

  <div class="section">
    <h2>Response Time Distribution</h2>
    <table>
      <tr><th>Percentile</th><th>Value</th><th>Threshold</th><th>Status</th></tr>
      <tr>
        <td>p90</td>
        <td>${duration.p90}ms</td>
        <td>&lt; 1200ms</td>
        <td class="${parseFloat(duration.p90) < 1200 ? 'good' : 'bad'}">${parseFloat(duration.p90) < 1200 ? '✅ Pass' : '❌ Fail'}</td>
      </tr>
      <tr>
        <td>p95</td>
        <td>${duration.p95}ms</td>
        <td>&lt; 1500ms</td>
        <td class="${parseFloat(duration.p95) < 1500 ? 'good' : 'bad'}">${parseFloat(duration.p95) < 1500 ? '✅ Pass' : '❌ Fail'}</td>
      </tr>
      <tr>
        <td>p99</td>
        <td>${duration.max}ms (est.)</td>
        <td>&lt; 3000ms</td>
        <td class="${parseFloat(duration.max) < 3000 ? 'good' : 'bad'}">${parseFloat(duration.max) < 3000 ? '✅ Pass' : '❌ Fail'}</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <h2>Failure Analysis</h2>
    <table>
      <tr><th>Metric</th><th>Value</th><th>Threshold</th><th>Status</th></tr>
      <tr>
        <td>HTTP Failure Rate</td>
        <td>${failRate}%</td>
        <td>&lt; 30% (cart 401s expected)</td>
        <td class="${parseFloat(failRate) < 30 ? 'good' : 'bad'}">${parseFloat(failRate) < 30 ? '✅ Pass' : '❌ Fail'}</td>
      </tr>
    </table>
  </div>

  <footer>k6 v1.6.1 • GenZ Clothes Load Test Suite • ${timestamp}</footer>
</body>
</html>`;

writeFileSync(REPORT_FILE, html);
console.log(`\n✅ HTML Report generated: ${REPORT_FILE}`);

// ── Step 4: Open in browser ──────────────────────────────────────
try {
    execSync(`start "" "${REPORT_FILE}"`, { stdio: 'ignore' });
    console.log('🌐 Opening report in browser...\n');
} catch {
    console.log('📄 Open this file in your browser:', REPORT_FILE, '\n');
}
