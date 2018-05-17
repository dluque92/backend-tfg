var express = require("express");
var router = express.Router();

var axios = require("axios");

var stores = [
  {
    name: "ebay",
    countries: ['ca', 'us', 'in', 'my', 'ph', 'sg', 'at', 'be', 'fr', 'de', 'ie', 'it', 'nl', 'pl', 'es', 'ch', 'gb', 'au'],
    token: 'DCDOTCRIXNGOEWOOFIVRQLSKFXCAXQLSRROJFCKXCEJHRRVVHEJZXOZFCQJVMTKB'
  },
  {
    name: "google-shopping",
    countries: ['br', 'ca', 'mx', 'us', 'in', 'jp', 'tr', 'at', 'be', 'cz', 'dk', 'fr', 'de', 'it', 'nl', 'no', 'pl', 'ru', 'es', 'se', 'ch', 'gb', 'au'],
    token: 'LCGINPBIBHIWRJDONZEVARBQVIWUOUVCCTJKWIWNIOOBJVBAPPZOWBYJWGWLSKLK'
  },
  {
    name: "amazon",
    countries: ['ca', 'mx', 'us', 'in', 'fr', 'de', 'it', 'es', 'gb'],
    token: 'NRHQYEFAWRIPPVOPDCOIHJABAMTHFRBFTGJNHHQYTAAZUTZBCMQKDCIXXYNVOPOC'
  }
];

// Home page route.
router.get("/", function (req, res) {
  res.send("This is the home page");
});

// About page route.
router.post("/llamada", async function (req, res) {
  const country = req.query.country;
  const values = req.query.values;
  const promises = [];
  stores.forEach(item => {
    if (item.countries.includes(country)) {
      promises.push(llamadaLibro(country, values, item.token, item.name)
        .then(async id => {
          try {
            let statusId = 'working';
            while ((statusId != 'finished') && (statusId != 'undefined')) {
              let [parents] = await Promise.all([
                statusId = await segundaLlamada(id, item.name, item.token),
                sleep(2000)
              ]);
              console.log("ESTADO 1 " + statusId);
            }
            return await terceraLlamada(id, item.token);
          } catch (error) {
            console.log(error)
          }
        })
        .catch(error => {
          console.log(error)
        })
      );
    }
  })
  const result = await Promise.all(promises);
  try {
    console.log("<------------ HA TERMINADO ------------>")
    console.log(result);
    var finalResult = checkResult(result);
    finalResult.offers.sort(pWShipping)
    console.log(finalResult);
    res.send({ results: finalResult });
  } catch (error) {
    console.log(error);
  }
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function llamadaLibro(country, values, token, source) {
  console.log("Primera llamada");
  console.log(token + ' ' + source)
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

function segundaLlamada(job_id, name, token) {
  console.log("Segunda llamada " + name + ' ' + token);
  return axios
    .get("https://api.priceapi.com/jobs/" + job_id, {
      params: {
        token: token
      }
    })
    .then(res => {
      return res.data.status;
    })
    .catch(e => {
      console.log(e)
    });
}

function terceraLlamada(job_id, token) {
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

function checkResult(result) {
  var resClean = {
    name: '',
    imageUrl: '',
    description: '',
    offers: []
  };

  // Ebay
  if (result[0].products[0].success) {
    loopPush(result[0].products[0].offers, resClean.offers, 'ebay');
  }
  // Google Shopping
  if (result[1].products[0].success) {
    loopPush(result[1].products[0].offers, resClean.offers, 'googleShopping');
  }
  // Amazon
  if (result[2].products[0].success) {
    loopPush(result[2].products[0], resClean.offers, 'amazon');
  }

  if (result[1].products[0].success) {
    resClean.name = result[1].products[0].name;
    resClean.description = result[1].products[0].description;
    resClean.imageUrl = result[1].products[0].image_url;
  } else if (result[2].products[0].success) {
    resClean.name = result[2].products[0].name;
  } else if (result[0].products[0].success) {
    resClean.name = result[0].products[0].offers[0].name;
  } else {
    resClean.name = "Product not found";
  }
  return resClean;

}

function loopPush(arrayOrigin, arrayDestiny, shopName) {

  if (shopName == 'amazon') {

    var offerExaple = {
      price: '',
      priceWithShipping: '',
      shippingCost: '',
      shopName: '',
      url: ''
    };

    offerExaple.price = arrayOrigin.offers[0].price;
    offerExaple.priceWithShipping = arrayOrigin.offers[0].price_with_shipping;
    offerExaple.shippingCost = arrayOrigin.offers[0].shipping_costs;
    offerExaple.shopName = arrayOrigin.offers[0].shop_name;
    offerExaple.url = arrayOrigin.url;
    arrayDestiny.push(offerExaple);
  } else {
    console.log(arrayOrigin.length)
    for (var i = 0; i < arrayOrigin.length; i++) {
      console.log(i);
      console.log(arrayOrigin[i]);
      var offerExaple = {
        price: '',
        priceWithShipping: '',
        shippingCost: '',
        shopName: '',
        url: ''
      };

      offerExaple.price = arrayOrigin[i].price;
      offerExaple.priceWithShipping = arrayOrigin[i].price_with_shipping;
      offerExaple.shippingCost = arrayOrigin[i].shipping_costs;
      offerExaple.shopName = arrayOrigin[i].shop_name;
      offerExaple.url = arrayOrigin[i].url;
      arrayDestiny.push(offerExaple);
    }
  }
}

function pWShipping(a, b) {
  return a.priceWithShipping - b.priceWithShipping;
}

module.exports = router;
