/* global Promise */

var d3 = require('d3');
var topojson = require('topojson');

var width = '960';
var height = '700';

var MapHandler = {};

MapHandler.drawEnd = function(usersBatch, timezones) {
  MapHandler.svg
    .insert('path', '.graticule')
    .datum(
      topojson.mesh(timezones, timezones.objects.timezones, function(a, b) {
        return a !== b;
      })
    )
    .attr('class', 'boundary')
    .attr('d', MapHandler.path);

  const tzs = Object.keys(usersBatch).map(el => ({
    tz: el,
    value: usersBatch[el],
  }));

  //Add the SVG Text Element to the svgContainer
  var text = MapHandler.svg
    .selectAll('text')
    .data(tzs)
    .enter()
    .append('text');

  //Add SVG Text Element Attributes
  text
    .attr('x', 5)
    .attr('y', function(d) {
      return height - Object.keys(usersBatch).indexOf(d.tz) * 20;
    })
    .text(function(d) {
      return d.tz + ': ' + d.value;
    })
    .attr('font-family', 'sans-serif')
    .attr('font-size', '16px')
    .attr('font-weight', '200')
    .attr('fill', 'ddd');
};

MapHandler.drawUserTimezones = function(usersBatch, usersLength, timezones) {
  MapHandler.path.projection(null);

  MapHandler.gEl.remove();

  MapHandler.gEl = MapHandler.svg.insert('g', '.graticule');

  MapHandler.gEl
    .attr('class', 'timezones')
    .selectAll('path')
    .data(topojson.feature(timezones, timezones.objects.timezones).features)
    .enter()
    .append('path')
    .attr('d', MapHandler.path)
    .attr('opacity', function(d) {
      if (usersBatch[d.id]) {
        return 1;
      } else {
        return 0.1;
      }
    })
    .attr('fill', function(d) {
      if (usersBatch[d.id]) {
        var opacity = parseFloat(1 * usersBatch[d.id] / usersLength || 0.05).toFixed(2);
        if (opacity < 0.05) {
          opacity = 0.1;
        }

        var color = parseInt(255 * usersBatch[d.id] / usersLength);

        // return "rgba(255, " + color + ", 0, " + opacity + ")";
        return 'rgb(255, ' + (255 - color) + ', 0)';
      }
    })
    .append('title')
    .text(function(d) {
      return d.id;
    });
};

MapHandler.start = function(svgEl) {
  var projection = d3.geo
    .mercator()
    .scale(width / 2 / Math.PI)
    .translate([width / 2, height / 2])
    .precision(0.1);

  MapHandler.path = d3.geo.path().projection(projection);

  var graticule = d3.geo.graticule();

  MapHandler.svg = svgEl
    .attr('width', width)
    .attr('height', height);

  MapHandler.svg
    .append('path')
    .datum(graticule)
    .attr('class', 'graticule')
    .attr('d', MapHandler.path);

  MapHandler.gEl = MapHandler.svg.insert('g', '.graticule');

  // d3.select(self.frameElement).style('height', height + 'px');
};

module.exports = MapHandler;
