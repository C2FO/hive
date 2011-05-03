var comb = require("comb");

var getRegex = /(\w+)/;
var setRegex = /(\w+)\s+(.+)$/;
var supportedOps = {
    get : getRegex,
    getKeyGt : getRegex,
    getKeyLt : getRegex,
    getKeyGte : getRegex,
    getKeyLte : getRegex,
    set : setRegex,
    replace : setRegex,
    add : setRegex,
    append : setRegex,
    prepend : setRegex,
    incr : getRegex,
    decr : getRegex,
    flushAll : null,
    stats : null,
    quit : null

};
var regex = "^(%s)(.*)", cmds = [];
for (var i in supportedOps) {
    cmds.push(i);
}
var commandRegex = new RegExp(comb.string.format(regex, cmds.join("|")), "i");

var parseCommand = function(command) {
    console.log(typeof command);
    var ret;
    if (comb.isString(command)) {
        var match = command.match(commandRegex);
        if (match) {
            var cmd = match[1].toLowerCase();
            var paramRegex = supportedOps[cmd];
            if (paramRegex) {
                var params = match[2].match(paramRegex);
                console.log(params);
                if (params) {
                    if (params.length == 2) {
                        //we just have 1
                        params = params[1];
                        ret = [cmd, params];
                    } else if (params.length == 3) {
                        //we have 2                        
                        ret = [cmd, params[1], params[2]];
                    }
                } else {
                    //ERROR all params were not supplied                    
                    ret = "error";
                }
            } else {
                //we dont need to parse params
                ret = match[1];
            }
        } else {
            ret = "error";
        }
    }
    return ret;
};

var stats = exports.stats = function() {
    return JSON.stringify(process.memoryUsage(), null, 4);
};

exports.execute = function(command, hive, socket) {
    var commandArr = parseCommand(command), ret, cmd;
    console.log(commandArr);
    if (comb.isArray(commandArr) && commandArr.length) {
        //then we know its an array that can be used to
        //call the hive server
        cmd = commandArr.shift();
        socket.write(hive[cmd].apply(hive, commandArr) + "\n");
    } else if (commandArr != "error") {
        cmd = commandArr;
        switch (cmd) {
            case "flushAll" :
                socket.write(hive.flushAll() + "\n");
                break;
            case "stats" :
                socket.write(stats() + "\n");
                break;
            case "quit":
                socket.end();
                break;
        }
    } else {
        socket.write("Invalid command!" + "\n");
    }
};