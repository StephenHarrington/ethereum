# Ethereum

### Prerequisites:

1. [Read the docs](https://github.com/ethereum/go-ethereum)
2. Install [geth](https://ethereum.github.io/go-ethereum/install/)
3. Read about ethereum [enode url formats](https://github.com/ethereum/wiki/wiki/enode-url-format) 
4. Browse the [command line arguments](https://github.com/ethereum/go-ethereum/wiki/Command-Line-Options)
5. Read the [private network](https://github.com/ethereum/go-ethereum/wiki/Private-network) docs.

This document expands slightly on creating a private network for developers.

### Private network  

Follow the instructions for [setting up a local private network](https://github.com/ethereum/go-ethereum/wiki/Setting-up-private-network-or-local-cluster) 
from the official Ethereum docs.  Below is some additional information for setting up a private network on one machine which is easily extensible to multiple network machines.


Missing a couple of steps.

1. [init genesis block](https://github.com/ethereum/go-ethereum#operating-a-private-network) on each geth datadir
  * ```geth --datadir="/tmp/eth/private/01" --networkid 9999 init /path/to.your/genesis.json 2>> /tmp/eth/private/01.log```
  * ```geth --datadir="/tmp/eth/private/02" --networkid 9999 init /path/to.your/genesis.json 2>> /tmp/eth/private/02.log```
2. proper flags for nodiscover, bootnodes and identity

On main host:

```
geth --datadir="/tmp/eth/private/01" -verbosity 6 --ipcdisable --port 30301 --rpcport 8101 --bootnodes "enode://PKEY@[::]:30301" --identity MainNode --nodiscover --networkid 9999 console 2>> /tmp/eth/private/01.log
```

where ***PKEY*** is the hex hash in the output from ```bootnode -nodekey boot.key```.  Make sure to replace the PKEY above with the output from bootnode!!

On peer:

```
geth --datadir="/tmp/eth/private/02" -verbosity 6 --ipcdisable --port 30302 --rpcport 8102 --identity peerNode_1 --nodiscover  --networkid 9999 console 2>> /tmp/eth/private/02.log
```

In main host javascript console:

```javascript
> admin.nodeInfo.enode
```

Let's call that output, quotes and all OTHERSTUFF

In peer javascript console

```javascript
> admin.addPeer("enode://OTHERSTUFF@[::]:30301?discport=0")
```

From the peer javascript console:

```javascript
> admin.peers
[{
    caps: ["eth/63"],
    id: "LONG HEX",
    name: "Geth/MainNode/v1.6.6-stable-10a45cb5/linux-amd64/go1.8.1",
    network: {
      localAddress: "[::1]:36600",
      remoteAddress: "[::1]:30301"
    },
    protocols: {
      eth: {
        difficulty: 1310726787,
        head: "0xOTHER HEX",
        version: 63
      }
    }
}]
```

***Notice the identity "MainNode" is showing as a peer on the peer console.***

From the main host console:

```javascript
> admin.peers
[{
    caps: ["eth/63"],
    id: "DIFFERENT LONG HEX",
    name: "Geth/peerNode_1/v1.6.6-stable-10a45cb5/linux-amd64/go1.8.1",
    network: {
      localAddress: "[::1]:30301",
      remoteAddress: "[::1]:36600"
    },
    protocols: {
      eth: {
        difficulty: 1310726787,
        head: "SAME OTHER HEX",
        version: 63
      }
    }
}]
```

***Notice that the "peerNode_1" identity is displayed on the main host console.***


Share the genesis.json and the encode string with others to create a private ethereum network.


### AWS

To connect to a node running on the internet, e.g. an AWS server:

1. share the ```genesis.json``` file
2. use the same --networkid flag on the guest node
3. share the enode url found by the output of admin.nodeInfo.enode on the main node
 * ***NB*** change the ```[::]``` in the enode url to the external IP address of the main node
4. admin.addPeer("enode://OTHERSTUFF@AWS_IP:30301?discport=0")
5. Don't forget to open up the port (30301) to accept inbound traffic!
 
 
