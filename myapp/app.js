var express = require('express');
var app = express();
var request = require('request');
var exphbs  = require('express-handlebars');
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
var redis = require('redis');
var client = redis.createClient();
var router = express.Router();

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

client.on('connect', function() {
    console.log('connected');
});

app.get('/redis', function (req, res) {
  console.log("In /redis");
  console.log(req.query.ua);
  client.set("useragent", req.query.ua, function(error, reply){
    console.log(reply);
  });
request.get({
	url:"https://api.github.com/search/repositories?q=user:Google&sort=forks&order=desc",
	headers: {
     "User-Agent": req.query.ua/*Yaminik1996*/,
     "accept": "application/json"
    }},
    function (error, response, body) {
      if (!error) {
        if(!body){ 
            console.log("No search Result");
            res.send('<h2>No Results Found</h2>');
        }
        else
        {
            console.log("No error; body found");
            var repos=[];
            // console.log(JSON.parse(body).items[0]);
            for(var x in JSON.parse(body).items){
              if(x==5)break;
              // console.log((JSON.parse(body).items[x].name).replace(/-/g, " ").toUpperCase());
              repos[x]={
                        image: JSON.parse(body).items[x].owner.avatar_url, 
                        name: (JSON.parse(body).items[x].name).replace(/-/g, " ").toUpperCase(),
                        reponame: JSON.parse(body).items[x].name,
                        rurl: JSON.parse(body).items[x].html_url,
                        desc: JSON.parse(body).items[x].description,
                        contributors: JSON.parse(body).items[x].contributors_url,
                        forks: JSON.parse(body).items[x].forks
              };
            }
            res.render('repo', {repos:repos});
        }
      }
      else
      {
        console.log("ERROR OCCURED");
          console.log(error);
      }
    });
});

// router.post('/con', function (req, res) {
// res.render('home');
// });


app.all('/con', function (req, res) {
  console.log("Con working");
  console.log(req.body.data);
  console.log("https://api.github.com/repos/Google/"+req.body.data+"/stats/contributors");
  request.get({
    url: "https://api.github.com/repos/Google/"+req.body.data+"/stats/contributors",
  headers: {
     "User-Agent": client.get("useragent"),/*Yaminik1996*/
     "accept": "application/json"
    }},
    function(error, response, body){
      if(!error){
        if(!body){console.log("No body found");}
        else{
          console.log(JSON.parse(body).length);
          var len=JSON.parse(body).length-1;
          var count=0;
          var contributors=[];
          while(count<3){
            contributors[count++]={
                                    name: JSON.parse(body)[len].author.login,
                                    picture: JSON.parse(body)[len].author.avatar_url,
                                    hurl: JSON.parse(body)[len].author.html_url,
                                    apiurl: JSON.parse(body)[len].author.url,
                                    count: JSON.parse(body)[len].total
            }
            --len;
          }
          // console.log(contributors);
          res.render('home');
          console.log("going to contri");
        }
      }
    })
});

app.get('/abc', function(req, res){
  res.render('home');
})


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
