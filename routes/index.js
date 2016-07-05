var express = require('express');
var router = express.Router();
var request = require('request');

console.log("IN index.js");

router.get('/redis', function(req, res, next){
  res.render('redis');
});


router.post('/search',function(req,res,next){

request.post({
    url: 'https://search.yellowmessenger.com/businesses',
  json:{
            "queryString": req.body.search,
            "limit" : 20,
            "offset": 0
        }
   },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
    
        if(!body.data.hits){ 
            console.log("No search Result");
            res.send('<h2>No Results Found.<a href="/home">Go Back</a>.</h2>');
        }
        else
        {
            var qstr = ((req.body.search).toString()).concat('.jpg')
            qstr = ('images/').concat(qstr);
            var business = [];
            for(var x in body.data.hits.hits){
              business[x] = {
                              name : body.data.hits.hits[x]._source.doc.name,
                              location: body.data.hits.hits[x]._source.doc.address,
                              telephone: body.data.hits.hits[x]._source.doc.phone,
                              googlePlaceId : body.data.hits.hits[x]._source.doc.googlePlaceId,
                              id : body.data.hits.hits[x]._id,
                              city : body.data.hits.hits[x]._source.doc.city,
                              country : body.data.hits.hits[x]._source.doc.country,
                              queryString : qstr
                            };
            }
            var all = {};
            all['sports']=business;
            all['query']=req.body.search;
            res.render('busi', {all:all}); 
        } 
      }
      else
      {
          console.log("Request Error!!!!");
      }
    });
});


router.get('/category/:service',function(req,res,next){
  console.log('Through category');
 request.post({
    url: 'https://search.yellowmessenger.com/businesses',
  json:{
            "queryString":req.params.service,
            "limit" : 20,
            "offset": 0
        }
   },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
    
        if(!body.data.hits){ 
            console.log("No search Result");
            res.send('<h2>No Results Found.<a href="/home">Go Back</a>.</h2>');
        }
        else
        {
          var business = [];
            for(var x in body.data.hits.hits){
              console.log(body.data.hits.hits[x]._source.doc.phone);
              business[x] = {
                              name : body.data.hits.hits[x]._source.doc.name,
                              location: body.data.hits.hits[x]._source.doc.address,
                              telephone: body.data.hits.hits[x]._source.doc.phone,
                              googlePlaceId : body.data.hits.hits[x]._source.doc.googlePlaceId,
                              id : body.data.hits.hits[x]._id,
                              city : body.data.hits.hits[x]._source.doc.city,
                              country : body.data.hits.hits[x]._source.doc.country,
                              queryString : '/images/'+req.params.service+'.jpg'
                            };
            }
            var all = {};
            all['sports']=business;
            all['query']=req.params.service;
            res.render('busi', {all:all}); 
        } 
      }
      else
      {
        console.log(body);
        // console.log(error);
        // console.log(response.statusCode);
          console.log("Request Error!!!!");
      }
    });
});


router.get('/shoes', function(req, res, next) {

request.get({
  url: 'http://api.shortlyst.com/v1/products?q=shoes&categoryFilter=footwear',
  headers: {
     "accept": "application/json",
    "apikey": "efa684ba0e5a467dc66b9bb22f573f6b"
  }
},
function (error, response, body) {
      if (!error) {
    var shoebody=(JSON.parse(body));
    // console.log(shoebody);
        if(!body){ 
            console.log("No search Result");
            res.send('<h2>No Results Found</h2>');
        }
        else
        {
            console.log("No error; body found");

              var allshoes = [];
              for(var x in shoebody.productList){
                 console.log(shoebody.productList[x].productId);
                allshoes[x]={
                  title: shoebody.productList[x].title,
                  imgurl: shoebody.productList[x].imageUrl,
                  disc: shoebody.productList[x].discount,
                  description: shoebody.productList[x].seoTitle,
                  sprice: shoebody.productList[x].salePrice,
                  oprice: shoebody.productList[x].offerPrice,
                  merchant: shoebody.productList[x].merchant,
                  ProID: shoebody.productList[x].productId,
                  div: shoebody.productList[x].division,
                  cat: shoebody.productList[x].category,
                  newa: shoebody.productList[x].newArrival,
                  Purl: shoebody.productList[x].productUrl
                }
              }
              var all = {};
              all['prod']=allshoes;
              all['query']="Shoes";
              res.render('shoes', {all:all}); 
        } 
      }
      else
      {
        console.log("ERROR OCCURED");
          console.log(error);
      }
    });
});



router.get('/business/:placeid', function(req, res, next) {
 request.get({
    url: 'https://yellowmessenger.com/pages/business/byPlaceId/' + req.params.placeid
             },
    function (error, response, body) {
      body = JSON.parse(body);
      if (!error && response.statusCode == 200 && body.success) {
        var data = body.data.doc;
         var details = {
                          address : data.address,
                          businessType : data.businessType,
                          categories : data.categories,
                          city : data.city,
                          country : data.country,
                          name : data.name,
                          phone : data.phone,
                          pinCode : data.pinCode,
                          description : data.description,
                          featured : data.featured
                        };
        request.get({
                url: 'https://yellowmessenger.com/pages/catalog/products/' + req.params.placeid 
                +'?limit=20&offset=0' 
                    },
                function (error, response, body) {
                    if (!error && response.statusCode == 200&&JSON.parse(body).success) {
                     var prod = ((JSON.parse(body)).data);
                      var all = { 'details': details,
                                  'pdata' : prod
                                };
                       if(JSON.parse(body).data[0].attributes.length>2)
                       {
                      res.render('prod',{all:all});}
                      else
                      {
                        res.render('prod2', {all:all});
                      }
                    }
                  else
                  {
                      console.log("Request Error inner !!!!");
                      res.send('No products found');
                  }

        });
    }
    else{
      console.log("Request error outer!");
      res.send('business not found');
    }
});
});


router.get('/', function(req, res, next) {

        res.render('home');  
});

router.get('/home', function(req, res, next) {

        res.render('home');  
});

module.exports = router;