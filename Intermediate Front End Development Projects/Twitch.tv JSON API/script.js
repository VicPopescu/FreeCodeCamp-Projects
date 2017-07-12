/**
 * @author Victor Popescu {@link https://github.com/VicPopescu}
 * @description See available streams from Twitch TV
 */
var twitchTvStreams = (function () {

    /**
     * Api calls
     */
    var Api = (function () {

        /**
         * 
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
                }
            });
        };

        /**
         * Public exports
         */
        var PUBLIC = {
            get_data: get_data
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
        var displayItems = function (channelData, streamData) {

            console.log(channelData);
            console.log(streamData);
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

        var channels = ["ESL_SC2", "OgamingSC2", "cretetion", "freecodecamp", "storbeck", "habathcx", "RobotCaleb", "noobs2ninjas"];

        channels.forEach(function (name) {

            var channel = Api.get_data("channels", name);

            channel.done(function (channelData) {

                var stream = Api.get_data("streams", name);

                stream.done(function (streamData) {

                    Display.displayItems(channelData, streamData);
                });
            });
        });

    })();

    //end entire component
})();