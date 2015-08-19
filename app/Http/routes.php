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

$app->get('/auth/request', 'ItemController@getRequestToken');
$app->get('/auth/callback', 'ItemController@handleAuthCallback');
$app->get('/auth/user', 'ItemController@getUsername');
$app->get('/auth/logout', 'ItemController@logout');

$app->get('/items/all', 'ItemController@getAllItems');
$app->post('/items', 'ItemController@retrieveItems');
$app->post('/item/{item_id}/{action}', 'ItemController@performAction');