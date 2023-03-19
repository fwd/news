const fs = require('fs')
const server = require('@fwd/server')
const moment = require('moment')
const _ = require('lodash')
const charts = require('./charts')
const dataset = require('./headlines.json')

moment.suppressDeprecationWarnings = true;

function nFormatter(num, digits) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup.slice().reverse().find(function(item) {
    return num >= item.value;
  });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}

const charts_files = fs.readdirSync('./charts', { withFileTypes: true }).filter(item => !item.isDirectory()).map(item => item.name)

async function build() {

    var dates = _.uniq(dataset.map(a => moment(a.published)))
    var minDate = moment.min(dates).format('LL')
    var maxDate = moment.max(dates).format('LLL')
    // var moments = this.state.dates.map(d => moment(d)),

    var domains = _.uniq(dataset.map(a => a.domain))
    var categories = _.uniq(dataset.map(a => a.category))

    await charts()

    var stats = fs.statSync('./headlines.json')
    var fileSizeInBytes = stats.size;
    dataset.size = fileSizeInBytes / (1024*1024);


	return `# Headline Dataset

- Dataset: [/headlines.json](https://raw.githubusercontent.com/fwd/news/master/headlines.json) 
- Articles: ${nFormatter(dataset.length)}
- File Type: JSON
- File Size: ~**${Math.floor(dataset.size)}MB**
- Sources: ${nFormatter(domains.length)}
- Categories: ${nFormatter(categories.length)}
- Oldest: ${_.last(dataset).published}
- Newest: ${_.first(dataset).published}

\`\`\`
${JSON.stringify(_.first(dataset), null, 4)}
\`\`\`

---

### Charts (Beta)

${ charts_files.map((a, i) => `![https://raw.githubusercontent.com/fwd/news/master/charts/chart-${i + 1}.png](https://raw.githubusercontent.com/fwd/news/master/charts/chart-${i + 1}.png)`).join('\n') }

### Contact 

Twitter: [@nano2dev](https://twitter.com/nano2dev)

## Github Stars

[![Stargazers over time](https://starchart.cc/fwd/news.svg)](https://starchart.cc/fwd/news)
`
}


if (require.main === module) {
  ;(async () => {
    await server.write('./readme.md', await build())
  })()
} else {
  module.exports = build
}