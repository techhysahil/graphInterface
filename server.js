const express = require('express');
const server = express();
const request = require('request');
const fs = require('fs');
const path = require('path');

var DOM={js : [],css : []};
var app = {graphControl : 'http://localhost:4000/',graphDashboard : 'http://localhost:7777/'
};


server.set('view engine', 'ejs');
server.use(express.static(__dirname + '/public'));

server.get('/', function(req, res) {
	fs.readFile(path.resolve(__dirname, "./public/app.html"), (err, data) => {
	  	if (err) throw err;
		res.render('index', {appHTML : data });  	
	})
});

const port = process.env.PORT || 9000;
server.listen(port, () => {
  console.log(`Homepage listening on port ${port}`);
});

// Helper Functions
const getContents = (url) => new Promise((resolve, reject) => {
  request.get(url, (error, response, body) => {
    if (error) return resolve("Error loading " + url + ": " + error.message);

    return resolve(body);
  });
});

const processDOM = (html,source) => {
	var matchScript = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
	var matchMetaTag = /<meta[\s\S]*?>[\s\S]*?/gi;
	var matchStyle = /<link[\s\S]*?>[\s\S]*?/gi;
	var matchTitle = /<title[\s\S]*?>[\s\S]*?<\/title>/gi;
	var matchBase = /<base[\s\S]*?>[\s\S]*?/gi;
	var matchNoScript = /<noscript[\s\S]*?>[\s\S]*?<\/noscript>/gi;

	// Get Style and scripts
	var scriptArray = html.match(matchScript);
	var styleArray = html.match(matchStyle);
	scriptArray.forEach(function(obj){
		if(getAttributeValue('src',obj)){
			DOM.js.push({
					source : source,
					data : getAttributeValue('src',obj)
				})
		}
	})

	styleArray.forEach(function(obj){
		if(getStyleSrc(obj) && getStyleSrc(obj).indexOf('css') > -1){
			DOM.css.push({
					source : source,
					data : getStyleSrc(obj)+".css"
				})
		}
	})
	
	// Remove link,scripts,meta tags etc
	html = 	html.replace(matchScript,"");
	html = 	html.replace(matchStyle,"");
	html = 	html.replace(matchMetaTag,"");
	html = 	html.replace(matchTitle,"");
	html = 	html.replace(matchBase,"");
	html = 	html.replace(matchNoScript,"");

	return html
}

function init(){
	Promise.all([
	  	getContents(app.graphControl),
	    getContents(app.graphDashboard)
	  ]).then(responses => {
	  		var script = "";  	
		  	var style = "";

		  	responses[0] = processDOM(responses[0],app.graphControl);
		  	responses[1] = processDOM(responses[1],app.graphDashboard);

		  	fs.writeFile('public/app.html', responses[0].concat(responses[1]) , (err) => {
			  if (err) throw err;
			});

			var promise =  new Promise(function(resolve, reject) {
		  		Promise.all(
			  		DOM.js.map(function(obj){
				  		return getContents(obj.source+obj.data)
				  	})).then(responses =>{
			  			responses.forEach(function(resp){
			  				script += resp;
			  			})
			  			fs.writeFile('public/js-bundle.js', script , (err) => {
						  if (err) throw err;
						  console.log('The JS bundle is created');
						});
			  			Promise.all(
					  		DOM.css.map(function(obj){
						  		return getContents(obj.source+obj.data)
						  	})).then(responses =>{
					  			responses.forEach(function(resp){
					  				style +=resp;
					  			})
					  			fs.writeFile('public/css-bundle.css', style , (err) => {
								  if (err) throw err;
								  console.log('The CSS bundle is created');
								});
					  			resolve();
					  		})	
			  		})
		  	})

		  	promise.then(function(response){
				console.log("App is ready to serve");
			});
	  })
}

// Get style source
function getStyleSrc(str){
	return str.split("href=")[1].split(".css")[0].slice(1);
}

// Get script source
function getAttributeValue(attribute, source)
{
    var regex = RegExp("<script?\\w+(?:\\s+(?:" + attribute + "=\"([^\"]*)\")|[^\\s>]+|\\s+)*>","gi");
    var matches;
    while ( matches = regex.exec(source) )
    {
    	var a = matches[1]
    }
    return a
}

init();
