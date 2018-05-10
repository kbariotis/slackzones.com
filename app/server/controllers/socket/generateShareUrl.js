const path = require('path');
const d3Node = require('d3-node');
const d3 = require('d3');
const fs = require('fs');
const svg2png = require('svg2png');
const timezones = require('./../../../public/timezones.json');
const map = require('./../../../shared/map');
const d3n = new d3Node({
  d3Module: d3,
  styles:
    'svg {background: white;}.graticule {fill: none;stroke: #777;stroke-opacity: .5;stroke-width: .5px;pointer-events: none;}.timezones {fill: #222;}.timezones :hover {fill: orange;}.boundary {fill: none;stroke: #fff;stroke-width: .5px;pointer-events: none;}',
});

async function gatherUsers(web, offset) {
  let response;

  response = await web.users.list({
    limit: 100,
    offset: offset,
  });

  let users = response.members;

  if (response.offset) {
    const moreUsers = await gatherUsers(web, response.offset);
    users = users.concat(moreUsers);
  }

  return users;
}

module.exports = function(ws, web) {
  return async function generateShareUrlController() {
    try {
      const membersPayload = await gatherUsers(web);

      console.log(membersPayload.length);
      const members = membersPayload.filter(user => !!user.tz).map(user => ({
        tz: user.tz,
      }));

      const svg = d3n.createSVG();

      map.start(svg);

      var usersLength = members.length;
      const users = members.reduce(function(initial, u) {
        if (initial[u.tz]) {
          initial[u.tz] = initial[u.tz] + 1;
        } else {
          initial[u.tz] = 1;
        }
        return initial;
      }, {});

      map.drawUserTimezones(users, usersLength, timezones);

      map.drawEnd(users, timezones);

      var svgBuffer = new Buffer(d3n.svgString(), 'utf-8');
      const pngBuffer = await svg2png(svgBuffer);

      await fs.writeFileSync(path.join(__dirname, 'skgtech.png'), pngBuffer);

      ws.send(
        JSON.stringify({
          event: 'mapGenerated',
          payload: {
            url: 'map_url',
          },
        })
      );
    } catch (e) {
      console.log(e);

      ws.send(
        JSON.stringify({
          event: 'unauthorized',
        })
      );
    }
  };
};
