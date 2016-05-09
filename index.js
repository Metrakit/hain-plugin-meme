'use strict';

const got = require('got');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const ncp = require("copy-paste");

const tplUrl = 'http://memegen.link/templates/';

module.exports = (context) => {
  const shell = context.shell;
  const logger = context.logger;

  let html = [];
  let tpls = [];

  function startup() {
    html = fs.readFileSync(path.join(__dirname, 'preview.html'), 'utf8');
    got(tplUrl).then(response => {
      tpls = JSON.parse(response.body);
    });
  }

  function search(query, res) {
    const query_trim = query.trim();
    const query_parts = _.split(query_trim, '/', 3);

    logger.log(query_parts);
    logger.log(query_parts.length);

    res.add({
      id: `help`,
      payload: 'help',
      title: 'How to',
      desc: 'For generate a meme type : /meme Example / awesome meme /'
    });

    if (query_parts.length === 3) {
      return _.forEach(tpls, (url, name) => {
        url = _.replace(url, 'templates/', '');
        url += '/' + encodeURIComponent(query_parts[0]) + '/' + encodeURIComponent(query_parts[1]) + '.jpg';
        res.add({
            id: url,
            payload: 'open',
            title: name,
            desc: 'Click for copy the meme to your clipboard',
            icon: '#fa fa-file-image-o',
            preview: true
        });
      });
    }
  }

  function execute(url, payload) {
    if (payload !== 'open')
      return;
    ncp.copy(url, function() {
        context.toast.enqueue('Pasted to clipboard !');
    })
  }

  function renderPreview(url, payload, render) {
    var preview = html.replace('%picture%', url);
    preview = preview.replace('%url%', url);
    render(preview);
  }

  return { startup, search, execute, renderPreview };
};
