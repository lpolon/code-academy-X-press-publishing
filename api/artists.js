const express = require('express');
const artistsRouter = express.Router();

const sqlite3 = require('sqlite3');
// it allows test suit to check routes without corrupting database
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || '../database.sqlite'
);

artistsRouter.get('/', (req, res, next) => {
  db.all(
    'SELECT * FROM Artist WHERE is_currently_employed = 1',
    (err, rows) => {
      if (err) next(err);
      res.status(200).json({ artists: rows });
    }
  );
});

artistsRouter.param('artistId', (req, res, next, param) => {
  db.get(`SELECT * FROM Artist WHERE id = ${param}`, (err, row) => {
    if (err) return next(err);
    if (!row) return res.sendStatus(404);
    req.artist = row;
    next();
  });
});

artistsRouter.get('/:artistId', (req, res, next) => {
  res.status(200).json({ artist: req.artist });
});

module.exports = artistsRouter;
