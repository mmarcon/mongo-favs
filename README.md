# mongo-favs

A shell launcher for MongoDB that loads favorites from Compass.

![mongo-favs](./images/mongo-favs.gif)

Favorites are loaded from Compass' connections directory on the filesystem and are
displayed with the same color they are displayed in Compass.

## Requirements

* `mongo` shell in `$PATH`
* Compass 1.20 or newer
* Node.js >= 12

## Things that don't work

* *Passwords.* For obvious security reasons, Compass does not store passwords in clear text on the filesystem and uses the filesystem instead. For this reason, for connections that need a password you'll have to fill it in manually – or copy pasting from your password manager.