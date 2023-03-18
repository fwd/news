const moment = require('moment')
const fs = require('fs')
const ChartJSImage = require('chart.js-image')
const headlines = require('./headlines.json')

var Sentiment = require('sentiment');
var sentiment = new Sentiment();

var index = 1

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

  index++

  return (await line_chart.toFile(filepath)) 

}

var keywords = ['Trump']

var year_count = {}

var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

var headline_count_last = {}
for (var month of months) {
  var year = '2022'
  headline_count_last[month] = headlines.filter(a => {
    return moment(a.timestamp * 1000).format('YYYY') === year && moment(a.timestamp * 1000).format('MMMM') == month
  }).length
}

var headline_count = {}
for (var month of months) {
  var year = '2023'
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

function mentioned(keyword) {

  var mention = {}
  
  for (var year of years) {
    mention[year] = headlines.filter(a => moment(a.timestamp * 1000).format('YYYY') === year && a.title.toLowerCase().includes(keyword.toLowerCase())).length
  }

  return mention

}

var run = async () => {

  await chart({
    "labels": Object.keys(year_count),
    "datasets": [
      {
        "label": "",
        "borderColor": "rgb(255,+99,+132)",
        "backgroundColor": "rgba(255,+99,+132,+.5)",
        "data": Object.values(year_count)
      },
    ]
  }, `./charts/chart-${index}.png`, { title: 'Headlines over Years', label: 'Years' })

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
  }, `./charts/chart-${index}.png`, { title: 'Headlines in 2023' })

 await chart({
    "labels": Object.keys(headline_count_last),
    "datasets": [
      {
        "label": "Headlines",
        "borderColor": "rgb(255,+99,+132)",
        "backgroundColor": "rgba(255,+99,+132,+.5)",
        "data": Object.values(headline_count_last)
      },
    ]
  }, `./charts/chart-${index}.png`, { title: 'Headlines in 2022' })


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
  }, `./charts/chart-${index}.png`, { title: 'Negativity in Titles', label: 'Years', value: 'Sentiment' })

  // await chart({
  //   "labels": Object.keys(mentioned('January 6')),
  //   "datasets": [
  //     {
  //       "label": "Headlines",
  //       "borderColor": "rgb(255,+99,+132)",
  //       "backgroundColor": "rgba(255,+99,+132,+.5)",
  //       "data": Object.values(mentioned('January 6'))
  //     },
  //   ]
  // }, `./charts/chart-${index}.png`, { title: 'Mentioned \'January 6\' (Years)', label: 'Years' })

  // await chart({
  //   "labels": Object.keys(mentioned('MAGA')),
  //   "datasets": [
  //     {
  //       "label": "Headlines",
  //       "borderColor": "rgb(255,+99,+132)",
  //       "backgroundColor": "rgba(255,+99,+132,+.5)",
  //       "data": Object.values(mentioned('MAGA'))
  //     },
  //   ]
  // }, `./charts/chart-${index}.png`, { title: 'Mentioned \'MAGA\' (Years)', label: 'Years' })

  await chart({
    "labels": Object.keys(mentioned('trump')),
    "datasets": [
      {
        "label": "Headlines",
        "borderColor": "rgb(255,+99,+132)",
        "backgroundColor": "rgba(255,+99,+132,+.5)",
        "data": Object.values(mentioned('trump'))
      },
    ]
  }, `./charts/chart-${index}.png`, { title: 'Mentioned \'Trump\' (Years)', label: 'Years' })

  await chart({
    "labels": Object.keys(mentioned('putin')),
    "datasets": [
      {
        "label": "Headlines",
        "borderColor": "rgb(255,+99,+132)",
        "backgroundColor": "rgba(255,+99,+132,+.5)",
        "data": Object.values(mentioned('putin'))
      },
    ]
  }, `./charts/chart-${index}.png`, { title: 'Mentioned \'Putin\' (Years)', label: 'Years' })

  await chart({
    "labels": Object.keys(mentioned('ukraine')),
    "datasets": [
      {
        "label": "Headlines",
        "borderColor": "rgb(255,+99,+132)",
        "backgroundColor": "rgba(255,+99,+132,+.5)",
        "data": Object.values(mentioned('ukraine'))
      },
    ]
  }, `./charts/chart-${index}.png`, { title: 'Mentioned \'Ukraine\' (Years)', label: 'Years' })

  await chart({
    "labels": Object.keys(mentioned('Myanmar')),
    "datasets": [
      {
        "label": "Headlines",
        "borderColor": "rgb(255,+99,+132)",
        "backgroundColor": "rgba(255,+99,+132,+.5)",
        "data": Object.values(mentioned('Myanmar'))
      },
    ]
  }, `./charts/chart-${index}.png`, { title: 'Mentioned \'Myanmar\' (Years)', label: 'Years' })

  await chart({
    "labels": Object.keys(mentioned('nuclear')),
    "datasets": [
      {
        "label": "Headlines",
        "borderColor": "rgb(255,+99,+132)",
        "backgroundColor": "rgba(255,+99,+132,+.5)",
        "data": Object.values(mentioned('nuclear'))
      },
    ]
  }, `./charts/chart-${index}.png`, { title: 'Mentioned \'Nuclear\' (Years)', label: 'Years' })

  await chart({
    "labels": Object.keys(mentioned('microplastics')),
    "datasets": [
      {
        "label": "Headlines",
        "borderColor": "rgb(255,+99,+132)",
        "backgroundColor": "rgba(255,+99,+132,+.5)",
        "data": Object.values(mentioned('microplastics'))
      },
    ]
  }, `./charts/chart-${index}.png`, { title: 'Mentioned \'Microplastics\' (Years)', label: 'Years' })

  // await chart({
  //   "labels": Object.keys(mentioned('Doomsday')),
  //   "datasets": [
  //     {
  //       "label": "Headlines",
  //       "borderColor": "rgb(255,+99,+132)",
  //       "backgroundColor": "rgba(255,+99,+132,+.5)",
  //       "data": Object.values(mentioned('doomsday'))
  //     },
  //   ]
  // }, `./charts/chart-${index}.png`, { title: 'Mentioned \'Doomsday\' (Years)', label: 'Years' })

}

// console.log(process)

if (require.main === module) {
  ;(async () => {
    await run()
  })()
} else {
  module.exports = run
}
