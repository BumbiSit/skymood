const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const config = require('./config'); // local config.js
const cache = require('./cache'); // local cache.js

// Configure app to use bodyParser to parse json data
const app = express(); 
const server = require('http').createServer(app);  
const port = config.server_port;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Following is an example to proxy client request to DarkSky forecast API
const DARKSKY_SECRET_KEY = config.weather_api_secret; 

var url_prefix = 'https://api.darksky.net/forecast/'+DARKSKY_SECRET_KEY+'/';



// 
app.get('/forecast', function(req, res) {
  try {
    // Retrieves location coordinates (latitude and longitude) from client request query
    const coordinates = req.query.lat+','+req.query.long;
    const url = url_prefix + coordinates;
    console.log('Fetching '+url);
    
    axios.get(url)
        .then((response) => {
            console.log("Got response status "+response.status)
            res.status(200).json(response.data);
        })
        .catch((error) => {
            console.log('Errors '+error);
        });
    
  } catch(err) {
    console.log("Errors occurs requesting Dark Sky API", err);
    res.status(500).json({'message': 'Errors occurs requesting Dark Sky API', 'details' : err});
  }
});

// Start the server
server.listen(port);
console.log(`Server is listening on port ${server.address().address}:${port}`);