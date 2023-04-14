/**
* This is NodeJS 
* You run it via the command line like so: > node script.js
* You'll need NodeJS installed on the machine first.
*/

// npm i sentiment snoowrap moment lodash

require('dotenv').config()

const fs = require('fs')
const server = require('@fwd/server')
const _ = require('lodash')
const moment = require('moment')
const snoowrap = require('snoowrap')
const Sentiment = require('sentiment')

const readme = require('./build')

const ChartJSImage = require('chart.js-image')

const reddit = new snoowrap({
    userAgent: 'put your user-agent string here',
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD
});

const subreddits = process.env.CATEGORIES.split(',')

async function create_chart(data) {
	var _words = {}
	var words = []
	data.map(a => a.title.split(' ').map(b => words.push(b)))
	var common = ['a', 'is', 'the', 'to', 'at', 'over', 'with', 'of', 'for', 'are', 'that', 'and', 'by', 'as', 'on', 'after', 'in', 'was', 'from', 'new', 'have', 'it', 'than', 'it', 'who', 'more', 'has', 'an', 'news', 'new', 'says', 'their', 'will', 'be', 'cut', 'off', 'wants', 'plan', 'big', 'they', 'had', 'make', 'move', 'less', 'more', 'finds', 'people', 'year', 'under', 'our', 'say', 'when', 'may', 'up', 'pay', 'if', 'like', 'some', 'but', 'not', 'found', 'first', 'this', 'were', 'he', 'its', 'can', 'into', 'out', 'his', 'her', 'or', 'against', 'study', 'could', 'all', 'about', 'report', 'million', 'years', 'rules', 'launch', 'security', 'tells']
	var valid_words = _.uniq(words).filter(a => a.length > 1 && /^\b\w+\b$/i.test(a) && !Number(a) && !common.includes(a.toLowerCase()))
	valid_words.map(a => {
		var size = words.filter(b => b === a).length
		if (size > 1000) _words[a] = size
	})
	const line_chart = ChartJSImage().chart({
		"type": "line",
		"data": {
		"labels": Object.keys(_words.slice(0, 10)),
		"datasets": [
		  {
		    "label": "Words in Headlines",
		    "borderColor": "rgb(255,+99,+132)",
		    "backgroundColor": "rgba(255,+99,+132,+.5)",
		    "data": Object.values(_words.slice(0, 10))
		  },
		]
		},
		"options": {
		"title": {
		  "display": true,
		  "text": "Chart.js Line Chart"
		},
		"scales": {
		  "xAxes": [
		    {
		      "scaleLabel": {
		        "display": true,
		        "labelString": "Month"
		      }
		    }
		  ],
		  "yAxes": [
		    {
		      "stacked": true,
		      "scaleLabel": {
		        "display": true,
		        "labelString": "Value"
		      }
		    }
		  ]
		}
		}
		}) // Line chart
	.backgroundColor('white')
	.width(500) // 500px
	.height(300); // 300px

	line_chart.toFile('./charts/chart-1.png');
}

;(async () => {

	await create_chart(dataset)
	
})()