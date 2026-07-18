const { computeStats } = require('../utils/textStats');

function buildStats(contentHtml) {
  return computeStats(contentHtml);
}

module.exports = { buildStats };
