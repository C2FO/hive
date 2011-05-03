var express = require("express"),
        comb = require("comb"),
        format = comb.string.format,
        Hive = require("./hive"),
        helper = require("./utility/helper");

var hive = new Hive();

var app = express.createServer();
//app.use(express.bodyParser());

["get", "getGte", "getGt", "getLt", "getLte", "remove", "incr", "decr"].forEach(function(action) {
    app.get(format("/%s/:key", action), function(req, res) {
        var key = req.params.key;
        if (key) {
            res.send(hive[action](key));
        } else {
            res.send({error : format("Key Required when calling %s", action)});
        }
    })
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

app.get("/stats", function(req, res){
      var key = req.params.key;
    if (key) {
        hive.flushAll();
        res.send({stats : helper.stats()});
    } else {
        res.send({error : "Key Required"});
    }
});

["set", "replace", "append", "prepend"].forEach(function(action) {
    app.post(format("/%s/:key", action), function(req, res) {
        var key = req.params.key;
        if (key) {
            var body = req.body;
            if (comb.isObject(body) && body.value) {
                res.send({ set : hive[action](key, body.value, body.expires)});
            } else {
                console.log(req.body);
                res.send({error : "the value is required in the form of an object containing a value."});
            }
        } else {
            res.send({error : "Key Required"});
        }
    });
});

app.listen(3000);