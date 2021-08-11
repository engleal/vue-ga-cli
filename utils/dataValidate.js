module.exports = {
  getDataType: function (obj) {
    let toString = Object.prototype.toString
    let map = {
      '[object Boolean]': 'boolean',
      '[object Number]': 'number',
      '[object String]': 'string',
      '[object Function]': 'function',
      '[object Array]': 'array',
      '[object Date]': 'date',
      '[object RegExp]': 'regExp',
      '[object Undefined]': 'undefined',
      '[object Null]': 'null',
      '[object Object]': 'object',
    }
    return map[toString.call(obj)]
  },
  string: {
    isEmpty: function (params) {
     
    },
    getLength:function (params) {
     
    }
  },
  number: {
    
  },
  bool: {

  },
  function: {
    
  },
  object: {
    isEmpty: function (obj = {}) {
      return Object.keys(obj).length !== 0 ? false : true
    },
    getLength:function(obj) {
      return Object.keys(obj).length
    }
  },
  array:{
    isEmpty: function (params) {
     
    },
    getLength:function (params) {
     
    }
  },
  regExp: {

  },
  map: {
    isEmpty: function (params) {
     
    },
    getLength:function (params) {
     
    }
  },
  date: {
    isEmpty: function (params) {
     
    },
    getLength:function (params) {
     
    }
  },

}