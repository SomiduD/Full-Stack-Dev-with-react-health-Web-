require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare').then(async () => {
  const db = mongoose.connection.db;
  const col = db.collection('users');
  const u = await col.findOne({ email: 'sunil.kumara@gmail.com' });
  console.log('email:', u.email);
  console.log('role:', u.role);
  console.log('isActive:', u.isActive);
  console.log('passwordHash starts with:', u.passwordHash?.substring(0, 30));
  const candidates = ['Patient@1234', 'Patient@123', 'patient@1234'];
  for (const c of candidates) {
    const ok = await bcrypt.compare(c, u.passwordHash);
    console.log(ok ? '✅' : '❌', c);
  }
  await mongoose.disconnect();
  process.exit(0);
}).catch(e => { console.log('err', e.message); process.exit(1); });
