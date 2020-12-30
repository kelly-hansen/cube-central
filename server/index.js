require('dotenv/config');
const pg = require('pg');
const express = require('express');
const staticMiddleware = require('./static-middleware');
const ClientError = require('./client-error');
const errorMiddleware = require('./error-middleware');
const argon2 = require('argon2');

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

const app = express();

app.use(staticMiddleware);

const jsonMiddleware = express.json();

app.use(jsonMiddleware);

app.post('/api/auth/sign-up', (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new ClientError(400, 'Username and Password are required fields.');
  }
  if (password.length < 8) {
    throw new ClientError(400, 'Password must be at least 8 characters.');
  }
  argon2
    .hash(password)
    .then(hashedPassword => {
      const timestamp = 'now()';
      const sql = `
      insert into "users" ("username", "hashedPassword", "joinDate")
      values ($1, $2, $3)
      returning "userId", "username", "joinDate";
      `;
      const params = [username, hashedPassword, timestamp];
      return db.query(sql, params);
    })
    .then(result => {
      const [userData] = result.rows;
      res.status(201).json(userData);
    })
    .catch(err => next(err));
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`express server listening on port ${process.env.PORT}`);
});
