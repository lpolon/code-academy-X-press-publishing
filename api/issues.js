const express = require('express');
const issuesRouter = express.Router({ mergeParams: true });

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || './database.sqlite'
);

issuesRouter.param('issueId', (req, res, next, param) => {
  db.get(
    'SELECT * FROM Issue WHERE id = $issueId',
    { $issueId: param },
    (err, row) => {
      if (err) return next(err);
      if (!row) return res.sendStatus(404);
      next();
    }
  );
});

const isValidIssueCreateOrUpdate = (req, res, next) => {
  const {
    issue: { name, issueNumber, publicationDate, artistId },
  } = req.body;

  // check if it is a valid artistId
  db.get(
    `SELECT * FROM Artist WHERE id = $artistId`,
    { $artistId: artistId },
    (err, artist) => {
      if (err) {
        next(err);
      } else {
        if (!name || !issueNumber || !publicationDate || !artist)
          return res.sendStatus(400);
      }
    }
  );
  next();
};

issuesRouter.get('/', (req, res, next) => {
  db.all(
    `SELECT * FROM Issue WHERE Issue.series_id = $seriesId`,
    { $seriesId: req.params.seriesId },
    (err, issues) => {
      if (err) return next(err);
      res.status(200).json({ issues });
    }
  );
});

issuesRouter.post('/', isValidIssueCreateOrUpdate, (req, res, next) => {
  const {
    issue: { name, issueNumber, publicationDate, artistId },
  } = req.body;

  const seriesId = req.params.seriesId;

  db.run(
    `INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)`,
    {
      $name: name,
      $issueNumber: issueNumber,
      $publicationDate: publicationDate,
      $artistId: artistId,
      $seriesId: seriesId,
    },
    function(err) {
      if (err) return next(err);
      db.get(
        `SELECT * FROM Issue WHERE Issue.id = ${this.lastID}`,
        (err, row) => {
          if (err) return next(err);
          res.status(201).json({ issue: row });
        }
      );
    }
  );
});

issuesRouter.put('/:issueId', isValidIssueCreateOrUpdate, (req, res, next) => {
  const {
    issue: { name, issueNumber, publicationDate, artistId },
  } = req.body;
  const issueId = req.params.issueId;
  db.run(
    `UPDATE Issue SET name = $name,
    issue_number = $issueNumber,
    publication_date = $publicationDate,
    artist_id = $artistId
    WHERE id = $issueId
  `,
    {
      $name: name,
      $publicationDate: publicationDate,
      $issueNumber: issueNumber,
      $artistId: artistId,
      $issueId: issueId,
    },
    (err) => {
      if (err) return next(err);
      db.get(`SELECT * FROM Issue WHERE id = ${issueId}`, (err, issue) => {
        res.status(200).json({ issue });
      });
    }
  );
});

issuesRouter.delete('/:issueId', (req, res, next) => {
  const issueId = req.params.issueId;
  db.run(
    `
    DELETE FROM Issue WHERE id = $issueId
  `,
    { $issueId: issueId },
    (err) => {
      if (err) return next(err);
      res.sendStatus(204);
    }
  );
});

module.exports = issuesRouter;
