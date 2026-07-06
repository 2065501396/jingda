#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const isWindows = os.platform() === 'win32';
const ALLOWED_COMMANDS = new Set(['vercel', 'npm', 'pnpm', 'yarn']);
function log(msg) { console.error(msg); }
function commandExists(cmd) {
  if (!ALLOWED_COMMANDS.has(cmd)) throw new Error(`Command not in whitelist: ${cmd}`);
  try {
    if (isWindows) { const r = spawnSync('where', [cmd], { stdio: 'ignore' }); return r.status === 0; }
    else { const r = spawnSync('sh', ['-c', `command -v "$1"`, '--', cmd], { stdio: 'ignore' }); return r.status === 0; }
  } catch { return false; }
}
function getCommandOutput(cmd, args) {
  try { const r = spawnSync(cmd, args, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], shell: isWindows }); return r.status === 0 ? (r.stdout || '').trim() : null; }
  catch { return null; }
}
function checkVercelInstalled() {
  if (!commandExists('vercel')) { log('Error: Vercel CLI not installed'); process.exit(1); }
  log(`Vercel CLI: ${getCommandOutput('vercel', ['--version']) || 'unknown'}`);
}
function checkLoginStatus() {
  try {
    const r = spawnSync('vercel', ['whoami'], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], shell: isWindows });
    const o = (r.stdout || '').trim();
    if (r.status === 0 && o && !o.includes('Error') && !o.includes('not logged in')) { log(`Logged in as: ${o}`); return true; }
  } catch {}
  return false;
}
function main() {
  const projectPath = process.argv[2] || '.';
  const absPath = path.resolve(projectPath);
  log('Deploying: ' + absPath);
  checkVercelInstalled();
  if (!checkLoginStatus()) { log('Error: Not logged in'); process.exit(1); }
  log('');
  log('Starting deployment to production...');
  log('');
  try {
    const result = spawnSync('vercel', ['--yes', '--prod'], {
      cwd: absPath, encoding: 'utf8', stdio: ['inherit', 'pipe', 'pipe'],
      timeout: 300000, shell: isWindows
    });
    const output = (result.stdout || '') + (result.stderr || '');
    log(output);
    if (result.status !== 0) throw new Error('Deploy failed');
    const aliasedMatch = output.match(/Aliased:\s*(https:\/\/[a-zA-Z0-9.-]+\.vercel\.app)/i);
    const deploymentMatch = output.match(/Production:\s*(https:\/\/[a-zA-Z0-9.-]+\.vercel\.app)/i);
    const finalUrl = aliasedMatch ? aliasedMatch[1] : (deploymentMatch ? deploymentMatch[1] : null);
    log('');
    log('========================================');
    log('Deployment successful!');
    if (finalUrl) { log('URL: ' + finalUrl); console.log(JSON.stringify({ status: 'success', url: finalUrl })); }
    else { console.log(JSON.stringify({ status: 'success', message: 'Deployment successful' })); }
  } catch (error) {
    log('Deployment failed: ' + (error.message || ''));
    process.exit(1);
  }
}
main();
