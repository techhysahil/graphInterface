const express = require('express');
const server = express();
const request = require('request');

server.set('view engine', 'ejs');

server.get('/', (req, res) =>
  Promise.all([
  	getContents('http://localhost:4000/'),
    getContents('http://localhost:7777/'),
  ]).then(responses =>{
  	responses[0] = processDOM(responses[0],'http://localhost:4000/');
  	responses[1] = processDOM(responses[1],'http://localhost:7777/');

  	console.log(DOM.js);
  	console.log(DOM.css);
  	var script = "";  	
  	var style = "";  	

  	

  	var promise =  new Promise(function(resolve, reject) {
  		Promise.all(
	  		DOM.js.map(function(obj){
		  		return getContents(obj.source+obj.data)
		  	})).then(responses =>{
	  			responses.forEach(function(resp){
	  				script += '<script type="text/javascript">'+resp+'</script>';
	  			})
	  			Promise.all(
			  		DOM.css.map(function(obj){
				  		return getContents(obj.source+obj.data)
				  	})).then(responses =>{
			  			responses.forEach(function(resp){
			  				style += '<link rel="stylesheet" type="text/css">'+resp+'</link>';
			  			})
			  			resolve();
			  		})	
	  		})	
  	})
  	
  	promise.then(function(response){
  		res.render('index', {includeScripts: script, includeStyle : style, graphControl: responses[0], graphDashboard: responses[1] });
  	});

  }).catch(error =>
    res.send(error.message)
  )
);


var DOM={
	js : [],
	css : []
};

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

function getStyleSrc(str){
	return str.split("href=")[1].split(".css")[0].slice(1);
}

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


const port = process.env.PORT || 9000;
server.listen(port, () => {
  console.log(`Homepage listening on port ${port}`);
});