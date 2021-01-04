require('dotenv/config');
const pg = require('pg');
const format = require('pg-format');
const express = require('express');
const staticMiddleware = require('./static-middleware');
const authorizationMiddleware = require('./authorization-middleware');
const ClientError = require('./client-error');
const errorMiddleware = require('./error-middleware');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

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

app.post('/api/auth/log-in', (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new ClientError(401, 'Invalid login');
  }
  const sql = `
  select "userId",
         "hashedPassword",
         "joinDate"
    from "users"
   where "username" = $1;
  `;
  const params = [username];
  db.query(sql, params)
    .then(result => {
      const [userInfo] = result.rows;
      if (!userInfo) {
        throw new ClientError(401, 'Invalid login');
      }
      const { userId, hashedPassword, joinDate } = userInfo;
      return argon2
        .verify(hashedPassword, password)
        .then(isMatching => {
          if (!isMatching) {
            throw new ClientError(401, 'Invalid login');
          }
          const payload = { userId, username, joinDate };
          const token = jwt.sign(payload, process.env.TOKEN_SECRET);
          res.json({ token, user: payload });
        });
    })
    .catch(err => next(err));
});

app.use(authorizationMiddleware);

app.post('/api/new-record', (req, res, next) => {
  const { userId } = req.user;
  const { puzzleType, recordType, solves } = req.body;
  if (!puzzleType || !recordType || !solves) {
    throw new ClientError(400, 'puzzleType, recordType, and solves are required fields');
  }
  const recordDate = 'now()';
  const newRecordSql = `
  insert into "records" ("userId", "puzzleTypeId", "recordTypeId", "recordDate")
       values ($1, (select "puzzleTypeId" from "puzzleTypes" where "label" = $2), (select "recordTypeId" from "recordTypes" where "label" = $3), $4)
    returning "recordId";
  `;
  const newRecordParams = [userId, puzzleType, recordType, recordDate];
  db.query(newRecordSql, newRecordParams)
    .then(result => {
      const { recordId } = result.rows[0];
      const solvesArrValues = [];
      for (let i = 0; i < solves.length; i++) {
        solvesArrValues.push([recordId, solves[i]]);
      }
      const solvesSql = format(
        `insert into "solves" ("recordId", "time")
              values %L
           returning "recordId";
        `, solvesArrValues);
      return db.query(solvesSql);
    })
    .then(result => {
      const { recordId } = result.rows[0];
      res.status(201).json({ recordId });
    })
    .catch(err => next(err));
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`express server listening on port ${process.env.PORT}`);
});
