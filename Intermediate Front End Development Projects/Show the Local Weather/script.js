/**
 * @author Victor Popescu {@link https://github.com/VicPopescu}
 * @description Component that displays local weather informations from an API provided by {@link https://darksky.net Dark Sky API}
 */

//Global DOM selectors
var $root = $('main');

/**
 * @public
 * @description Object used to store any helper function
 */
var Helpers = (function () {

    var location_details = {};

    /**
     * @private
     * @description Error handling when getting user position
     */
    var error_handler = function (error) {

        switch (error.code) {

            case error.PERMISSION_DENIED:
                console.log("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                console.log("Location information is unavailable.");
                break;
            case error.TIMEOUT:
                console.log("The request to get user location timed out.")
                break;
            case error.UNKNOWN_ERROR:
                console.log("An unknown error occurred.");
                break;
        };
    };


    /**
     * @private
     * @description Construct location details (City, Country, Population etc)
     */
    var set_locationDetails = function (lat, long) {
        location_details.lat = lat;
        location_details.long = long;
    };


    /**
     * @public
     * @description Get user location coordinates using HTML5 Geolocation
     */
    var get_location_coords = function () {

        var coords = $.Deferred();

        if (navigator.geolocation) {

            navigator.geolocation.getCurrentPosition(function (position) {

                coords.resolve(position.coords);

            }, error_handler);
        } else {
            console.log("Geolocation is not supported by this browser.");
        }

        return coords.promise();
    };


    /**
     * @private
     * @description Get location details (City, Country, Population etc)
     */
    var get_locationDetails = function () {

        return location_details;
    };


    /**
     * Public Exports
     */
    var PUBLIC = {
        //sets
        set_locationDetails: set_locationDetails,
        //gets
        get_location_coords: get_location_coords,
        get_locationDetails: get_locationDetails
    };

    return PUBLIC;
})();



/**
 * @public
 * @description 
 */
var Weather = (function () {

    //var Currently;        //Current weather contitions at the requested location
    //var Daily;            //Weather conditions hour-by-hour for the next two days
    //var Hourly;           //Weather conditions day-by-day for the next week.
    //var Alerts;           //If present, contains any severe weather alerts pertinent to the requested location.

    //weather details
    var weather_details = {};


    /**
     * @private
     * @description Construct weather details
     */
    var set_weatherDetails = function (weatherData) {

        weather_details = weatherData;

        // Currently = weatherData.currently || null;
        // Daily = weatherData.daily || null;
        // Hourly = weatherData.daily || null;
        // Alerts = weatherData.alerts || null;
    };


    /**
     * @private
     * @description Construct weather details
     */
    var get_weatherDetails = function () {

        return weather_details;
    };

    /**
     * Public Exports
     */
    var PUBLIC = {

        set_weatherDetails: set_weatherDetails,
        get_weatherDetails: get_weatherDetails
    };

    return PUBLIC;
})();

/**
 * @public
 * @description API providers
 */
var Api = (function () {

    /**
     * @public
     * @description Get a weather informations from {@link api.darksky.net/forecast Forecast}
     */
    var get_weatherInfo = function (latitude, longitude) {

        var url = "https://crossorigin.me/https://api.darksky.net/forecast/d212e752e77024fa82c5713e0debad8b/" + latitude + "," + longitude + "?exclude=flags,minutely";

        return $.ajax({
            type: 'GET',
            async: true,
            url: url,
            dataType: 'json',
            error: function () {
                alert("Something went wrong with the server...");
            }
        });
    };


    /**
     * Public exports
     */
    var PUBLIC = {
        get_weatherInfo: get_weatherInfo
    };

    return PUBLIC;
})();



/**
 * @public
 * @description Main application logic
 */
var WeatherApp = (function () {

    //get user location coordinates
    var getCoords = Helpers.get_location_coords();
    //then:
    getCoords.done(function (coords) {

        //user latitude and longitude
        Helpers.set_locationDetails(coords.latitude, coords.longitude);

        //get weather info using previously obtained coords
        var weatherInfo = Api.get_weatherInfo(Helpers.get_locationDetails().lat, Helpers.get_locationDetails().long);
        //then:
        weatherInfo.done(function (statistics) {

            //construct location details
            //Helpers.set_locationDetails(statistics);
            //construct weather details
            Weather.set_weatherDetails(statistics);
            //

            console.log(Weather.get_weatherDetails());

            var ctx = $("#weatherChart");

            var myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
                    datasets: [{
                        label: '# of Votes',
                        data: [12, 19, 3, 5, 2, 7],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255,99,132,1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });

            
        });
    });
})();