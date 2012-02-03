
var express = require('express'),
app = express.createServer(),
request = require('request');

var _ = require('underscore')._;

app.use(express.bodyParser());
app.use(express.static(__dirname + '/assets'));

app.set('view engine', 'jade');


app.get('/', function(req, res){
    res.send('Hello World');
});

function loadData(req, res, next) {
    var url = 'http://127.0.0.1:5984/'+req.params.type+'/'+req.params.id;

    request({url: url, json: true}, function(err, resp, data) {
        if (err) return res.send(500);

        req._data = data;
        next();
    });
}


function saveData(req, res, next) {
    var opts = {
        url: 'http://127.0.0.1:5984/'+req.params.type+'/'+req.params.id,
        method: 'PUT',
        body: JSON.stringify(req.body)
    }

    request(opts, function(err, resp, data) {
        if (err || resp.statusCode) {
            req._error = err || resp.statusCode;
            return next();
        }

        res.send(data);
    });
}

// Rest endpoints 
//
app.get('/api/:type/:id', loadData);

app.get('/api/:type/:id', function(req, res) {
    res.send(req._data);

});

app.put('/api/:type/:id', saveData, function(req, res) {
   if (req._error) res.send(500);   
});
// UI

app.get('/view/:type/:id', loadData, function(req, res) {
    res.render('index.jade', { pageTitle: 'My Site', data: req._data });
})

function viewForm(req, res, next) {
   res.render('form.jade', { pageTitle: 'New record', error: req._error });
}

app.post('/new/:type', saveData, function(req, res, next) {
    var url = '/view/'+req.params.type +'/'+ req.body.id;
    !req._error ? res.redirect(url) : next()
}, viewForm);

app.get('/new/:type', viewForm);


app.listen(3000);
