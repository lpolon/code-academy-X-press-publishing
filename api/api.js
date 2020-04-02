const express = require('express');
const apiRouter = express.Router();

apiRouter.use('/artists', require('./artists'));
apiRouter.use('/series', require('./series'));

module.exports = apiRouter;
