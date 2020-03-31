const express = require('express');
const app = express();

const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandler = require('errorhandler');

// global middleware setup
app.use(bodyParser.json());
app.use(cors());
app.use(errorHandler());
app.use(morgan('dev'));


const apiRouter = require('./api/api')
app.use('/api', apiRouter)


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`server listening at ${PORT}...`);
});

// export for use in testing
module.exports = app;