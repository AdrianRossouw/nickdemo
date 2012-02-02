
var express = require('express'),
app = express.createServer(),
request = require('request');

var _ = require('underscore')._;

app.use(express.bodyParser());

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

app.get('/api/:type/:id', loadData);

app.get('/api/:type/:id', function(req, res) {
    res.send(req._data);
});

function saveData(req, res, next) {
    var opts = {
        url: 'http://127.0.0.1:5984/'+req.params.type+'/'+req.params.id,
        method: 'PUT',
        body: JSON.stringify(req.body)
    }

    request(opts, function(err, resp, data) {
        if (err) return res.send(500);

        res.send(data);
    });
}

app.put('/api/:type/:id', saveData);


app.listen(3000);
