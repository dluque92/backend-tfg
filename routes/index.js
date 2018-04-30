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
  let productsRes = await Promise.all([
    llamadaLibro(country, values, "ebay").then(async id => {
      let segundallamadaId = "unfinished";
      while (segundallamadaId !== "finished") {
        segundallamadaId = await segundaLlamada(id);
      }

      return terceraLlamada(id);
    }),
    llamadaLibro(country, values, "google-shopping").then(async id => {
      let segundallamadaId = "unfinished";
      while (segundallamadaId !== "finished") {
        segundallamadaId = await segundaLlamada(id);
      }
      return terceraLlamada(id);
    })
  ]);

  console.log(productsRes);
  res.send(JSON.stringify(productsRes));
});

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
