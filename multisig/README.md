# Multisig Project

## Deliverables

My Gnosis Safe can be found here: `https://gnosis-safe.io/app/rin:0xFb6E472b314eb447C23d805d0eb794425D5C8a4e/home`

Contracts have been deployed to Rinkeby at the following addresses:

| Contract | Address Etherscan Link | Transaction Etherscan Link |
| -------- | ------- | --------- |
| Multisig | `https://rinkeby.etherscan.io/address/0xFb6E472b314eb447C23d805d0eb794425D5C8a4e` | `https://rinkeby.etherscan.io/tx/0x7b3a93d61e297d393c56c4e4e4eff8f4c4224d76d402baec4c90b516db413069` |
| Proxy | `https://rinkeby.etherscan.io/address/0x9cb0Cf75c5b7A93ff00cF2d4Ff313f8063a561E3` | `https://rinkeby.etherscan.io/tx/0x97dd07d37d0c265744177a9732a83844ad8f4fd4cd56eed6fa3ae85cd8586df4`|
| Logic | `https://rinkeby.etherscan.io/address/0x5f463914F20F862cc919078DA8822D9d993dE1E1` | `https://rinkeby.etherscan.io/tx/0xb3d279871b63ae42088e66d14dab07072b8e3dccb1bf2c3265c5a99b1dd17d18` |
| LogicImproved | `https://rinkeby.etherscan.io/address/0xaf59741456c903b2F22AB1ab97Ee084C48012896` | `https://rinkeby.etherscan.io/tx/0x870cd18e2f9e3d549bfc2e319991776c87ce00716f002c3d91d357f676651722` |

Transaction for transferring the ownership of the **Proxy** contract to the multisig:

| Contract | Transaction Etherscan Link |
| -------- | -- |
| Proxy | `https://rinkeby.etherscan.io/tx/0x98650d8cadcbe736a29b02939e60cb1d152c135fa63c5a00520b9784de3963de` |

Transaction calling `upgrade(address)` to upgrade the **Proxy** from **Logic** -> **LogicImproved**
| Contract | Function called | Transaction Etherscan Link |
| --------------- | --------------- | -- |
| Proxy | `upgrade` | `https://rinkeby.etherscan.io/tx/0x9a422a4bcd0829a804c52c37bc6727dc409b0d999e6073b7a6e56dd3a2d6e335` |

# Design exercise

> Consider and write down the positive and negative tradeoffs of the following configurations for a multisig wallet. In particular, consider how each configuration handles the common failure modes of wallet security.

> - 1-of-N
> - M-of-N (where M: such that 1 < M < N)
> - N-of-N

## 1-of-N

### Advantages

* you have control and speed dont depend on other people
* if multiple people lose their key just one person can sign

### Disadvantages

* single point of failure for hacks
* people can go rogue

### M-of-N (where M: such that 1 < M < N)

### Advantages

* more decentralized
* more secure from hacks

### Disadvantages

* slower coordination
* if multiple people lose their key might be a problem

### N-of-N

### Advantages

* even more decentralized
* lower risk of people going rogue

### Disadvantages

* single point of failure because if someone loses 1 key you cant do anything, might as well have a 1 of 1 from key backups POV
* slower coordination
