module.exports = function indexController(req, res) {
  res.render('index', {
    title: 'Index',
    redirect: process.env.SLACK_REDIRECT,
    slackClientId: process.env.SLACK_CLIENT_ID
  });
};
