var vows = require('vows'),
        comb = require("comb"),
        assert = require('assert'),
        Hive = require("../lib");

var suite = vows.describe("A hive cache");

suite.addBatch({

    "when using hive " : {
        topic : new Hive(),

        "it should set a value " : function(hive) {
            hive.set("key1", "my value");
        },

        "it should retrieve a value " : function(hive) {
            assert.equal(hive.get("key1"), "my value");
        },

        "it should replace a value" : function(hive) {
            hive.replace("key1", "my replaced value");
            assert.equal(hive.get("key1"), "my replaced value");
        },

        "it should append a value" : function(hive) {
            hive.append("key1", " appended");
            assert.equal(hive.get("key1"), "my replaced value appended");
        },

        "it should preppend a value" : function(hive) {
            hive.prepend("key1", "prepended ");
            assert.equal(hive.get("key1"), "prepended my replaced value appended");
        },

        "it should increment numeric values" : function(hive) {
            hive.set("key2", 0);
            assert.equal(hive.get("key2"), 0);
            hive.incr("key2");
            assert.equal(hive.get("key2"), 1);
        },

        "it remove values" : function(hive) {
            hive.remove("key1");
            assert.isNull(hive.get("key1"), 0);
            assert.equal(hive.get("key2"), 1);
        },

        "it flush all values" : function(hive) {
            hive.flushAll();
            assert.isNull(hive.get("key1"));
            assert.isNull(hive.get("key2"));
        },

        "it should find all values greater than a key " : function(hive){
            hive.set("a", 1);
            hive.set("b", 2);
            hive.set("c", 3);
            hive.set("d", 4);
            hive.set("e", 5);
            assert.deepEqual(hive.getKeyGt("a"), [5,4,3,2]);
        },

        "it should find all values greater or equal to a key " : function(hive){
            assert.deepEqual(hive.getKeyGte("b"), [5,4,3,2]);
        },

         "it should find all values less than a key " : function(hive){
            assert.deepEqual(hive.getKeyLt("b"), [1]);
        },

        "it should find all values less than or equal to a key " : function(hive){
            assert.deepEqual(hive.getKeyLte("a"), [1]);
            hive.flushAll();
        },

        "it should expire values " : {
            topic : function(hive) {
                hive.set("key1", "I expire", 5);
                hive.set("key2", "I dont expire!");
                assert.equal(hive.get("key1"), "I expire");
                setTimeout(comb.hitch(this, function() {
                    this.callback(null, hive);
                }), 6000);
            },

            " and after key1 expires should be null " : function(hive) {
                assert.isNull(hive.get("key1"));
                assert.equal(hive.get("key2"), "I dont expire!");
            },

            " and after key2 expires should not be null " : function(hive) {
                assert.equal(hive.get("key2"), "I dont expire!");
            }
        }
    }
});

suite.run({reporter : require("vows").reporter.spec});