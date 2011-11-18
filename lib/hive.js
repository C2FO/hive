var comb = require("comb");

/**
 * @class In memory store for Node JS.
 *
 * @name Hive
 */
exports = module.exports = comb.define(null, {

    instance : {
        /**
         * @lends Hive.prototype
         */

        __checkInterval : 1000,

        constructor : function(options) {
            options = options || {};
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
            //also this performs great on look up!
            //Also allows quick lookups on multiple values
            var cmp = options.compare ? options.compare : function(a, b) {
                var ret = 0;
                if (a < b) {
                    ret = -1;
                } else if (a > b) {
                    ret = 1;
                }
                return ret;
            }
            this.__values = new comb.collections.AVLTree({
                compare : function(a, b) {
                    return cmp(a.key, b.key);
                }
            });
            this.__cleanupInterval = setInterval(comb.hitch(this, this._checkValues), this.__checkInterval);
        },

        /**
         * Kills the clean up process for looking for expired keys.
         */
        kill : function() {
            clearInterval(this.__cleanupInterval);
        },

        /**
         * Casts a key
         * @param {*} key the key to cast
         */
        __castKey : function(key) {
            //TODO make this overridable.
            return "" + key;
        },

        /**
         * Checks for expired values.
         */
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

        /**
         * Covert seconds to milliseconds
         * @param {Number} seconds number of seconds to convert.
         */
        _convertSeconds : function(seconds) {
            return seconds * 60000;
        },

        /**
         * Retrives all values with a key less than the provided key.
         *
         * @param {*} key the key to look up.
         *
         * @return {Array} an array of values.
         */
        getKeyLt : function(key) {
            key = this.__castKey(key);
            return this.__values.findLessThan({key : key}, true).map(function(v) {
                return v.value
            });
        },

        /**
         * Retrives all values with a key less or equal to a than the provided key.
         *
         * @param {*} key the key to look up.
         *
         * @return {Array} an array of values.
         */
        getKeyLte : function(key) {
            key = this.__castKey(key);
            return this.__values.findLessThan({key : key}).map(function(v) {
                return v.value
            });
        },

        /**
         * Retrives all values with a greater than the provided key.
         *
         * @param {*} key the key to look up.
         *
         * @return {Array} an array of values.
         */
        getKeyGt : function(key) {
            key = this.__castKey(key);
            return this.__values.findGreaterThan({key : key}, true).map(function(v) {
                return v.value
            });
        },

        /**
         * Retrives all values with a greater or equal to than the provided key.
         *
         * @param {*} key the key to look up.
         *
         * @return {Array} an array of values.
         */
        getKeyGte : function(key) {
            key = this.__castKey(key);
            return this.__values.findGreaterThan({key : key}).map(function(v) {
                return v.value
            });
        },

        /**
         * Retrive the value for a specified key
         *
         * @param {*} key the key to look up.
         *
         * * @return {*} the value or null if not found.
         */
        get : function(key) {
            key = this.__castKey(key);
            var val = this.__values.find({key : key});
            return val ? val.value : null;
        },

        /**
         * Set a key value pair.
         * @param {*} key the key to store
         * @param {*} value the value to asociate with the key.
         * @param {Number} [expires=Infinity] if provided sets a max life on a key, value pair.
         *
         * * @return {*} the value
         */
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

        /**
         * Replace a key value pair in this Store.
         *
         * @param {*} key the key to store
         * @param {*} value the value to asociate with the key.
         * @param {Number} [expires=Infinity] if provided sets a max life on a key, value pair.
         *
         * @return {*} the value
         */
        replace : function(key, value, expires) {
            var currValue = this.__values.find({key : key});
            if (currValue) {
                currValue.value = value;
            } else {
                this.set(key, value, expires);
            }
            return value;
        },

        /**
         * Appends a value to a current value, if the current value is a string, and the appending
         * value is a string then it will be appeneded to the value otherwise an array is created to
         * store both values.
         *
         * @param {*} key the key to look up.
         * @param {*} value the value to append
         */
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

        /**
         * Prepends a value to a current value, if the current value is a string, and the prepedning
         * value is a string then it will be prepeneded to the value otherwise an array is created to
         * store both values.
         *
         * @param {*} key the key to look up.
         * @param {*} value the value to prepend
         */
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

        /**
         * Increments a value, if it is numeric.
         *
         * @param {*} key the key to look up the value to increment.
         */
        incr : function(key) {
            var num;
            var currNode = this.__values.find({key : key});
            if (currNode) {
                var currValue = currNode.value;
                if (comb.isNumber(currValue)) {
                    //update the pointers value
                    return ++currNode.value;
                } else {
                    num = Number(currValue);
                    if (!isNaN(num)) {
                        currNode.value = ++num;
                    }
                }
            }
            return num;
        },

        /**
         * Decrements a value, if it is numeric.
         *
         * @param {*} key the key to look up the value to decrement.
         */
        decr : function(key) {
            var num;
            var currNode = this.__values.find({key : key});
            if (currNode) {
                var currValue = currNode.value;
                if (comb.isNumber(currValue)) {
                    //update the pointers value
                    return --currNode.value;
                } else {
                    num = Number(currValue);
                    if (!isNaN(num)) {
                        currNode.value = --num;
                    }
                }
            }
            return num;
        },

        /**
         * Remove a value from this store.
         *
         * @param {*} key the key of the key value pair to remove.
         */
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

        /**
         * Remove all values from the store.
         */
        flushAll : function() {
            this.__values.clear();
            this.__timeTree.clear();
            return true;
        }
    }

});
