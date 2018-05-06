var express = require("express");
var router = express.Router();
var token = "NRHQYEFAWRIPPVOPDCOIHJABAMTHFRBFTGJNHHQYTAAZUTZBCMQKDCIXXYNVOPOC";
var axios = require("axios");

// Home page route.
router.get("/", function (req, res) {
  res.send("This is the home page");
});

// About page route.
router.post("/llamada", async function (req, res) {
  var country = req.query.country;
  var values = req.query.values;
  Promise.all([
    // llamadaLibro(country, values, "ebay").then(async id => {
    //   try{
    //     var statusId = 'working';
    //     while(statusId != 'finished'){
    //       var [parents] = await Promise.all([
    //         statusId = await segundaLlamada(id, "1"),
    //         sleep(5000)
    //       ]);
    //       console.log("ESTADO 1 " + statusId);
    //       //statusId = await segundaLlamada(id, "2");
    //       //demo();
    //     }
    //     return terceraLlamada(id);
    //   }catch(error){
    //     console.log(error)
    //   }
    // }),
    llamadaLibro(country, values, "google-shopping").then(async id => {
      try{
          var statusId = 'working';
          while(statusId != 'finished'){
            var [parents] = await Promise.all([
              statusId = await segundaLlamada(id, "2"),
              sleep(5000)
            ]);
            console.log("ESTADO 2 " + statusId);
          }
          return terceraLlamada(id);
      }catch(error){
        console.log(error)
      }
    }),
    llamadaLibro(country, values, "amazon").then(async id => {
      try{
        var statusId = 'working';
        while(statusId != 'finished'){
          var [parents] = await Promise.all([
            statusId = await segundaLlamada(id, "3"),
            sleep(5000)
          ]);
          console.log("ESTADO 3 " + statusId);
        }
        return terceraLlamada(id);
      }catch(error){
        console.log(error)
      }
    })
  ]).then(result =>{
    console.log("<------------ HA TERMINADO ------------>")
    console.log(result);
    res.send(JSON.stringify(result));
  }).catch(reason => { 
    console.log(reason)
  });
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function llamadaLibro(country, values, source) {
  console.log("Primera llamada");
  return axios
    .post("https://api.priceapi.com/jobs", {
      token: token,
      country: country,
      source: source,
      currentness: "daily_updated",
      completeness: "one_page",
      key: "gtin",
      values: values
    })
    .then(res => {
      return res.data.job_id;
    })
    .catch(e => {
      console.log(e)
    });
}

function segundaLlamada(job_id, num) {
  console.log("Segunda llamada" + num);
  return axios
    .get("https://api.priceapi.com/jobs/" + job_id, {
      params: {
        token: token
      }
    })
    .then(res => {
      console.log(res.data.status)
      return res.data.status;
    })
    .catch(e => {
      console.log(e)
    });
}

function terceraLlamada(job_id) {
  console.log("Tercera llamada");
  return axios
    .get("https://api.priceapi.com/products/bulk/" + job_id, {
      params: {
        token: token
      }
    })
    .then(res => {
      return res.data;
    })
    .catch(e => {
      console.log(e)
    });
}

module.exports = router;
