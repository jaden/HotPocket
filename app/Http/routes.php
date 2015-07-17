<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

use Illuminate\Http\Request;

$app->get('/', function () {
    return view('index');
});

$app->post('/auth', function (Request $request) {

	if ($request->has('passphrase') && $request->input('passphrase') === $_ENV['POCKET_PASSPHRASE']) {
    	return json_encode(["token" => $_ENV['POCKET_ROUTE_TOKEN'], 'status' => true]);
	}

	return json_encode(['status' => false]);
});

$app->post('/items', 'ItemController@retrieveItems');
$app->post('/item/{item_id}/{action}', 'ItemController@performAction');