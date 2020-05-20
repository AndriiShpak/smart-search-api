'use strict';

require('dotenv').config();

const getEnvVar = require('../utils/check-env-var');
const projectId = getEnvVar('DIALOGFLOW_PROJECT_ID');
const keyFilename = getEnvVar('DIALOGFLOW_KEY_PATH');
const sessionId = getEnvVar('DIALOGFLOW_SESSION_ID');
const dialogflow = require('@google-cloud/dialogflow').v2;
const sessionClient = new dialogflow.SessionsClient({
  // https://stackoverflow.com/questions/50355556/how-authenticate-with-gcloud-credentials-an-dialogflow-api
  keyFilename
});
const sessionPath = sessionClient.projectAgentSessionPath(
  projectId,
  sessionId,
);
const langCode = 'uk';

async function askDialogflow(query) {
  let request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: langCode,
      },
    },
  };

  let responses = await sessionClient.detectIntent(request);
  return responses[0].queryResult;
}

module.exports = { askDialogflow };
