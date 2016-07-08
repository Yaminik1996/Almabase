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
  var ua=req.query.ua;
  console.log(ua);
  client.set("useragent", ua, function(error, reply){
    console.log(reply);
  });

  var user;

  client.get("useragent", function(err, reply){
    user=reply;
  });

request.get({
	url:"https://api.github.com/search/repositories?q=user:Google&sort=forks&order=desc",
	headers: {
     "User-Agent": user/*Yaminik1996*/,
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
            console.log(body);
            var repos=[];
            var items=JSON.parse(body).items;
            for(var x in items){
              if(x==5)break;
              // console.log((JSON.parse(body).items[x].name).replace(/-/g, " ").toUpperCase());
              repos[x]={
                        image: items[x].owner.avatar_url, 
                        name: (items[x].name).replace(/-/g, " ").toUpperCase(),
                        reponame: items[x].name,
                        rurl: items[x].html_url,
                        desc: items[x].description,
                        contributors: items[x].contributors_url,
                        forks: items[x].forks
              };
            }
            res.render('repo', {repos:repos});
        }
      }
      else
      {
        console.log("ERROR OCCURED");
        console.log(error);
        var e="ERROR OCCURED : " + error;
        res.send(e);
      }
    });
});



app.get('/con', function (req, res) {
  console.log("Con working");
  console.log(req.query.selrepo);
  var repo=req.query.selrepo;
  console.log("https://api.github.com/repos/Google/"+repo+"/stats/contributors");
  
  var user;
  client.get("useragent", function(err, reply){
    user=reply;
  });

  request.get({
    url: "https://api.github.com/repos/Google/"+repo+"/stats/contributors",
  headers: {
     "User-Agent": user,/*Yaminik1996*/
     "accept": "application/json"
    }},
    

    function(error, response, body){
      if(!error){
        if(!body){console.log("No body found");
        res.send("No body found");}
        else{
          var contributors=JSON.parse(body);
          // console.log(contributors.length);
          var len=contributors.length-1;
          var count=0;
          var newcontributor=[];
         while(count<3){
                  newcontributor[count++]={
                                    name: contributors[len].author.login.toUpperCase(),
                                    picture: contributors[len].author.avatar_url,
                                    hurl: contributors[len].author.html_url,
                                    apiurl: contributors[len].author.url,
                                    count: contributors[len].total
                }
                --len;
                }

                request.get({
                  url: "https://api.github.com/repos/Google/"+repo,
                  headers: {
                             "User-Agent": client.get("useragent"),/*Yaminik1996*/
                             "accept": "application/json"
                            }},
                  function(error, response, body){

                    if(!error){
                      if(!body){
                        console.log("No body found");
                      }
                      else{

                        repo=repo.replace(/-/g, " ").toUpperCase();
                        var all={
                            con: newcontributor,
                            repo: repo,
                            repobody: JSON.parse(body),
                            ua: client.get("useragent")
                          };
                        
                        res.render('contributor', {all:all});
                        console.log("going to contri");   
                        // console.log(JSON.parse(body).avatar_url);
                      }
                    }
                    else{
                      console.log(error);
                    }
              });

    }}

                else{
                  console.log(error);
                }
    });
});

app.get('/home', function(req, res){

  client.exists("useragent", function(err, reply) {
    if (reply === 1) {
        client.del("useragent", function(err, reply){
          console.log(reply);
        })
    } else {
        console.log("useragent does not exist");
    }
});
  res.render('home');
});


app.get('/exit', function(req, res){

  var end=client.get("useragent");
  client.get("useragent", function(err, reply){
    console.log(reply);
  });
  res.render('exit', {end:end});
});


app.get('/', function(req, res){

  client.exists("useragent", function(err, reply) {
    if (reply === 1) {
        client.del("useragent", function(err, reply){
          console.log(reply);
        })
    } else {
        console.log("useragent does not exist");
    }
});
  res.render('home');
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
