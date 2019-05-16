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

const url_prefix = 'https://api.darksky.net/forecast/'+DARKSKY_SECRET_KEY+'/';

let getCache = (key) => {
    return new Promise((resolve, reject) => {
        cache.get(key, (err, result) => {
            if(err) {
                reject('Cache error: '+err);
            }
            if(result) {
                console.log("Got cached result for "+key)
                resolve(JSON.parse(result)); // return the cached result
            } else {
                resolve(false);
            }
        });
    });
}

// 
app.get('/forecast', (req, res) => {
    // Retrieves location coordinates (latitude and longitude) from client request query
    const coordinates = req.query.lat+','+req.query.long;
    const url = url_prefix + coordinates;

    getCache('forecasts/'+coordinates)
        .then((val) => {
            if(val) {
                res.status(200).json(val);
            } else {
                console.log('Fetching from '+url);
                axios.get(url)
                    .then((response) => {
                        console.log("Got response status "+response.status);
                        cache.setex("forecasts/"+coordinates, config.cache_time, JSON.stringify(response.data)); // save cache for 15 mins.
                        res.status(200).json(response.data);
                        return;
                    })
                    .catch((error) => {
                        console.log('Errors '+error);
                    });
            }
        })
        .catch(err => console.log(err));
    
});

// Start the server
server.listen(port);
console.log(`Server is listening on port ${server.address().address}:${port}`);