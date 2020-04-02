const express = require('express');
const seriesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || './database.sqlite'
);

seriesRouter.param('seriesId', (req, res, next, param) => {
  db.get(`SELECT * FROM Series WHERE id = ${param}`, (err, row) => {
    if (err) return next(err);
    if (!row) return res.sendStatus(404);
    req.series = row;
    next();
  });
});

seriesRouter.use('/:seriesId/issues', require('./issues'))

seriesRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Series`, (err, rows) => {
    if (err) return next(err);
    res.status(200).json({ series: rows });
  });
});

seriesRouter.post('/', (req, res, next) => {
  const {
    series: { name, description },
  } = req.body;
  if (!name || !description) return res.sendStatus(400);
  db.run(
    `INSERT INTO Series (name, description) VALUES ($name, $description)`,
    { $name: name, $description: description },
    function(err) {
      if (err) return next(err);
      db.get(`SELECT * FROM Series WHERE id = ${this.lastID}`, (err, row) => {
        if (err) return next(err);
        res.status(201).json({ series: row });
      });
    }
  );
});

seriesRouter.get('/:seriesId', (req, res, next) => {
  const { series } = req;
  res.status(200).json({ series });
});

seriesRouter.put('/:seriesId', (req, res, next) => {
  const {series: { name, description } } = req.body;
  const id = req.params.seriesId;
  if (!name || !description) return res.sendStatus(400);
  db.run(
    ` UPDATE Series SET name = $name, description = $description WHERE id = $seriesId`,
    {
      $name: name,
      $description: description,
      $seriesId: id,
    },
    (err) => {
      if (err) return next(err);
      db.get(`SELECT * FROM Series WHERE id = ${id}`, (err, series) => {
        if (err) return next(err);
        res.status(200).json({ series: series });
      });
    }
  );
});


module.exports = seriesRouter;
