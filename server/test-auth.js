// Test patient login through the live server's auth endpoint
const http = require('http');

function post(path, body) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body);
    const req = http.request({
      host: 'localhost', port: 5001, path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(d) }); } catch(e) { resolve({ status: res.statusCode, body: d }); } });
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.write(data);
    req.end();
  });
}

(async () => {
  // Health check
  const h = await new Promise(resolve => {
    http.get({ host: 'localhost', port: 5001, path: '/api/health' }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { resolve(JSON.parse(d)); });
    }).on('error', e => resolve({ error: e.message }));
  });
  console.log('Health:', JSON.stringify(h));

  // Try patient login
  const r = await post('/api/auth/login', { email: 'sunil.kumara@gmail.com', password: 'Patient@1234' });
  console.log('Patient login status:', r.status);
  console.log('Patient login body:', JSON.stringify(r.body).substring(0, 300));
})();
