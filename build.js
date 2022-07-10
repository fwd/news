const server = require('@fwd/server')

;(async () => {

	var item = await server.read('./datasets/huff-post.json')
	// var item = await server.read('./headlines.json')

	// const dJSON = require('dirty-json');

	try {
		var data = dJSON.parse(item)
		console.log( data.length )
	} catch(e) {
		console.log("Error", e)
	}

	// await server.write('./headlines.json', JSON.stringify(data, null, 2))

})()