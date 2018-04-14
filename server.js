const express = require('express');
const server = express();
const request = require('request');

server.set('view engine', 'ejs');

server.get('/', (req, res) =>
  Promise.all([
  	getContents('http://localhost:4000/'),
    getContents('http://localhost:7777/'),
  ]).then(responses =>{
  	res.render('index', { graphControl: responses[0], graphDashboard: responses[1] })
  }).catch(error =>
    res.send(error.message)
  )
);

const getContents = (url) => new Promise((resolve, reject) => {
  request.get(url, (error, response, body) => {
    if (error) return resolve("Error loading " + url + ": " + error.message);

    return resolve(body);
  });
});

const port = process.env.PORT || 9000;
server.listen(port, () => {
  console.log(`Homepage listening on port ${port}`);
});