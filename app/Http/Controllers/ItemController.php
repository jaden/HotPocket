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
        return $this->sendApiRequest('get', [
            'access_token' => $request->session()->get('access_token'),
            'count' => $request->input('count', 10),
            'offset' => $request->input('offset', 0)]);
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
            return "Invalid action: " . $action;
        }

        // Pocket API expects a JSON string in the value of actions. Guzzle url encodes it for us.
        return $this->sendApiRequest('send', [
            'access_token' => $request->session()->get('access_token'),
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
        $redirect_uri = $request->root() . '/auth/callback';

        $response = $this->sendApiRequest('oauth/request', ['redirect_uri' => $redirect_uri]);

        if ($this->isErrorResponse($response)) {
            return view('error')->withErrorMessage($response->content());
        }

        $request_token = json_decode($response->getContent())->code;

        $request->session()->put('request_token', $request_token);

        $query_vars = [
            'request_token' => $request_token,
            'redirect_uri'  => $redirect_uri
        ];

        return response()->json([
            'redirect_to' => 'https://getpocket.com/auth/authorize?' .
            http_build_query($query_vars)
        ]);
    }

    /**
     * Handles the result of the authentication request.
     * @param  Request $request
     * @return            [description]
     */
    public function handleAuthCallback(Request $request)
    {
        $response = $this->sendApiRequest('oauth/authorize',
            ['code' => $request->session()->get('request_token')]);

        if ($this->isErrorResponse($response)) {
            return redirect('/');
        }

        $responseObj = json_decode($response->getContent());

        $request->session()->put('access_token', $responseObj->access_token);
        $request->session()->put('username', $responseObj->username);

        return redirect('/');
    }

    /**
     * Gets the username from the session (if it's set).
     * @param  Request $request
     * @return json           Containing the username { username: '...' }
     */
    public function getUsername(Request $request)
    {
        return response()->json(['username' => $request->session()->get('username', '')]);
    }

    /**
     * Logs the user out by clearing the session.
     * @param  Request $request
     */
    public function logout(Request $request)
    {
        $request->session()->flush();

        return response()->json([]);
    }

    private function isErrorResponse($response)
    {
        return get_class($response) === 'Illuminate\Http\Response' &&
            $response->getStatusCode() !== 200;
    }

    /**
     * Sends an API request with the access token to Pocket API.
     * @param  string $operation        The API operation to perform (e.g. 'oauth/request', 'get' or 'send')
     * @param  array  $extraParameters  Extra parameters for the request
     * @return json                     The response from the API call.
     * If there's an error, a Response object is returned with the status code and the error message
     */
    private function sendApiRequest($operation, $extraParameters = [])
    {
        $client = new Client();

        $response = $client->post($_ENV['POCKET_API_URL'] . $operation, [
            // NOTE: Leave this as form_params, not json. That's how the Pocket API wants it.
            'form_params' => array_merge(
                ['consumer_key' => $_ENV['POCKET_CONSUMER_KEY']],
                $extraParameters),

            'headers' => ['X-Accept' => 'application/json'],
            'http_errors' => false
        ]);

        if ($response->getStatusCode() !== 200) {
            return response(head($response->getHeader('X-Error')), $response->getStatusCode());
        }

        return response($response->getBody())
            ->header('Content-Type', 'application/json; charset=utf-8');
    }
}
