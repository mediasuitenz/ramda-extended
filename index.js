var R = module.exports = require('./src/ramda-extended')

console.log('IN RAMDA-EXTENDED INDEX')
function getPackage (packageName) {
  try {
    console.log('Getting package: ', packageName)
    var package = require(packageName)
    console.log('Found package: ', packageName)
    return package

  } catch (e) {
    console.log('could not find package: ', packageName)
    return null
  }
}

var RSVP = getPackage('RSVP')

if (RSVP) {
  console.log('Building rsvp')
  R._addRSVP(R, RSVP)
}

