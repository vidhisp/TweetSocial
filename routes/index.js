var express = require('express');
var router = express.Router();

var Twitter = require('twitter');
//console.log(ck);



var client = new Twitter({
  consumer_key: "GoNhlGAoqKmpRvVWTgVm1hGCZ",
  consumer_secret: "0DmRwscZntHbZFp6xrGk3OSlFxfS8T4wJkLfXfNTvupgjxguil",
  access_token_key: "709626104462454784-ppX1evliahIVgzuUpoMXd34tDk6SrNx",
  access_token_secret: "vLx2mROMAKC6nEeWG7wL5ntX9v1ycKW4BRoRley4wrfUx"
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('register', { title: 'Express' });
});

router.get('/index.html', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/index.html/:param', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/home.html', function(req, res, next) {
  res.render('home', { title: 'Express' });
});

router.get('/login.html', function(req, res, next) {
  res.render('login', { title: 'Express' });
});

router.get('/first.html', function(req, res, next) {
  res.render('first', { title: 'Express' });
});

router.get('/groupmembers.html', function(req, res, next) {
  res.render('groupmembers', { title: 'Express' });
});
//posts on twitter
router.post('/tweetPost', function(req, res, next){
  
  var tweet = req.body.tweet;
  console.log(tweet);
 
  client.post('statuses/update', {status: tweet},  function(error, tweet, response){
  });  
   res.json("status updated successfully");

});


module.exports = router;
