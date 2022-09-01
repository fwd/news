const moment = require('moment')
const _ = require('lodash')

moment.suppressDeprecationWarnings = true;

module.exports = (dataset) => {

    var dates = _.uniq(dataset.map(a => moment(a.published)))
    var minDate = moment.min(dates).format('LL')
    var maxDate = moment.max(dates).format('LLL')
    // var moments = this.state.dates.map(d => moment(d)),

    var domains = _.uniq(dataset.map(a => a.domain))
    var categories = _.uniq(dataset.map(a => a.category))

	return `# Headline Dataset

- Dataset: [/headlines.json](https://raw.githubusercontent.com/fwd/news/master/headlines.json) 
- Articles: ${dataset.length}
- File Type: JSON
- File Size: ~**${Math.floor(dataset.size)}MB**
- Updated: ${dataset.timestamp}

\`\`\`
${JSON.stringify(_.first(dataset), null, 4)}
\`\`\`

### Insights

- Sources: ${domains.length}
- Categories: ${categories.length}
- Start: ${minDate}
- Latest: ${maxDate}

### Topics

- World News
- Technology
- Television
- Entertaiment
- Politics
- Sport
- More Coming Soon

---

### Contact 

Twitter: [@nano2dev](https://twitter.com/nano2dev)

## Github Stars

[![Stargazers over time](https://starchart.cc/fwd/news.svg)](https://starchart.cc/fwd/news)
	`
}
