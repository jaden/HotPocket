<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Laravel\Lumen\Routing\Controller as BaseController;

class ItemController extends BaseController
{
    /**
     * Get the pocket items for the user
     *
     * @return Response
     */
    public function retrieveItems(Request $request)
    {
		if (! $this->isValidToken($request->input('token'))) {
    		return "Invalid token";
    	}

    	$count = $request->input('count', 10);
    	$offset = $request->input('offset', 0);

        return $this->sendApiRequest('get', ['count' => $count, 'offset' => $offset]);
    }

    /**
     * Performs the action on the API
     *
     * @param string $item_id   The item to perform the action on
     * @param string $action    The action to perform
     */
    public function performAction(Request $request, $item_id, $action)
    {
    	if (! $this->isValidToken($request->input('token'))) {
    		return "Invalid token";
    	}

    	if ($action != 'archive' && $action != 'delete') {
    		return "Invalid action " . $action;
    	}

    	return $this->sendApiRequest('send', ['actions' => '[{"action":"' . $action . '","item_id":' . $item_id . '}]']);
    }

    /**
     *  Validates the token
     *
     *  @param  Request   The incoming request
     *  @return boolean   Returns whether the token is valid
     */
    private function isValidToken($token)
    {
    	return $token === $_ENV['POCKET_ROUTE_TOKEN'];
    }

    /**
     * Send an API request to Pocket API
     * @param  string $operation        The API operation to perform ('get' or 'send')
     * @param  array  $extraParameters  Extra parameters for the request
     * @return string                   The response from the call
     */
    private function sendApiRequest($operation, $extraParameters = [])
    {
    	$client = new Client();
    	$results = $client->post($_ENV['POCKET_API_URL'] . $operation,
    		['form_params' =>
    			array_merge([
	    			'consumer_key' => $_ENV['POCKET_CONSUMER_KEY'],
	        		'access_token' => $_ENV['POCKET_ACCESS_TOKEN']
	    		],
	    		$extraParameters)
    		]
		);

		return $results->getBody();
    }
}
