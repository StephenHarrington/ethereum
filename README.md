# Ethereum

### Prerequisites:

1. [Read the docs](https://github.com/ethereum/go-ethereum)
2. Install [geth](https://ethereum.github.io/go-ethereum/install/)
2. Read about ethereum [enode url formats](https://github.com/ethereum/wiki/wiki/enode-url-format) 
3. Browse the [command line arguments](https://github.com/ethereum/go-ethereum/wiki/Command-Line-Options)

This document expamds slightly on creating a private network for developers.

### Private network  

Follow the instructions for [setting up a local private network](https://github.com/ethereum/go-ethereum/wiki/Setting-up-private-network-or-local-cluster) 
from the official Ethereum instructions for setting up a private network on one machine and easily extensible to a network or multiple machines.


Missing a couple of steps.

1. [init genesis block](https://github.com/ethereum/go-ethereum#operating-a-private-network) on each geth datadir
  * ```geth --datadir="/tmp/eth/private/01" init /path/to.your/genesis.json 2>> /tmp/eth/private/01.log```
  * ```geth --datadir="/tmp/eth/private/02" init /path/to.your/genesis.json 2>> /tmp/eth/private/02.log```
2. proper flags for nodiscover, bootnodes and identity

On main host:

```
geth --datadir="/tmp/eth/private/01" -verbosity 6 --ipcdisable --port 30301 --rpcport 8101 --bootnodes "enode://STUFF@[::]:30301" --identity MainNode --nodiscover console 2>> /tmp/eth/private/01.log
```

where ***STUFF*** is the hex hash in the output from ```bootnode -nodekey boot.key```.  Make sure to replace the STUFF above with the output from bootnode!!

On peer:

```
geth --datadir="/tmp/eth/private/02" -verbosity 6 --ipcdisable --port 30302 --rpcport 8102 --identity peerNode_1 --nodiscover  console 2>> /tmp/eth/private/02.log
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


Share the genesis.json and the encode string with others to create a private ethereum netowrk.
