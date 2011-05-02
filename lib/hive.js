var comb = require("comb");

exports = module.exports = comb.define(null, {

    instance : {

        __checkInterval : 1000,

        constructor : function() {
            //create a tree for times so we can quickly find values less
            //than a specified time
            this.__timeTree = new comb.collections.AVLTree({
                compare : function(a, b) {
                    var ret = 0;
                    if (a.expires < b.expires) {
                        ret = -1;
                    } else if (a.expires > b.expires) {
                        ret = 1;
                    }
                    return ret;
                }
            });
            //use a tree so we can have complex keys later
            //otherwise we are limited to just strings
            //also this performes great on look up!
            //Also allows quick lookups on multiple values
            this.__values = new comb.collections.AVLTree({
                compare : function(a, b) {
                    var ret = 0;
                    if (a.key < b.key) {
                        ret = -1;
                    } else if (a.key > b.key) {
                        ret = 1;
                    }
                    return ret;
                }
            });
            this.__cleanupInterval = setInterval(comb.hitch(this, this._checkValues), this.__checkInterval);
        },

        kill : function() {
            clearInterval(this.__cleanupInterval);
        },

        __castKey : function(key) {
            return "" + key;
        },

        _checkValues : function() {
            var timeTree = this.__timeTree,
                    valueTree = this.__values,
                    now = new Date().getTime();
            var vals = this.__timeTree.findLessThan(now);
            vals.forEach(function(v) {
                timeTree.remove(v);
                valueTree.remove(v);
            });
        },

        _convertSeconds : function(seconds) {
            return seconds * 60000;
        },

        getKeyLt : function(key) {
            key = this.__castKey(key);
            return this.__values.findLessThan({key : key}, true).map(function(v) {
                return v.value
            });
        },

        getKeyLte : function(key) {
            key = this.__castKey(key);
            return this.__values.findLessThan({key : key}).map(function(v) {
                return v.value
            });
        },

        getKeyGt : function(key) {
            key = this.__castKey(key);
            return this.__values.findGreaterThan({key : key}, true).map(function(v) {
                return v.value
            });
        },

        getKeyGte : function(key) {
            key = this.__castKey(key);
            return this.__values.findGreaterThan({key : key}).map(function(v) {
                return v.value
            });
        },

        //gets a value
        get : function(key) {
            key = this.__castKey(key);
            var val = this.__values.find({key : key});
            return val ? val.value : null;
        },

        //Set a key unconditionally
        set : function(key, value, expires) {
            expires = !expires ? Infinity : new Date().getTime() + this._convertSeconds(expires);
            //we need to keep expires to ensure we can look up from tree also;
            var node = {key : key, value : value, expires : expires};
            //store the pointer in both
            this.__values.insert(node);
            if (expires != Infinity) {
                //dont worry about saving values that are set to infinity
                //as it doesnt matter
                this.__timeTree.insert(node);
            }
            return value;
        },

        //replace a value
        replace : function(key, value) {
            var currValue = this.__values.find({key : key});
            if (currValue) {
                currValue.value = value;
            }
            return value;
        },

        //appends a to an existing record
        //if current value is an object we create an array
        append : function(key, value) {
            var currNode = this.__values.find({key : key});
            if (currNode) {
                var currValue = currNode.value;
                //if they are both strings assume you can just appened it!
                if (comb.isString(currValue) && comb.isString(value)) {
                    currNode.value += value;
                } else {
                    //make it an array
                    currNode.value = [currValue, value];
                }
            }
        },
        //prepend to a record
        prepend : function(key, value) {
            var currNode = this.__values.find({key : key});
            if (currNode) {
                var currValue = currNode.value;
                //if they are both strings assume you can just appened it!
                if (comb.isString(currValue) && comb.isString(value)) {
                    currNode.value = value + currValue;
                } else {
                    //make it an array
                    currNode.value = [value, currValue];
                }
            }
        },
        //increments a numeric value
        incr : function(key) {
            var currNode = this.__values.find({key : key});
            if (currNode) {
                var currValue = currNode.value;
                console.log(typeof currValue)
                if (comb.isNumber(currValue)) {
                    //update the pointers value
                    return ++currNode.value;
                }
            }
            return null;
        },

        //decrements a numeric value
        decr : function(key) {
            var currNode = this.__values.find({key : key});
            if (currNode) {
                var currValue = currNode.value;
                if (comb.isNumber(currValue)) {
                    //update the pointers value
                    return --currNode.value;
                }
            }
            return null;
        },

        //remove a value
        remove : function(key) {
            var currValue = this.__values.find({key : key});
            if (currValue) {
                this.__values.remove(currValue);
                if (currValue.expires != Infinity) {
                    this.__timeTree.remove(currValue);
                }
            }
            return null;
        },

        //removes all key value pairs
        flushAll : function() {
            this.__values.clear();
            this.__timeTree.clear();
        }
    }

});
