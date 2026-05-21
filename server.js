// Cloud Connector — deployment placeholder / env-check app.
//
// The managed-application template (arm/main.bicep) deploys the three Container
// Apps with THIS image instead of the real private images, so the install
// succeeds without any registry credential (Marketplace Certification Policy
// 300.4.4 — no hardcoded credentials in the package). After the install the
// publisher swaps in the real private images and applies the ACR pull token;
// see arm/upgrade.ps1.
//
// It listens on $PORT (default 80 — the UI app has no PORT and serves 80),
// always returns HTTP 200 so the Container Apps health probe passes, and logs
// which expected environment variables resolved — a smoke test of the template
// wiring. It NEVER prints secret values.

'use strict';

const http = require('http');

const PORT = parseInt(process.env.PORT, 10) || 80;

// Env vars the real backend / service / UI images consume. One placeholder
// image serves all three apps, so this is the union — vars missing for a given
// app are expected and do NOT affect health.
const EXPECTED = [
  'PORT',
  'MONGODB_URI',
  'MONGODB_STORAGE_URI',
  'AZURE_TENANT_ID',
  'AZURE_API_CLIENT_ID',
  'AZURE_API_CLIENT_SECRET',
  'AZURE_MI_CLIENT_ID',
  'AZURE_SERVICE_CLIENT_ID',
  'AZURE_SERVICE_CLIENT_SECRET',
  'ENCRYPTION_SECRET',
  'CONNECTOR_SERVICE_URL',
  'CONNECTOR_API_URL',
  'PLAN_TIER',
  'AZURE_STORAGE_CONNECTION_STRING',
  'VITE_API_BASE_URL',
  'VITE_AZURE_CLIENT_ID',
  'VITE_AZURE_TENANT_ID',
];

function envReport() {
  return EXPECTED.map((name) => {
    const v = process.env[name];
    const state = v === undefined ? 'MISSING' : (v === '' ? 'EMPTY' : 'set');
    return { name, state };
  });
}

const report = envReport();
console.log('[placeholder] Cloud Connector deployment placeholder starting');
console.log('[placeholder] listening port: ' + PORT);
for (const r of report) {
  console.log('[placeholder] env ' + r.name + ': ' + r.state);
}
const notSet = report.filter((r) => r.state !== 'set').map((r) => r.name);
console.log('[placeholder] env-check: ' + (report.length - notSet.length) +
  '/' + report.length + ' set' +
  (notSet.length ? ' — not set (may be expected for this app): ' + notSet.join(', ') : ''));

const BODY = '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<title>Cloud Connector</title></head>' +
  '<body style="font-family:system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1.5rem;color:#222">' +
  '<h1>Cloud Connector</h1>' +
  '<p>This service has been provisioned and is awaiting activation.</p>' +
  '<p>The Datawareness team applies the application image as the final ' +
  'installation step. No action is required from you.</p>' +
  '</body></html>';

const server = http.createServer((req, res) => {
  // Always 200 — the Container Apps health probe must pass so the deployment
  // succeeds. The env-var check above is observability only, never a gate.
  if (req.url === '/healthz' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('ok');
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(BODY);
});

server.listen(PORT, () => {
  console.log('[placeholder] ready on ' + PORT);
});
