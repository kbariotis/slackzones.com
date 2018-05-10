var d3 = require('d3');

var MapHandler = require('./../../../shared/map');

var searchParams = new URLSearchParams(window.location.search);
var token = searchParams.get('token');

if (!token) {
  throw new Error('Unauthorized');
}

window.history.replaceState({}, document.title, '/map');

var shareButtonEl = document.querySelector('.share-btn');

var ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}?token=${token}`);
ws.onerror = () => console.log('WebSocket error');
ws.onopen = () => console.log('WebSocket connection established');
ws.onclose = () => console.log('WebSocket connection closed');

let users = {};
let timezones = [];

ws.onmessage = async message => {
  var messageObject = JSON.parse(message.data);

  if (messageObject.event === 'user') {
    var teamNameEl = document.querySelector('.user-row .team-name');
    teamNameEl.innerHTML = messageObject.payload.team_name;

    var timezonesResponse = await fetch('/timezones.json');
    timezones = await timezonesResponse.json();

    ws.send(
      JSON.stringify({
        event: 'requestUsers',
        payload: {},
      })
    );
  }
  if (messageObject.event === 'usersBatch') {
    var members = messageObject.payload.members;

    var usersLength = 575;
    users = members.reduce(function(initial, u) {
      if (initial[u.tz]) {
        initial[u.tz] = initial[u.tz] + 1;
      } else {
        initial[u.tz] = 1;
      }
      return initial;
    }, users);

    MapHandler.drawUserTimezones(users, usersLength, timezones);

    console.log(messageObject.payload)
    if (messageObject.payload.offset) {
      ws.send(
        JSON.stringify({
          event: 'requestUsers',
          payload: {
            offset: messageObject.payload.offset,
          },
        })
      );
    } else {
      MapHandler.drawEnd(users, timezones);
    }
  }
  if (messageObject.event === 'unauthorized') {
    window.location = '/';
  }
};

shareButtonEl.addEventListener('click', function () {
  ws.send(
    JSON.stringify({
      event: 'generateShareUrl',
      payload: {},
    })
  )
});

var svgEl = d3
  .select('.map-container')
  .append('svg');

MapHandler.start(svgEl);
