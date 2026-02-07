import { execSync } from 'node:child_process';

function usage() {
  // eslint-disable-next-line no-console
  console.log('Usage: node scripts/kill-port.mjs <port>');
}

const portArg = process.argv[2];
const port = Number(portArg);

if (!portArg || !Number.isFinite(port) || port <= 0) {
  usage();
  process.exit(2);
}

function run(cmd) {
  return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
}

function killPid(pid) {
  if (!pid || !Number.isFinite(pid) || pid <= 0) return;

  if (process.platform === 'win32') {
    // Force-kill process tree.
    try {
      execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
    } catch {
      // ignore
    }
    return;
  }

  try {
    process.kill(pid, 'SIGKILL');
  } catch {
    // ignore
  }
}

function killPortWin32(targetPort) {
  let out = '';
  try {
    out = run('netstat -ano -p tcp');
  } catch {
    return [];
  }

  const pids = new Set();
  for (const line of out.split(/\r?\n/)) {
    // Example:
    //   TCP    127.0.0.1:3001         0.0.0.0:0              LISTENING       26776
    if (!/\bLISTENING\b/i.test(line)) continue;
    const parts = line.trim().split(/\s+/);
    if (parts.length < 5) continue;
    const localAddress = parts[1];
    const pid = Number(parts[4]);

    if (localAddress.endsWith(`:${targetPort}`) && Number.isFinite(pid)) {
      pids.add(pid);
    }
  }

  for (const pid of pids) killPid(pid);
  return [...pids];
}

function killPortUnix(targetPort) {
  const pids = new Set();

  // Prefer lsof if available.
  try {
    const out = run(`lsof -ti tcp:${targetPort} -sTCP:LISTEN`);
    for (const line of out.split(/\r?\n/)) {
      const pid = Number(line.trim());
      if (Number.isFinite(pid)) pids.add(pid);
    }
  } catch {
    // ignore
  }

  for (const pid of pids) killPid(pid);
  return [...pids];
}

const killed = process.platform === 'win32' ? killPortWin32(port) : killPortUnix(port);

// eslint-disable-next-line no-console
console.log(`kill-port: port=${port} killed=${killed.length}`);
