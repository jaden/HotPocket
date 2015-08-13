<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Laravel\Lumen\Routing\Controller as BaseController;

class ItemController extends BaseController
{
    /**
     * Gets the pocket items for the user.
     *
     * @return Response
     */
    public function retrieveItems(Request $request)
    {
    	$count = $request->input('count', 10);
    	$offset = $request->input('offset', 0);

        return $this->sendApiRequest('get', [
            'access_token' => $request->input('access_token'),
            'count' => $count,
            'offset' => $offset]);
    }

    /**
     * Performs the specified action on the API.
     *
     * @param string $item_id   The item to perform the action on
     * @param string $action    The action to perform
     */
    public function performAction(Request $request, $item_id, $action)
    {
    	if ($action != 'archive' && $action != 'delete') {
    		return "Invalid action " . $action;
    	}

    	// Pocket API expects a JSON string in the value of actions. Guzzle url encodes it for us.
    	return $this->sendApiRequest('send', [
                'access_token' => $request->input('access_token'),
                'actions' => '[{"action":"' . $action . '","item_id":' . $item_id . '}]'
            ]);
    }

    /**
     * Gets the request token from the Pocket API
     * @param  Request $request
     * @return json           The JSON response from the Pocket API
     */
    public function getRequestToken(Request $request)
    {
        return $this->sendApiRequest('oauth/request', ['redirect_uri' => $request->getUri()]);
    }

    /**
     * Uses the request token code to get an access token from the Pocket API
     * @return json           The JSON response from the Pocket API
     */
    public function getAccessToken(Request $request)
    {
        return $this->sendApiRequest('oauth/authorize', ['code' => $request->input('code')]);
    }

    /**
     * Sends an API request with the access token to Pocket API.
     * @param  string $operation        The API operation to perform (e.g. 'oauth/request', 'get' or 'send')
     * @param  array  $extraParameters  Extra parameters for the request
     * @return string                   The response from the API call.
     */
    private function sendApiRequest($operation, $extraParameters = [])
    {
    	$client = new Client();

    	$results = $client->post($_ENV['POCKET_API_URL'] . $operation, [
            'form_params' => array_merge(
                ['consumer_key' => $_ENV['POCKET_CONSUMER_KEY']],
    		    $extraParameters),

            'headers' => ['X-Accept' => 'application/json'],
        ]);

        return response($results->getBody())
            ->header('Content-Type', 'application/json; charset=utf-8');
    }
}
