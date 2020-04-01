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
  db.get(`SELECT id FROM Artist WHERE id = ${param}`, (err, row) => {
    if(err) next(err);
    req.artistId = row.id;
  })
})




module.exports = artistsRouter;
