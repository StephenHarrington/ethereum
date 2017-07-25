## Running an Ethereum Private Network


### Setup  

Assumed you have [git](https://git-scm.com/downloads) and [geth](https://geth.ethereum.org/downloads/) installed.  Optionally, install [mist](https://github.com/ethereum/mist/releases).  Docs and scripts can be found in this github [repo](https://github.com/StephenHarrington/ethereum).  

Clone the repo using git:  

```bash

git clone https://github.com/StephenHarrington/ethereum

```

### Directory structure  

The repo creates 3 directories in ethereum/privatenet:

1. bin  
    * keystore_generator.js  
    * init  
    * console  
    * attach  
    * mine  
    * mist  
2. config  
    * genesis.json  
    * keystore  
        pk_password_strings
    * static-nodes.json
3. log  
    * mining  
    * console  
    
    
### Generate a keystore  

Before initializing the private network, we create a wallet keystore to provide public keys for coinbase and any other addresses we might allocate coins to in the genesis block.   

For the purpose of this tutorial, a file `pk_password_strings`, is provided with clear text private keys.  **You would never do this in practice with addresses storing convertable coins.** 

You shoud change these private keys.  

In the bin directory is a javascript file `keystore_generator.js`.   

#### `keystore_generator.js`  

0. requires nodejs' built-in module crypto for sha256 and the add-on package [ethereumjs-wallet](https://github.com/ethereumjs/ethereumjs-wallet)   
1. Reads a text file containing a predefined set of passphrase strings separated by newlines  
2. Generates a sha256 hex digest private key  
3. Private key is converted to bytecode and placed in a buffer object  
4. Uses a different password to create the keystore entry  
5. Generates the keystore filename UTC-isodatetime format  
6. Writes entry to keystore file 


In our example, `pk_password_strings` which has three separate lines to generate three different public addresses and store them in the `config/keystore` directory.  The three private keys are:  

1. "here is a supersecret passphrase for coinbase that no one can ever figure out"  
2. a sha256 digest of a secret `dd9caca6d1695c050ba2da52d79dae31315ecbb44f004150c29bbc6655737a36`  
3. raw output of a ?something? with newlines (`\n`) replaced with `|||`.  

*Can you figure out what the third private key is?*  

You should change the entires in `pk_password_strings` otherwise, you will have the same addresses when we explore the shared, private network.  

Note also that `keystore_generator.js` includes the wallet passphrase:
  
```javascript
var wallet_password = "this is my super secret wallet password";
```

**This should be changed to secure your wallet for convertable coins.**
  
  
Executing `keystore_generator.js` with the provided private keys in `pk_password_strings` produces three files in `config/keystore`:

```javascript
UTC--2017-07-24T13-24-11.050Z--f1ce596058071ad40c8eebfd15df1cb0ea4f34c0
UTC--2017-07-24T13-24-11.468Z--54cb10fad1892ecc5c05fb58bddfbf495ca1b379
UTC--2017-07-24T13-24-11.894Z--bab65c73307ccfc7f4b98e654fd65c320aa52190
```  

Note the keystore file structure includes the private key, e.g. `f1ce596058071ad40c8eebfd15df1cb0ea4f34c0`, which is our coinbase public key.  Of course, the UTC timestamp will differ with your implementation.


### The Genesis block  

Creating the keystore provides a public key for the coinbase address that can be added to the `genesis.json` file.  Coins can also be allocated at start-up time.  

The Ethereum Homestead docs provide a [sample genesis file](http://ethdocs.org/en/latest/network/test-networks.html#the-genesis-file) and other resources are found, but they all seemed to miss a couple key points.  Below is copy of the genesis file provided by cloning the repo.  

```json
{
    "config": {
        "chainId": 31415,
        "homesteadBlock": 0,
        "eip155Block": 0,
        "eip158Block": 0
    },

    "nonce": "0x0000000000000042",
    "timestamp": "0x0",
    "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "extraData": "0x00",
    "gasLimit": "0x08000000",
    "difficulty": "0x01",
    "mixhash":    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "coinbase": "0xf1ce596058071ad40c8eebfd15df1cb0ea4f34c0",
    "alloc": {
      "f1ce596058071ad40c8eebfd15df1cb0ea4f34c0" : {
        "balance" : "200000000000000000000000"
      }
    }
}
```
  
**md5sum `a339153f752020d7839589ddb3aa73c7`  genesis.json**

Many genesis files in the docs or in various tutorials are missing the `config` object or have a `chainId` set to 0.  If the `config` object is missing or the `chainId` is set to `0`, the private network will fail to initialize when using the latest Ethereum Homestead release.  This will probably change in the future, YMMV.  

If you executed the `keystore_generator.js` with the default `config/keystore/pk_password_strings` private keys, then the first public key created will be `f1ce596058071ad40c8eebfd15df1cb0ea4f34c0`.  You should copy this key to the `coinbase` entry in the `genesis.json` file, with a leading `0x`.  Also allocate 200,000 ether in the `alloc` object *without* the leading `0x`, see above.  


### Scripts

There are five other scripts in the `bin` directory.  

**You may need to make the scripts executable** (e.g. on unix `chmod +x bin/*`)

1. bin  
    * init  
        ```bash
        rm -rf .datadir
        mkdir .datadir
        cp -r config/keystore .datadir
	cp -r config/static-nodes.json .datadir
        geth \
          --datadir .datadir \
          init config/genesis.json
        ```
        
        `bin/init` will create a hidden directory `.datadir` where the blocks and all other information will be stored.  The keystore from our `config` directory is copied and `geth` is initialized with the genesis block in `genesis.json`.    
        
    * console  
        ```bash
        geth \
          --datadir .datadir \
          --networkid 314159 \
          --rpc \
	  --rpcapi "admin,debug,eth,miner,net,personal,shh,txpool,web3" \
          --ipcpath .datadir/geth.ipc \
          --nodiscover \
	  --identity "YOUR_NAME_HERE"
          console
        ```
        
        `bin\console` can be executed after `.datadir` is initialized.  No mining is being done at this point.  Note the networkid and other flags.  It works best to start the console (or mine) script with output redirected to a log file and running in the background, for example in Ubuntu with `bin/console 2>>log/console.log`
        
    * attach  
        ```bash
        geth \
          attach http://localhost:8545
        ```
        
        `bin\attach` will attach to a running console through port 8545 on the localhost.  A javascript console is enabled and the default APIs are available.
        
    * mist  
        ```bash
        mist \
          --node-networkid 314159 \
          --node-datadir="YOUR_FULLY_SPECIFIED_PATH/privatenet/.datadir" \
          --rpc YOUR_FULLY_SPECIFIED_PATH/privatenet/.datadir/geth.ipc
        ```
        
        `bin\mist` can be run at this time.  Note that the log message can be redirected to a log file (`log\mist.log`).  You should look for two messages: `Connect to {"path":"...../privatenet/.datadir/geth.ipc"}` and `Network is privatenet.`  Note  that the parameters for the node-datadir and rpc flags are fully qualified paths.  **You must change the YOUR_FULLY_SPECIFIED_PATH to your specific installation in the `bin\mist` script.**

    * mine  
        ```bash
        geth \
          --datadir .datadir \
          --networkid 314159 \
          --rpc \
          --rpcapi "admin,debug,eth,miner,net,personal,shh,txpool,web3" \
          --ipcpath .datadir/geth.ipc \
          --nodiscover \
          --mine \
          --minerthreads 1 \
          --verbosity 6 \
          --rpccorsdomain "*" \
          --etherbase 0xf1ce596058071ad40c8eebfd15df1cb0ea4f34c0
        ```
        
        `bin\mine` is the usual way to start-up a private network since blocks and transactions will not be written to the blockchain without a miner.  Note the network id, the ipcpath and the etherbase account which is the same as our coinbase in the `genesis.json` file from initization.  The `bin\mine` command should also have its output redirected to a log file and run in the background (`bin/mine 2>>log/mine.log`).

#### Congratulations you now have a fully functioning Ethereum private net running on your local host. 


### Shared Privatenet 

A share private network is possible with a few minor changes.  The version on your locahost could be shared but for many connected peers use a web service.

#### AWS

An Ethereum privatenet has been deployed to AWS with ip address 54.90.232.121

The same genesis.json block and networkid must beg used as in the examples above.  

The AWS peer enode (ethereum node) is incorporated by using the [static-nodes.json](https://github.com/ethereum/go-ethereum/wiki/Connecting-to-the-network#static-nodes) which is implemented in the `config` directory.


The same connection can be accomplished from the javascript console:

`admin.addPeer("enode://fe0f5698f7043f86e844c2aabe1debcca5dfbded4946eb99fc2a4dcbba76f3cfd60d6708734983dee9c93a3687306ef6578aea79dbfa8a6d7585a149e8a4739d@54.90.232.121:30303?discport=0")`

You can check to see if your connected by typing in the javascript console `admin.peers`.  If you have done everything correctly, you should see something like the following.  Note the name includes `AWSmain`.

```javascript
> admin.peers
[{
    caps: ["eth/62", "eth/63"],
    id: "fe0f5698f7043f86e844c2aabe1debcca5dfbded4946eb99fc2a4dcbba76f3cfd60d6708734983dee9c93a3687306ef6578aea79dbfa8a6d7585a149e8a4739d",
    name: "Geth/AWSmain/v1.6.7-stable-ab5646c5/linux-amd64/go1.8.1",
    network: {
      localAddress: "192.168.0.99:12345",
      remoteAddress: "54.90.232.121:30303"
    },
    protocols: {
      eth: {
        difficulty: 1121957459,
        head: "0x274c7f6082ff1032e48871328f1287d6b6f66cec506a309daf350c36116d7ac6",
        version: 63
      }
    }
}]
```


### Challenge

There are 200,000 ether in address `0xc878d248e8441cbc9707034ea1bcf3ab10188511` that is the passphrase of the ?something? that is the third private key included in the `pk_password_strings` config file.  

Hints: (1) copy the third line of `pk_password_strings` to an editor.  (2) Globally change all of the '|||' to '\n'.  (3) Look at what the result is, somehow... (4) the one word description (five characters) is the passphrase for the public address.    

First person to figure out the encryption can claim the ether with a sendTransaction after unlocking the account!


