'use strict';

require('dotenv').config();
const express = require('express');
const apiRouter = express.Router();
const { createServer } = require('./clients/express-server.js');
const { askDialogflow } = require('./clients/dialogflow-client.js');
const PORT = process.env.PORT || 3000;

apiRouter.get('/search', async (req, res) => {
	let botResponse = await askDialogflow(req.query.query);
  return res.json(botResponse);
});

const server = createServer(apiRouter);
server.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
