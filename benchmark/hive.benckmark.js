var comb = require("comb"),
        AVLTree = comb.collections.AVLTree;
Hive = require("../lib");

console.log("CREATING TEST DATA....");
var words = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v"];
var permuttedWords = comb.array.powerSet(words).map(
        function(w) {
            var ret = [];
            return ret.concat.apply(ret, w).join("");
        }).filter(function(a) {
    return a != ''
});
//use a tree Arrays cant contain all of the data
var wordTree = new AVLTree();


var printStats = function(name, op, start, end) {
    var time = (+end) - (+start);
    console.log(name + " " + op + " TIME = %dms", time);
    if (time) {
        console.log("%d " + op + " PER SECOND ", (permuttedWords.length / (time / 1000)));
    }
};

var testInserts = function(hive) {
    var l = permuttedWords.length;
    console.log("INSERTING %d records", l);
    var start = new Date();
    for (var i = l - 1; i > 0; i--) {
        var w = permuttedWords[i];
        hive.set(w, w);
    }
    var end = new Date();
    printStats("HIVE", "INSERTION", start, end);
};

var testLookUps = function(hive) {
    var l = permuttedWords.length;
    console.log("LOOKING UP %d records", l);
    var start = new Date();
    for (var i = l - 1; i > 0; i--) {
        var w = permuttedWords[i];
        if (hive.get(w) != w) {
            console.log("LOOKUP ERROR expected %s got %s", w, hive.get(w));
        }
    }
    var end = new Date();
    printStats("HIVE", "LOOKUP", start, end);
};

var testDeletion = function(hive) {
    var l = permuttedWords.length;
    console.log("DELETING %d records", l);
    var start = new Date();
    hive.flushAll();
    var end = new Date();
    printStats("HIVE", "DELETION", start, end);
};


var test = function() {
    var arr = [], hive = new Hive();
    console.log("STARTING TEST....");
    testInserts(hive);
    testLookUps(hive);
    testDeletion(hive);
    hive.kill();
};

test();

