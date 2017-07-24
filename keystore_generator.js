
//required packages

//base nodejs
var crypto = require('crypto');
var fs = require('fs');

//npm install ethereumjs-wallet
var Wallet = require('ethereumjs-wallet');

// read clear text private keys.  
// *never* do this with real addresses

var dir  = '../config/keystore/';
var pwds = [];

fs.readFile(dir + 'pk_password_strings', 'utf8', function (err, data) {
  if (err) {
      return console.log(err);
  }
    pwds = data.toString().split("\n");
});

var wallet_password = "this is my super secret wallet password";

for (idx in pwds) {
    var privatekey = crypto.createHash('sha256').update(pwds[idx]).digest('hex');
    var key        = Buffer.from(privatekey,'hex');
    var wallet     = Wallet.fromPrivateKey(key);
    var date       = new Date();
    
    var filename   = 'UTC--' + date.toISOString().replace(/:/g,'-') + '--' +
        wallet.getAddressString().slice(2)
    
    fs.writeFile(dir + filename, wallet.toV3String(wallet_password), function(err) {
        if(err) {
            return console.log(err);
        }
    });
    console.log(filename + " saved!");
}


