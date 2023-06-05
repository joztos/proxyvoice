const express = require('express');
const { SessionsClient } = require('dialogflow').v2beta1;
require('dotenv').config();

const app = express();
app.use(express.json());

const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const sessionId = process.env.DIALOGFLOW_SESSION_ID;
const languageCode = 'es';

const sessionClient = new SessionsClient();
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

app.post('/detectIntent', async (req, res) => {
  const { queryInput } = req.body;

  const request = {
    session: sessionPath,
    queryInput: queryInput,
    languageCode: languageCode, // Actualizamos el código de idioma a "es"
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    res.send(result);
  } catch (err) {
    console.error('Dialogflow request failed', err);
    res.status(500).send(err);
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
