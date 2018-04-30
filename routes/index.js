var express = require("express");
var router = express.Router();
var token = "NRHQYEFAWRIPPVOPDCOIHJABAMTHFRBFTGJNHHQYTAAZUTZBCMQKDCIXXYNVOPOC";
var axios = require("axios");
// Home page route.
router.get("/", function(req, res) {
  res.send("This is the home page");
});

// About page route.
router.post("/llamada", async function(req, res) {
  var country = req.query.country;
  var values = req.query.values;
  let id = await llamadaLibro(country, values);

  var segundallamadaId = "unfinished";
  console.log("About to petar");
  while (segundallamadaId !== "finished") {
    segundallamadaId = await segundaLlamada(id);
  }
  products = await terceraLlamada(id);
  res.send(JSON.stringify(products));
});

function llamadaLibro(country, values) {
  console.log("Primera llamada");
  return axios
    .post("https://api.priceapi.com/jobs", {
      token: token,
      country: country,
      source: "ebay",
      currentness: "daily_updated",
      completeness: "one_page",
      key: "gtin",
      values: values
    })
    .then(res => {
      return res.data.job_id;
    });
}

function segundaLlamada(job_id) {
  console.log("Segunda llamada");
  return axios
    .get("https://api.priceapi.com/jobs/" + job_id, {
      params: {
        token: token
      }
    })
    .then(res => {
      return res.data.status;
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
    });
}

module.exports = router;
