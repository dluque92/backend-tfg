var express = require('express');
var router = express.Router();
var token = 'NRHQYEFAWRIPPVOPDCOIHJABAMTHFRBFTGJNHHQYTAAZUTZBCMQKDCIXXYNVOPOC';
var interval=0;
// Home page route.
router.get('/', function (req, res) {
  res.send('This is the home page');
})

// About page route.
router.post('/llamada', function (req, res) {
    var country = req.params.country;
    var values = req.params.values;
      id = llamadaLibro(country,values);
      segundaLlamada(id);
      interval = setInterval(segundaLlamada(id), 1000);
      while(interval!=0){}
      products = terceraLlamada(id);
      res.send(JSON.stringify(products));
})

function llamadaLibro(country,values){
    var id;
    request.post({
    headers: 
        {'content-type' : 'application/json'},
        url:     'https://api.priceapi.com/jobs',
        body:    JSON.stringify({
        token:token,
        country:country,
        source:'ebay',
        currentness:'daily_updated',
        completeness:'one_page',
        key:'gtin',
        values:values})
      }, function(error, response, body){
            texto = JSON.parse(body);
            console.log(texto.job_id)
            id = texto.job_id;
            segundaLlamada(texto.job_id,token);
      });
      return id;
}

function segundaLlamada(job_id){
    var status;
  request(
    { method: 'GET'
    , uri: 'https://api.priceapi.com/jobs/'+job_id+'?token='+token
    , gzip: true
    }
  , function (error, response, body) {
      // body is the decompressed response body
      texto = JSON.parse(body);
      status= texto.status;
    });
  if(status=="finished"){
      clearInterval(interval);
      interval=0;
  }
}

function terceraLlamada(job_id){
    var products;
  request(
    { method: 'GET'
    , uri: 'https://api.priceapi.com/products/bulk/'+job_id+'?token='+token
    , gzip: true
    }
  , function (error, response, body) {
      // body is the decompressed response body
      products= JSON.parse(body);
    }
  );
  return products;
}

module.exports = router;
