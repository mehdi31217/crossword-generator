// Debug logger — stores logs in-memory for export
const MAX_LOG = 2000;
const logs: string[] = [];

function fmt(): string {
  const d = new Date();
  return d.toISOString().slice(11, 23);
}

export const debug = {
  log(src: string, ...args: any[]) {
    const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
    const line = `[${fmt()}] [${src}] ${msg}`;
    console.log(`%c${line}`, 'color:#6366f1;font-weight:bold');
    logs.push(line);
    if (logs.length > MAX_LOG) logs.splice(0, logs.length - MAX_LOG);
  },

  warn(src: string, ...args: any[]) {
    const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
    const line = `[${fmt()}] [${src}] ⚠ ${msg}`;
    console.warn(`%c${line}`, 'color:#f59e0b;font-weight:bold');
    logs.push(line);
    if (logs.length > MAX_LOG) logs.splice(0, logs.length - MAX_LOG);
  },

  error(src: string, ...args: any[]) {
    const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
    const line = `[${fmt()}] [${src}] ❌ ${msg}`;
    console.error(`%c${line}`, 'color:#ef4444;font-weight:bold');
    logs.push(line);
    if (logs.length > MAX_LOG) logs.splice(0, logs.length - MAX_LOG);
  },

  getLogs(): string { return logs.join('\n'); },

  downloadLogs() {
    if (typeof document === 'undefined') return; // not available in Workers
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `debug-${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
};

// Expose to window for console access. Guarded so this module can also be
// imported inside a Web Worker (which has no `window`).
if (typeof window !== 'undefined') {
  (window as any).__debug = debug;
  (window as any).__downloadLogs = debug.downloadLogs;
  (window as any).__getLogs = debug.getLogs;
}
