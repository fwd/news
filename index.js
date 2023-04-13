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
		"labels": Object.keys(_words),
		"datasets": [
		  {
		    "label": "Words in Headlines",
		    "borderColor": "rgb(255,+99,+132)",
		    "backgroundColor": "rgba(255,+99,+132,+.5)",
		    "data": Object.values(_words)
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
		            recorded: moment.unix(a.created).format('LLL'),
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

	await create_chart(dataset)

}

server.cron(async () => {
	
	try {

		await scrape()

		await server.exec(`cd ${__dirname} && rm -f .git/index.lock && git add -A && git commit -m "${server.timestamp('LLL', 'us-east')}" &> /dev/null`)

		await server.exec(`cd ${__dirname} && git push origin &> /dev/null`)
	
	} catch(e) { console.log(e) }

}, `every ${process.env.CHECK_INTERVAL || 12} hours`, true)

// ;(async () => {
// 	await create_chart( require('./headlines.json') )
// })()
