var net = require("net"), hiveUtil = require("./utility/parser"), comb = require("comb"), Hive = require("./hive");

var HOST = "localhost";
var PORT = 8124;


var hive = new Hive();
var server = net.createServer(function (c) {
    c.on("data", function(data) {
        if(comb.isInstanceOf(data, Buffer)){
            data = data.toString();
        }
        c.write(hiveUtil.execute(data, hive) + "\n");
    });
});
server.listen(PORT, HOST);