const { JWT_SECRET: secretFromMiddleware } = require('./middleware/auth');
const auth = require('./routes/auth');
const users = require('./routes/users');
const jwt = require('jsonwebtoken');

console.log('secretFromMiddleware:', secretFromMiddleware);

const token = jwt.sign({ id: 1 }, secretFromMiddleware);
try {
  const verified = jwt.verify(token, secretFromMiddleware);
  console.log('Verification succeeded:', verified);
} catch (e) {
  console.error('Verification failed:', e.message);
}
