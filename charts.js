const moment = require('moment')
const ChartJSImage = require('chart.js-image')
const headlines = require('./headlines.json')

var Sentiment = require('sentiment');
var sentiment = new Sentiment();


async function chart(dataset, filepath, options) {

  const line_chart = ChartJSImage().chart({
    "type": "line",
    "data": dataset,
    "options": {
      "title": {
        "display": true,
        "text": options && options.title ? options.title : "Line Chart"
      },
      "scales": {
        "xAxes": [
          {
            "scaleLabel": {
              "display": true,
              "labelString": options && options.label ? options.label : "Month"
            }
          }
        ],
        "yAxes": [
          {
            "stacked": true,
            "scaleLabel": {
              "display": true,
              "labelString": options && options.value ? options.value : "Headlines"
            }
          }
        ]
      }
    }
  })
  .backgroundColor('white')
  .width(options && options.width ? options.width : 500) // 500px
  .height(options && options.height ? options.height : 300); // 300px

  return (await line_chart.toFile(filepath)) 

}

var keywords = ['Trump']

var year_count = {}
var headline_count = {}

var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

for (var month of months) {
  var year = '2022'
  headline_count[month] = headlines.filter(a => {
    return moment(a.timestamp * 1000).format('YYYY') === year && moment(a.timestamp * 1000).format('MMMM') == month
  }).length
}

var years = ["2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"]

for (var year of years) {
  year_count[year] = headlines.filter(a => moment(a.timestamp * 1000).format('YYYY') === year).length
}

var negativity_count = {}

for (var year of years) {
  var score = 0
  headlines.filter(a => moment(a.timestamp * 1000).format('YYYY') === year).map(a => score += sentiment.analyze(a.title).score)
  negativity_count[year] = score
  // year_count[year] = headlines.filter(a => moment(a.timestamp * 1000).format('YYYY') === year).length
}

var mention_trump = {}

for (var year of years) {
  mention_trump[year] = headlines.filter(a => moment(a.timestamp * 1000).format('YYYY') === year && a.title.toLowerCase().includes('trump')).length
  // year_count[year] = headlines.filter(a => moment(a.timestamp * 1000).format('YYYY') === year).length
}

var mention_putin = {}

for (var year of years) {
  mention_putin[year] = headlines.filter(a => moment(a.timestamp * 1000).format('YYYY') === year && a.title.toLowerCase().includes('putin')).length
  // year_count[year] = headlines.filter(a => moment(a.timestamp * 1000).format('YYYY') === year).length
}

var mention_ukraine = {}

for (var year of years) {
  mention_ukraine[year] = headlines.filter(a => moment(a.timestamp * 1000).format('YYYY') === year && a.title.toLowerCase().includes('ukraine')).length
  // year_count[year] = headlines.filter(a => moment(a.timestamp * 1000).format('YYYY') === year).length
}

var run = async () => {

  await chart({
    "labels": Object.keys(year_count),
    "datasets": [
      {
        "label": "Headlines",
        "borderColor": "rgb(255,+99,+132)",
        "backgroundColor": "rgba(255,+99,+132,+.5)",
        "data": Object.values(year_count)
      },
    ]
  }, './charts/chart-1.png', { title: 'Dataset Timeline', label: 'Years' })


  await chart({
    "labels": Object.keys(headline_count),
    "datasets": [
      {
        "label": "Headlines",
        "borderColor": "rgb(255,+99,+132)",
        "backgroundColor": "rgba(255,+99,+132,+.5)",
        "data": Object.values(headline_count)
      },
    ]
  }, './charts/chart-2.png', { title: 'Headlines (2023)' })

  await chart({
    "labels": Object.keys(negativity_count),
    "datasets": [
      {
        "label": "Headlines",
        "borderColor": "rgb(255,+99,+132)",
        "backgroundColor": "rgba(255,+99,+132,+.5)",
        "data": Object.values(negativity_count)
      },
    ]
  }, './charts/chart-3.png', { title: 'Negativity in Headlines (Years)', label: 'Years', value: 'Sentiment' })

  await chart({
    "labels": Object.keys(mention_trump),
    "datasets": [
      {
        "label": "Headlines",
        "borderColor": "rgb(255,+99,+132)",
        "backgroundColor": "rgba(255,+99,+132,+.5)",
        "data": Object.values(mention_trump)
      },
    ]
  }, './charts/chart-4.png', { title: 'Mention \'Trump\' (Years)', label: 'Years' })

  await chart({
    "labels": Object.keys(mention_putin),
    "datasets": [
      {
        "label": "Headlines",
        "borderColor": "rgb(255,+99,+132)",
        "backgroundColor": "rgba(255,+99,+132,+.5)",
        "data": Object.values(mention_putin)
      },
    ]
  }, './charts/chart-5.png', { title: 'Mention \'Putin\' (Years)', label: 'Years' })

  await chart({
    "labels": Object.keys(mention_ukraine),
    "datasets": [
      {
        "label": "Headlines",
        "borderColor": "rgb(255,+99,+132)",
        "backgroundColor": "rgba(255,+99,+132,+.5)",
        "data": Object.values(mention_ukraine)
      },
    ]
  }, './charts/chart-6.png', { title: 'Mention \'Ukraine\' (Years)', label: 'Years' })

}

// console.log(process)

if (require.main === module) {
  ;(async () => {
    await run()
  })()
} else {
  module.exports = run
}
