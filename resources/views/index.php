<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>HotPocket</title>
    <link rel="stylesheet" type="text/css" href="/css/bundle-1439572569887.min.css">
    <link href='http://fonts.googleapis.com/css?family=Source+Sans+Pro' rel='stylesheet' type='text/css'>
    <style>
        body {
            color: #555;
            line-height: 2em;
        }

        body, p, div, h1, h2, h3, h4, h5, h6 {
            font-family: 'Source Sans Pro';
        }

        #login {
            margin-top: 50px;
        }

        [v-cloak] {
            display: none;
        }

        .item_link {
            font-size: .9em;
        }

        .clickable {
            cursor: pointer;
        }

        .action_icons {
            padding-top: 5px;
        }

        .action_icon {
            padding-right: 50px;
        }

        .container {
            margin-bottom: 20px;
        }

    </style>

    <link rel="apple-touch-icon" sizes="57x57" href="/apple-touch-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="/apple-touch-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="/apple-touch-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon-76x76.png">
    <link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png">
    <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">
    <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32">
    <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96">
    <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16">
    <link rel="manifest" href="/manifest.json">
    <meta name="msapplication-TileColor" content="#2b5797">
    <meta name="theme-color" content="#ffffff">

</head>
<body>
    <div id="pocketApp" class="container">

        <nav class="navbar">
        <div class="container-fluid">
          <div class="navbar-header">
            <a class="navbar-brand" href="#"><img src="/images/hotpocket-banner.png" alt="HotPocket"></a>
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
            <button class="btn btn-lg btn-primary" v-on="click: authorizeWithPocket">Log in with Pocket</a>
        </div>

        <div id="items" v-cloak v-show="access_token">
            <ol class="list-group" style="margin-top: 30px">
                <li v-repeat="items | orderBy 'time_added' -1" class="list-group-item">
                    <strong style="font-size:1.3em">{{ resolved_title | getDefault '(No Title Found)' }}</strong>
                    <div>
                        <span class="item_link">
                            <a style="color:#999;margin-right:10px" href="{{ resolved_url }}">{{ resolved_url | baseUrl }}</a>
                            <em>{{ time_added | formatDate }}</em>
                        </span>
                    </div>

                    <div class="action_icons">
                        <a class="action_icon"
                           href="{{ resolved_url }}"
                           target="_blank"
                           v-on="click: doAction('delete', item_id)"
                           ><img src="/images/open_and_delete.png"
                                 title="Open and Delete"></a>

                        <a class="action_icon"
                           href="{{ resolved_url }}"
                           target="_blank"
                           v-on="click: doAction('archive', item_id)"
                           ><img src="/images/open_and_archive.png"
                                 title="Open and Archive"></a>

                        <a class="action_icon clickable"
                           v-on="click: doAction('delete', item_id)"
                           ><img src="/images/delete.png"
                                 title="Delete without opening"></a>
                    </div>
                </li>
            </ol>

            <div class="row">

                <div class="col-md-4 col-xs-4">
                    <button v-if="this.current_offset > 0"
                            class="pull-left btn btn-primary"
                            v-on="click: getItems(this.count, this.current_offset - this.count) ">&lt;&lt; Prev</button>
                </div>

                <div class="col-md-4 col-xs-4">
                    <div class="text-center">Page {{ currentPage }}</div>
                </div>

                <div class="col-md-4 col-xs-4">

                    <button class="pull-right btn btn-primary"
                            v-on="click: getItems(this.count, this.current_offset + this.count) ">Next &gt;&gt;</button>
                </div>
            </div>
        </div>
    </div>

    <script async src="/js/bundle-1439572569887.min.js"></script>
    <script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>
    <script src="/js/bootstrap.min.js"></script>
</body>
</html>