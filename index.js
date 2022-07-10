/**
* This is a NodeJS script file
* You run it via the command line like so: > node script.js
* You'll need NodeJS 16+ installed & the following packages. 
*/

// npm i sentiment snoowrap moment lodash

require('dotenv').config()

const fs = require('fs')
const server = require('@fwd/server')
const _ = require('lodash')
const moment = require('moment')
const snoowrap = require('snoowrap')
const Sentiment = require('sentiment')

const readme = require('./readme.js')

const reddit = new snoowrap({
    userAgent: 'put your user-agent string here',
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD
});

const subreddits = [
	'worldnews',
	'news',
	'television',
	'ukraine',
	'miami',
	'technology',
	'sports',
	'UpliftingNews',
	'science',
	'nottheonion',
	'politics',
	'florida'
]

async function scrape() {
	
	var data = []
	
	for (var sub of subreddits) {

		items = await reddit.getSubreddit(sub).getHot({ limit: 10 })

		// for (var item of items) {
	        
	 //        var sentiment = new Sentiment();
	        
	 //        item.sentiment = sentiment.analyze(item.title)
	        
	 //    }
		    
	    items = items.map(a => {
	        return {
	            title: a.title,
	            domain: a.domain,
	            category: sub,
	            link: a.url,
	            timestamp: a.created,
	            sentiment: item.sentiment.score,
	            published: moment.unix(a.created).format('LLL'),
	        }
	    })   

	    data.push(items)

	}

	data = _.flatten(data)
  
    // avoid reddit internal links
	var banned = [
		'i.imgur.com',
		'v.redd.it',
		'i.redd.it',
        'reddit.com',
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
	} catch (e) {}

	data.map(a => dataset.unshift(a))

	dataset = _.uniqBy(dataset, 'title')

	await server.write('./headlines.json', JSON.stringify(dataset, null, 4))

	await server.write('./readme.md', readme(dataset))

	// fs.writeFileSync('./headlines.json', )
	// fs.writeFileSync('./headlines.json', JSON.stringify(dataset, null, 4))

}

server.cron(async () => {

	await scrape()

	await server.exec(`cd ${__dirname} && rm -f .git/index.lock && git add -A && git commit -m "${server.timestamp('LLL', 'us-east')}" &> /dev/null`)
	
	await server.exec(`cd ${__dirname} && git push origin &> /dev/null`)

}, 'every 1 hour', true) 
