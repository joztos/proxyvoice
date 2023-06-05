const express = require('express');
const { SessionsClient } = require('dialogflow').v2beta1;
require('dotenv').config();
const fs = require('fs');
const https = require('https');

const app = express();
app.use(express.json());

const projectId = 'acaiagent-esga';
const sessionId = 'quickstart-session-id';
const languageCode = 'es-ES';

const sessionClient = new SessionsClient();
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

const jsonURL = 'https://raw.githubusercontent.com/joztos/proxyvoice/master/acaiagent-esga-907208ad628a.json';
const jsonPath = './acaiagent-esga-907208ad628a.json'; // Ruta local donde se guardará el archivo JSON descargado

app.post('/detectIntent', async (req, res) => {
  const { queryInput } = req.body;

  const request = {
    session: sessionPath,
    queryInput: queryInput,
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

// Descargar el archivo JSON desde GitHub
const file = fs.createWriteStream(jsonPath);
https.get(jsonURL, (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    // Leer el archivo JSON
    fs.readFile(jsonPath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error al leer el archivo JSON:', err);
        return;
      }

      // Configurar variable de entorno con el contenido del archivo JSON
      process.env.GOOGLE_APPLICATION_CREDENTIALS = data;

      // Iniciar el servidor una vez que el archivo JSON haya sido leído y configurado
      const port = process.env.PORT || 8080;
      app.listen(port, () => {
        console.log(`Listening on port ${port}`);
      });
    });
  });
}).on('error', (err) => {
  console.error('Error al descargar el archivo JSON:', err);
});
