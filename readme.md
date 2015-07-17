## Pocket API Client

Simple client to the [Pocket API](http://getpocket.com/developer/docs/getstarted/web) that makes it easier for me to read.

Create with Lumen and Vuejs.

## To deploy
Make sure .env is populated correctly (see .env.example)

Push changes to bitbucket repo

Add public SSH key of user to bitbucket as a deployment key

git clone the bitbucket repo

## To deploy to subdirectory - too much of a pain. Just use a subdomain.
cp public/index.php index.php

Modify index.php to have these two lines:

	$app = require __DIR__.'/bootstrap/app.php';

	$app->run($app['request']);

In resources/view/index.php:
	<script src="public/js/bundle.min.js"></script>

## To build
    gulp