/**
 * @author Victor Popescu {@link https://github.com/VicPopescu}
 * @description See available streams from Twitch TV
 */
var twitchTvStreams = (function () {

    var $menuItem = $('#menu li'),
        $streamsList = $('#streamsList'),
        $loading = $('.loading'),
        $searchField = $('#searchField');

    var networkBusy = false;
    var channels = ["brunofin", "comster404", "ESL_SC2", "OgamingSC2", "cretetion", "freecodecamp", "storbeck", "habathcx", "RobotCaleb", "noobs2ninjas"];


    var Handlers = (function () {

        var menuSelection = function () {

            if (networkBusy) return false;

            var selection = $(this).data('selection');

            if (!$(this).hasClass('selected')) {

                $menuItem.removeClass('selected');
                $(this).addClass('selected');

                Api.processData(channels, selection);
            }

        };

        var doFilter = function () {

            var keyword = $(this).val();
            var items = $streamsList.children();

            if (!keyword) {
                items.show();
                return false;
            } else {

                var reg = new RegExp(keyword);

                for (var i = 0; i < items.length; i++) {

                    var key = items[i].dataset.name;

                    if (!reg.test(key)) {
                        $(items[i]).hide();
                    }else{
                        $(items[i]).show();
                    }
                }
            }
        };

        var init = function () {
            $menuItem.on('click.menuSelection', menuSelection);
            $searchField.on('keyup.doFilter', doFilter);
        };

        /**
         * Public exports
         */
        var PUBLIC = {
            init: init
        };

        return PUBLIC;

    })();

    /**
     * Api calls
     */
    var Api = (function () {

        /**
         * Fetching data from twitch API
         * @param {*} type The type of the get: stream or channel
         * @param {*} name the channel or stream name to search for
         */
        var get_data = function (type, name) {

            var url = "https://wind-bow.glitch.me/twitch-api/" + type + "/" + name;

            return $.ajax({
                type: 'GET',
                async: true,
                url: url,
                dataType: 'json',
                error: function (error) {
                    alert("Something went wrong with the server... ");
                    console.log(error);
                    networkBusy = false;
                }
            });
        };

        /**
         * Processing the received data
         * @param {*} channels All channels
         */
        var processData = function (channels, selection) {

            networkBusy = true;
            $streamsList.empty();
            $loading.show();

            channels.forEach(function (name, i) {

                var channel = get_data("channels", name);

                channel.done(function (channelData) {

                    var stream = get_data("streams", name);

                    stream.done(function (streamData) {

                        Display.displayItems(channelData, streamData, selection);
                        $loading.hide();

                        if (i === channels.length - 1) {
                            networkBusy = false;
                        }
                    });
                });
            });
        };

        /**
         * Public exports
         */
        var PUBLIC = {
            get_data: get_data,
            processData: processData
        };

        return PUBLIC;
    })();


    /**
     * Display items
     */
    var Display = (function () {

        /**
         * @param {*} channelData All details about the channel
         * @param {*} streamData All details about the stream
         */
        var displayItems = function (channelData, streamData, selection) {

            switch (selection) {

                case "online":
                    if (!streamData.stream) return false;
                    break;
                case "offline":
                    if (streamData.stream) return false;
                    break;
                default:
                    break;
            }

            if(channelData.error){

                var message = channelData.message;
                var info = $('<li class="streamItem error"><p>Sorry... '+ message +'</p></li>');
                $streamsList.append(info);
                return false;
            }

            var chLink = channelData.url,
                chImage = channelData.logo || "https://via.placeholder.com/100x100",
                chName = channelData.name;
            var chAvailable, color, bgColor, chPreview;

            if (streamData.stream) {
                color = 'textGreen';
                bgColor = 'bgGreen';
                chAvailable = streamData.stream.channel.game + ': <span class="status">' + streamData.stream.channel.status + '</span>';
            } else {
                chAvailable = '&#x25CF; offline';
                color = 'textDark';
                bgColor = 'bgDark';
            }


            var template_listItem = function (l, i, n, av, c, b) {

                var t;

                t = $('<li class="streamItem" data-name="' + n + '" title="Click for channel view!"></li>');
                a = $('<a class="chLink" href="' + l + '" target="_blank"></a>').appendTo(t);
                $('<div class="chOnlineHint" data-color="' + b + '"></div>').appendTo(a);
                $('<img class="chImg" src="' + i + '" alt="Channel logo" />').appendTo(a);
                $('<span class="chName">' + n + '</span>').appendTo(a);
                $('<span class="chAvailability" data-color="' + c + '">' + av + ' </span>').appendTo(a);

                return t;
            };

            $streamsList.append(template_listItem(chLink, chImage, chName, chAvailable, color, bgColor));
        };

        /**
         * Public exports
         */
        var PUBLIC = {
            displayItems: displayItems
        };

        return PUBLIC;
    })();

    /**
     * Bake the entire potato
     */
    var PotatoRunning = (function () {

        Handlers.init();
        Api.processData(channels, "all");
        $menuItem.first().addClass("selected");
    })();

    //end component
})();