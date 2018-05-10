const url = require('url');
const { promisify } = require('util');
const redis = require('redis');
const client = redis.createClient(6379, 'redis');
const getAsync = promisify(client.get).bind(client);

const { WebClient } = require('@slack/client');
const jwt = require('jsonwebtoken');

module.exports = async function connection(ws, req) {
  const location = url.parse(req.url, true);
  const token = location.query.token;

  try {
    const tokenPayload = jwt.verify(token, process.env.JWT_SECRET);

    const userObject = await getAsync(tokenPayload.token_id);
    const client = JSON.parse(userObject);

    const web = new WebClient(client.access_token);

    ws.send(
      JSON.stringify({
        event: 'user',
        payload: client,
      })
    );
    ws.on('message', function handleIncommingMessage(message) {
      const messagePayload = JSON.parse(message);

      console.log(`Message received of type: ${messagePayload.event}`);
      if(messagePayload.event == 'requestUsers') {
        require('./requestUsers')(ws, web)(messagePayload);
      }
      if(messagePayload.event == 'generateShareUrl') {
        require('./generateShareUrl')(ws, web)(messagePayload);
      }
    });
  } catch (e) {
    console.log(e);
    if (e.name === 'JsonWebTokenError') {
      ws.send(
        JSON.stringify({
          event: 'unauthorized',
        })
      );
    }
  }
};
