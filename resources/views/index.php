<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>SnapPocket</title>
    <link rel="stylesheet" type="text/css" href="/css/bootstrap/bootstrap.min.css">
    <style>
        body {
            color: #555;
            line-height: 2em;
        }

        #login {
            margin-top: 50px;
        }

        [v-cloak] {
            display: none;
        }

        .clickable {
            cursor: pointer;
        }

        .container {
            margin-bottom: 20px;
        }

    </style>
</head>
<body>
    <div id="pocketApp" class="container">

        <nav class="navbar navbar-default">
        <div class="container-fluid">
          <div class="navbar-header">
            <a class="navbar-brand" href="#">SnapPocket</a>
          </div>
          <div id="navbar" v-cloak v-show="username">
            <ul class="nav navbar-nav navbar-right">
              <li class="dropdown">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">{{ username }} <span class="caret"></span></a>
                <ul class="dropdown-menu">
                    <li><a href="" v-on="click: logout">Logout</a></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

        <div id="login" class="text-center" v-cloak v-show="! access_token">
            <button class="btn btn-lg btn-success" v-on="click: authorizeWithPocket">Log in with Pocket</a>
        </div>

        <div id="items" v-cloak v-show="access_token">
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

            <div id="status" class="text-center">{{ status_message }}</div>

            <div class="text-center">Page {{ currentPage }}</div>

            <button v-if="this.current_offset > 0"
                    class="pull-left btn btn-primary"
                    v-on="click: getItems(this.count, this.current_offset - this.count) ">&lt;&lt; Prev</button>
            <button class="pull-right btn btn-primary"
                    v-on="click: getItems(this.count, this.current_offset + this.count) ">Next &gt;&gt;</button>
        </div>
    </div>

    <script async src="/js/bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>
    <script src="/js/bootstrap.min.js"></script>
</body>
</html>