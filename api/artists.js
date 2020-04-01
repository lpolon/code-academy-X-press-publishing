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

artistsRouter.post('/', (req, res, next) => {
  const {
    artist: { name, dateOfBirth, biography },
  } = req.body;

  if (!name || !dateOfBirth || !biography) return res.sendStatus(400);
  const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
  db.run(
    `INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)`,
    {
      $name: name,
      $dateOfBirth: dateOfBirth,
      $biography: biography,
      $isCurrentlyEmployed: isCurrentlyEmployed,
    },
    function(err) {
      db.get(`SELECT * FROM Artist WHERE id = ${this.lastID}`, (err, row) => {
        if (err) return next(err);
        res.status(201).json({ artist: row });
      });
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
  const { artist } = req;
  res.status(200).json({ artist });
});

artistsRouter.put('/:artistId', (req, res, next) => {
  const {
    artist: { name, dateOfBirth, biography },
  } = req.body;
  const id = req.params.artistId;
  if (!name || !dateOfBirth || !biography) return res.sendStatus(400);
  const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
  db.run(
    `
  UPDATE Artist
  SET name = $name,
  date_of_birth = $dateOfBirth,
  biography = $biography,
  is_currently_employed = $isCurrentlyEmployed
  WHERE id = $artistId
  `,
    {
      $name: name,
      $dateOfBirth: dateOfBirth,
      $biography: biography,
      $isCurrentlyEmployed: isCurrentlyEmployed,
      $artistId: id,
    },
    function(err) {
      db.get(`SELECT * FROM Artist WHERE id = ${id}`, (err, row) => {
        if (err) return next(err);
        res.status(200).json({ artist: row });
      });
    }
  );
});

artistsRouter.delete('/:artistId', (req, res, next) => {
  const id = req.params.artistId;
  db.run(`
  UPDATE Artist
  SET is_currently_employed = 0
  WHERE id = $artistId`, {
    $artistId: id,
  }, (err) => {
    if(err) return next(err)
    db.get(`SELECT * FROM Artist WHERE id = ${id}`, (err, row) => {
      if (err) return next(err)
      res.status(200).json({artist: row})
    })
  })
})

module.exports = artistsRouter;
