const express = require('express');
const apiRouter = express.Router();

apiRouter.use('/artists', require('./artists'))

module.exports = apiRouter;