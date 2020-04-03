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

const isValidSeriesCreateOrUpdate = (req, res, next) => {
  const {
    series: { name, description },
  } = req.body;
  if (!name || !description) return res.sendStatus(400);
  next();
};

seriesRouter.use('/:seriesId/issues', require('./issues'));

seriesRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Series`, (err, rows) => {
    if (err) return next(err);
    res.status(200).json({ series: rows });
  });
});

seriesRouter.post('/', isValidSeriesCreateOrUpdate, (req, res, next) => {
  const {
    series: { name, description },
  } = req.body;
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

seriesRouter.put(
  '/:seriesId',
  isValidSeriesCreateOrUpdate,
  (req, res, next) => {
    const {
      series: { name, description },
    } = req.body;
    const { seriesId } = req.params;
    db.run(
      ` UPDATE Series SET name = $name, description = $description WHERE id = $seriesId`,
      {
        $name: name,
        $description: description,
        $seriesId: seriesId,
      },
      (err) => {
        if (err) return next(err);
        db.get(`SELECT * FROM Series WHERE id = ${seriesId}`, (err, series) => {
          if (err) return next(err);
          res.status(200).json({ series: series });
        });
      }
    );
  }
);

seriesRouter.delete('/:seriesId', (req, res, next) => {
  const { seriesId } = req.params;
  db.get(
    `
      SELECT * FROM Issue WHERE series_id = $seriesId
      `,
    {
      $seriesId: seriesId,
    },
    (err, row) => {
      if (err) return next(err);
      if (row) return res.sendStatus(400);
      db.run(
        `DELETE FROM Series WHERE id = $seriesId`,
        { $seriesId: seriesId },
        (err) => {
          if (err) return next(err);
          res.sendStatus(204);
        }
      );
    }
  );
});

module.exports = seriesRouter;
