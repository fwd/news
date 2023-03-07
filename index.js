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

async function scrape() {
	
	var data = []
	
	for (var sub of subreddits) {

		try {

	        items = await reddit.getSubreddit(sub).getHot({ limit: 30 })

		    items = items.map(a => {
		        return {
		            title: a.title,
		            domain: a.domain,
		            category: sub,
		            link: a.url,
		            timestamp: a.created,
		            published: moment.unix(a.created).format('LLL'),
		        }
		    })   

		    data.push(items)
            
		} catch(e) {
              console.log( e )
	    }
	}

	data = _.flatten(data)
  
    // avoid reddit internal links
	var banned = [
		'igvofficial.com',
		'i.imgur.com',
		'v.redd.it',
		'i.redd.it',
		'reddit.com',
		'twitter.com',
		'youtu.be',
		'youtube.com',
	]

	data = data.filter(a => !banned.includes(a.domain) && a.domain && !a.domain.includes('self.') && !a.link.includes('/r/') && !a.link.includes(a))

	data = _.sortBy(data, function(item) {
		return new Date(item.timestamp)
	}).reverse()

	data = data.filter(a => moment.unix(a.timestamp).format('LL') == moment().format('LL'))

	var dataset = []

	try {
		dataset = require('./headlines.json')
	} catch (e) {
		console.error(e)
	}

	data.map(a => dataset.unshift(a))

	dataset = _.uniqBy(dataset, 'title')

	var stats = fs.statSync('./headlines.json')
	var fileSizeInBytes = stats.size;
	dataset.size = fileSizeInBytes / (1024*1024);

	dataset.timestamp = server.timestamp('LLL')

	await server.write('./headlines.json', JSON.stringify(dataset, null, 4))

	await server.write('./readme.md', readme(dataset))

	const line_chart = ChartJSImage().chart({
		"type": "line",
		"data": {
		"labels": [
		  "January",
		  "February",
		  "March",
		  "April",
		  "May",
		  "June",
		  "July"
		],
		"datasets": [
		  {
		    "label": "My First dataset",
		    "borderColor": "rgb(255,+99,+132)",
		    "backgroundColor": "rgba(255,+99,+132,+.5)",
		    "data": [
		      57,
		      90,
		      11,
		      -15,
		      37,
		      -37,
		      -27
		    ]
		  },
		  {
		    "label": "My Second dataset",
		    "borderColor": "rgb(54,+162,+235)",
		    "backgroundColor": "rgba(54,+162,+235,+.5)",
		    "data": [
		      71,
		      -36,
		      -94,
		      78,
		      98,
		      65,
		      -61
		    ]
		  },
		  {
		    "label": "My Third dataset",
		    "borderColor": "rgb(75,+192,+192)",
		    "backgroundColor": "rgba(75,+192,+192,+.5)",
		    "data": [
		      48,
		      -64,
		      -61,
		      98,
		      0,
		      -39,
		      -70
		    ]
		  },
		  {
		    "label": "My Fourth dataset",
		    "borderColor": "rgb(255,+205,+86)",
		    "backgroundColor": "rgba(255,+205,+86,+.5)",
		    "data": [
		      -58,
		      88,
		      29,
		      44,
		      3,
		      78,
		      -9
		    ]
		  }
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

server.cron(async () => {
	
	try {

		await scrape()

		await server.exec(`cd ${__dirname} && rm -f .git/index.lock && git add -A && git commit -m "${server.timestamp('LLL', 'us-east')}" &> /dev/null`)

		await server.exec(`cd ${__dirname} && git push origin &> /dev/null`)
	
	} catch(e) { console.log(e) }

}, `every ${process.env.CHECK_INTERVAL || 12} hours`)
