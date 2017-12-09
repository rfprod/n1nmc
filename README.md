# Ng1NodeMongoCore (Ng1NMC)

![build](https://travis-ci.org/rfprod/ng1nmc.svg?branch=master)

## Overview

Ng1NodeMongoCore - application core based on NodeJS, MongoDB and AngularJS (1.x.x).

### Project structure

* `./server` - server app
	* `./server/config` - configurations
	* `./server/models` - db models
	* `./server/routes` - routes
	* `./server/utils` - utilities
* `./client` - client app, index page, main module and routes
	* `./client/components/**` - viewless components and respective tests
	* `./client/css/**` - styles
	* `./client/views/**` - controllers, templates, and test for views
	* `./client/fonts` - app fonts
	* `./client/js` - bundled scripts
	* `./client/img` - app images
* `./test` - client/server tests
	* `./test/e2e` - end to end tests
	* `./test/unit` - server tests

## Start

### Requirements

In order to run your own copy of Ng1NMC, you must have the following installed:

- [`Node.js`](https://nodejs.org/)
- [`NPM`](https://nodejs.org/)
- [`MongoDB`](http://www.mongodb.org/)
- [`Git`](https://git-scm.com/)

### Installation & Startup

To install Ng1NMC execute the below command in the terminal window while in your projects folder:

```
git clone https://github.com/rfprod/ng1nmc.git
```

This will install the Ng1NMC components into the `ng1nmc` directory in your projects folder.

### Local Environment Variables

Create a file named `.env` in the root directory. This file should contain:

```
MONGO_URI=mongodb://localhost:27017/ng1nmc
PORT=8080
APP_URL=http://localhost:8080/
MAILER_HOST=smtp.gmail.com
MAILER_PORT=465
MAILER_EMAIL=sender@email.tld
MAILER_PASS=seNderPassWoRd
MAILER_RECIPIENT_EMAIL=recipient@email.tld
```

### Starting the App

To start the app, execute in the terminal while in the project folder (dependencies installation check will be performed before)

```
npm start
```

Now open your browser and type in the address bar

```
http://localhost:8080/
```

Ng1NMC is up and running.

### Testing

To test the server execute the following command in the terminal window while in your project's folder when the server is running:

```
$ npm run server-test
```

To test the client execute the following command in the terminal window while in your project's folder:

for continuous testing

```
$ npm run client-test
```

for single test

```
$ npm run client-test-single-run
```

To lint the code execute the following command in the terminal window while in your project's folder:

```
$ npm run lint
```

### Errors

In case of mongo error on startup use npm task `npm run mongo-repair` then `npm start` again

## Licenses

* [`Ng1NMC`](LICENSE.md)
