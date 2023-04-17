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

}

server.cron(async () => {
	
	try {

		await scrape()

		await server.exec(`cd ${__dirname} && rm -f .git/index.lock && git add -A && git commit -m "${server.timestamp('LLL', 'us-east')}" &> /dev/null`)

		await server.exec(`cd ${__dirname} && git push origin &> /dev/null`)
	
	} catch(e) { console.log(e) }

}, `every ${process.env.CHECK_INTERVAL || 12} hours`, true)
