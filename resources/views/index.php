<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Hot Pocket Links</title>
    <link rel="stylesheet" type="text/css" href="/css/bootstrap/bootstrap.min.css">
    <style>
        body {
            color: #555;
            line-height: 2em;
        }

        #passphrase {
            margin-top: 10px;
        }

        [v-cloak] {
            display: none;
        }

        .clickable {
            cursor: pointer;
        }

    </style>
</head>
<body>
    <div class="container">
        <div id="items" v-cloak>
            <div id="passphrase" class="text-center">
                <form v-show="! token" v-on="submit: getToken">
                    <div class="form-group form-inline">
                        <input type="text" v-model="passphrase" placeholder="Enter the passphrase" class="form-control input-lg" autofocus>
                        <input type="submit" value="Submit" class="form-control input-lg">
                    </div>
                </form>
            </div>

            <ol class="list-group" style="margin-top: 30px">
                <li v-repeat="items | orderBy 'time_added' -1" class="list-group-item">
                    <strong style="font-size:1.2em">{{ resolved_title | getDefault '(No Title Found)' }}</strong>
                    <div>
                        <small class="item_link">
                            <a style="color:#999;margin-right:10px" href="{{ resolved_url }}">{{ resolved_url | baseUrl }}</a>
                            <em>{{ time_added | formatDate }}</em>
                        </small>
                    </div>

                    <div>Open and:
                        <a href="{{ resolved_url }}" target="_blank" v-on="click: doAction('delete', item_id)">DELETE</a> |
                        <a href="{{ resolved_url }}" target="_blank" v-on="click: doAction('archive', item_id)">ARCHIVE</a> OR
                        <a class="clickable" v-on="click: doAction('delete', item_id)">JUST DELETE</a>
                    </div>
                </li>
            </ol>
        </div>
    </div>

    <script async src="/js/bundle.min.js"></script>
</body>
</html>