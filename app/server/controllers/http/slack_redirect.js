const { promisify } = require('util');
const redis = require('redis');
const client = redis.createClient(6379, 'redis');
const setAsync = promisify(client.set).bind(client);

const { WebClient } = require('@slack/client');
const uuidv1 = require('uuid/v1');
const jwt = require('jsonwebtoken');

module.exports = async function slackRedirectController(req, res) {
  const web = new WebClient();
  const result = await web.oauth.access({
    client_id: process.env.SLACK_CLIENT_ID,
    client_secret: process.env.SLACK_CLIENT_SECRET,
    code: req.query.code,
    redirect_uri: process.env.SLACK_REDIRECT,
  });

  const userObject = {
    ...result,
  };
  const id = uuidv1();
  await setAsync(`${id}`, JSON.stringify(userObject), 'EX', 3600);

  var token = jwt.sign({ token_id: id }, process.env.JWT_SECRET);

  res.redirect(`/map?token=${token}`);
};
