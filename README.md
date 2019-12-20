# mongo-favs

A shell launcher for MongoDB that loads favorites from Compass.

![mongo-favs](https://github.com/mmarcon/mongo-favs/blob/master/images/mongo-favs.gif?raw=true)

Favorites are loaded from Compass' connections directory on the filesystem and are
displayed with the same color they are displayed in Compass.

## Requirements

* `mongo` shell in `$PATH`
* Compass 1.20 or newer
* Node.js >= 12

## Installation

```
$ npm install -g mongo-favs
```

## Things that don't work

* *Passwords.* For obvious security reasons, Compass does not store passwords in clear text on the filesystem and uses keychain/keyring instead. For this reason, for connections that need a password you'll have to fill it in manually – or copy paste from your password manager.