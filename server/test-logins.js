const http = require('http');

function testLogin(email, password, label) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ email, password });
    const req = http.request(
      { host: 'localhost', port: 5001, path: '/api/auth/login', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          try {
            const j = JSON.parse(d);
            if (j.success) {
              console.log('[OK]  ', label.padEnd(28), '→ role:', j.data.user.role, '| verification:', j.data.user.verificationStatus || 'N/A');
            } else {
              console.log('[FAIL]', label.padEnd(28), '→', j.message);
            }
          } catch (e) {
            console.log('[ERR] ', label, d.substring(0, 100));
          }
          resolve();
        });
      }
    );
    req.on('error', (e) => { console.log('[ERR] ', label, e.message); resolve(); });
    req.write(body);
    req.end();
  });
}

(async () => {
  console.log('\n── Login Tests ──────────────────────────────────────────\n');
  await testLogin('superadmin@healthcare.lk',        'Admin@1234',   'Super Admin');
  await testLogin('admin@nawaloka.lk',                'Admin@1234',   'Hospital Admin');
  await testLogin('dr.dissanayake@nawaloka.lk',       'Doctor@1234',  'Doctor Dissanayake');
  await testLogin('sunil.kumara@gmail.com',            'Patient@1234', 'Patient Sunil');
  console.log('\n────────────────────────────────────────────────────────\n');
})();
