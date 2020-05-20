'use strict';

const express = require('express');
const bodyParser = require('body-parser');
// const cors = require('cors');

function createServer(apiRouter) {
  const server = express();
  // server.use(cors());

  apiRouter.use(bodyParser.json());
  server.use('/api', apiRouter);

  return server;
}

module.exports = { createServer };
