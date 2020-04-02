const express = require('express');
const issuesRouter = express.Router({ mergeParams: true });

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || './database.sqlite'
);

issuesRouter.get('/', (req, res, next) => {
  db.all(
    `SELECT * FROM Issue WHERE Issue.series_id = $seriesId`,
    { $seriesId: req.params.seriesId },
    (err, rows) => {
      if (err) return next(err);
      res.status(200).json({ issues: rows });
    }
  );
});

// WIP
issuesRouter.post('/', (req, res, next) => {
  const {issues: {name, issueNumber, publicationDate, artistId} } = req.body
  if (!name || !issueNumber || !publicationDate || !artistId) return res.sendStatus(400);
  const seriesId = req.params.seriesId;

  db.run(`INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)`,
  {
    $name: name,
    $issueNumber: issueNumber,
    $publicationDate: publicationDate,
    $artistId: artistId,
    $seriesId: seriesId
  },
  function(err) {
    if(err) return next(err)
    db.get(`SELECT * FROM Issue WHERE id = ${this.lastID}`, (err, row) => {
      if(err) return next(err)
      res.status(201).json({issues: row})
    })
  }
  )

})

module.exports = issuesRouter;
