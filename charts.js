const moment = require('moment')
const ChartJSImage = require('chart.js-image')
const headlines = require('./headlines.json')

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

var years = ["2018", "2019", "2020", "2021", "2022", "2023", "2024"]

for (var year of years) {
  year_count[year] = headlines.filter(a => moment(a.timestamp * 1000).format('YYYY') === year).length
}


module.exports = async () => {

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
  }, './charts/chart-1.png', { title: 'Dataset Timeline' })


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

}