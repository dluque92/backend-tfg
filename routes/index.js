var express = require("express");
var router = express.Router();

var axios = require("axios");

// Home page route.
router.get("/", function (req, res) {
  res.send("This is the home page");
});

// About page route.
router.post("/llamada", async function (req, res) {
  var country = req.query.country;
  var values = req.query.values;
  var token = 'NRHQYEFAWRIPPVOPDCOIHJABAMTHFRBFTGJNHHQYTAAZUTZBCMQKDCIXXYNVOPOC';
  var token2 = 'LCGINPBIBHIWRJDONZEVARBQVIWUOUVCCTJKWIWNIOOBJVBAPPZOWBYJWGWLSKLK';
  var token3 = 'DCDOTCRIXNGOEWOOFIVRQLSKFXCAXQLSRROJFCKXCEJHRRVVHEJZXOZFCQJVMTKB';
  const result = await Promise.all([
    llamadaLibro(country, values, token3, "ebay")
    .then(async id => {
      try{
        var statusId = 'working';
        while((statusId != 'finished') && (statusId != 'undefined')){
          //statusId = await segundaLlamada(id, "1", token3);
          var [parents] = await Promise.all([
            statusId = await segundaLlamada(id, "1", token3),
            sleep(2000)
          ]);
          console.log("ESTADO 1 " + statusId);
        }
        return await terceraLlamada(id, token3);
      }catch(error){
        console.log(error)
      }
    })
    .catch(error => {
      console.log(error)
    }),
    llamadaLibro(country, values, token2, "google-shopping")
    .then(async id => {
      try{
          var statusId = 'working';
          while((statusId != 'finished') && (statusId != 'undefined')){
            //statusId = await segundaLlamada(id, "2", token2);
            var [parents] = await Promise.all([
              statusId = await segundaLlamada(id, "2", token2),
              sleep(2000)
            ]);
            console.log("ESTADO 2 " + statusId);
          }
          return await terceraLlamada(id, token2);
      }catch(error){
        console.log(error)
      }
    })
    .catch(error => {
      console.log(error)
    }),
    llamadaLibro(country, values, token, "amazon")
    .then(async id => {
      try{
        var statusId = 'working';
        while((statusId != 'finished') && (statusId != 'undefined')){
          //statusId = await segundaLlamada(id, "3", token);
          var [parents] = await Promise.all([
            statusId = await segundaLlamada(id, "3", token),
            sleep(2000)
          ]);
          console.log("ESTADO 3 " + statusId);
        }
        return await terceraLlamada(id, token);
      }catch(error){
        console.log(error)
      }
    })
    .catch(error => {
      console.log(error)
    })
  ]);

  try{
    console.log("<------------ HA TERMINADO ------------>")
    console.log(result);
    //res.send(JSON.stringify(result));
    var finalResult = checkResult(result);
    finalResult.offers.sort(pWShipping)
    console.log(finalResult);
    //res.send(JSON.stringify(finalResult));
    res.send({results: finalResult});
  }catch(error){
    console.log(error);
  }
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function llamadaLibro(country, values, token, source) {
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

function segundaLlamada(job_id, num, token) {
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

function checkResult(result){
  var resClean = {
    name: '',
    imageUrl: '',
    description: '',
    offers: []
  };

  // Ebay
  if(result[0].products[0].success){
    loopPush(result[0].products[0].offers, resClean.offers, 'ebay');
  }
  // Google Shopping
  if(result[1].products[0].success){
    loopPush(result[1].products[0].offers, resClean.offers, 'googleShopping');
  }
  // Amazon
  if(result[2].products[0].success){
    loopPush(result[2].products[0], resClean.offers, 'amazon');
  }

  if(result[1].products[0].success){
    resClean.name = result[1].products[0].name;
    resClean.description = result[1].products[0].description;
    resClean.imageUrl = result[1].products[0].image_url;
  }else if(result[2].products[0].success){
    resClean.name = result[2].products[0].name;
  }else if(result[0].products[0].success){
    resClean.name = result[0].products[0].offers[0].name;
  }else{
    resClean.name = "Product not found";
  }
  return resClean;
  
}

function loopPush(arrayOrigin, arrayDestiny, shopName){

  if(shopName == 'amazon'){

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
  }else{
    console.log(arrayOrigin.length)
    for(var i = 0; i < arrayOrigin.length; i++){
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

function pWShipping(a,b){
  return a.priceWithShipping - b.priceWithShipping;
}

module.exports = router;
