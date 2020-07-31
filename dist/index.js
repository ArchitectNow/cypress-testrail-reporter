
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cypress-testrail-reporter.cjs.production.min.js')
} else {
  module.exports = require('./cypress-testrail-reporter.cjs.development.js')
}
