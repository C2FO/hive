var express = require("express"),
        comb = require("comb"),
        Hive = require("./hive");

var hive = new Hive();

var app = express.createServer();
//app.use(express.bodyParser());

app.get('/get/:key', function(req, res) {
    var key = req.params.key;
    if (key) {
        res.send(hive.get(key));
    } else {
        res.send({error : "Key Required"});
    }
});

app.get('/getGte/:key', function(req, res) {
    var key = req.params.key;
    if (key) {
        res.send(hive.getKeyGte(key));
    } else {
        res.send({error : "Key Required"});
    }
});

app.get('/getGt/:key', function(req, res) {
    var key = req.params.key;
    if (key) {
        res.send(hive.getKeyGt(key));
    } else {
        res.send({error : "Key Required"});
    }
});

app.get('/getLt/:key', function(req, res) {
    var key = req.params.key;
    if (key) {
        res.send(hive.getKeyLt(key));
    } else {
        res.send({error : "Key Required"});
    }
});

app.get('/getLte/:key', function(req, res) {
    var key = req.params.key;
    if (key) {
        res.send(hive.getKeyLte(key));
    } else {
        res.send({error : "Key Required"});
    }
});

app.get('/remove/:key', function(req, res) {
    var key = req.params.key;
    if (key) {
        hive.remove(key);
        res.send({removed : true});
    } else {
        res.send({error : "Key Required"});
    }
});

app.get('/flushAll', function(req, res) {
    var key = req.params.key;
    if (key) {
        hive.flushAll();
        res.send({flushed : true});
    } else {
        res.send({error : "Key Required"});
    }
});


app.get('/incr/:key', function(req, res) {
    var key = req.params.key;
    if (key) {
        res.send(hive.incr(key));
    } else {
        res.send({error : "Key Required"});
    }
});

app.get('/decr/:key', function(req, res) {
    var key = req.params.key;
    if (key) {
        res.send(hive.decr(key));
    } else {
        res.send({error : "Key Required"});
    }
    return null;
});


app.post('/set/:key', function(req, res) {
    var key = req.params.key;
    if (key) {
        var body = req.body;
        if (comb.isObject(body) && body.value) {
            res.send({ set : hive.set(key, body.value, body.expires)});
        } else {
            console.log(req.body);
            res.send({error : "the value is required in the form of an object containing a value."});
        }
    } else {
        res.send({error : "Key Required"});
    }
    return null;
});

app.get('/replace/:key', function(req, res) {
    var key = req.params.key;
    if (key) {
        var body = req.body;
        if (comb.isObject(body) && body.value) {
            res.send({ replaced : hive.replace(key, body.value)});
        } else {
            res.send({error : "the value is required in the form of an object containing a value."});
        }
    } else {
        res.send({error : "Key Required"});
    }
    return null;
});

app.post('/append/:key', function(req, res) {
    var key = req.params.key;
    if (key) {
        var body = req.body;
        if (comb.isObject(body) && body.value) {
            res.send({ set : hive.append(key, body.value)});
        } else {
            res.send({error : "the value is required in the form of an object containing a value."});
        }
    } else {
        res.send({error : "Key Required"});
    }
    return null;
});

app.post('/prepend/:key', function(req, res) {
    var key = req.params.key;
    if (key) {
        var body = req.body;
        if (comb.isObject(body) && body.value) {
            res.send({ set : hive.prepend(key, body.value)});
        } else {
            res.send({error : "the value is required in the form of an object containing a value."});
        }
    } else {
        res.send({error : "Key Required"});
    }
    return null;
});

app.listen(3000);