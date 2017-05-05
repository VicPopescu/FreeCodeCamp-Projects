/**
 * @author Victor Popescu {@link https://github.com/VicPopescu}
 * @description Component that displays local weather informations from an API provided by {@link https://openweathermap.org OpenWeatherMap}
 */

//Global DOM selectors
var $root = $('main');

/**
 * @public
 * @description Object used to store any helper function
 */
var Helpers = (function () {

    var location_details;
    var weather_details;

    /**
     * @private
     * @description Error handling when getting user position
     */
    var error_handler = function (error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                x.innerHTML = "User denied the request for Geolocation."
                break;
            case error.POSITION_UNAVAILABLE:
                x.innerHTML = "Location information is unavailable."
                break;
            case error.TIMEOUT:
                x.innerHTML = "The request to get user location timed out."
                break;
            case error.UNKNOWN_ERROR:
                x.innerHTML = "An unknown error occurred."
                break;
        }
    };


    /**
     * @private
     * @description Construct location details (City, Country, Population etc)
     */
    var set_locationDetails = function (location) {

        //var location = location.city;

        location_details = {
            country: location.country,
            city: location.name,
            population: location.population
        };
    };


    /**
     * @private
     * @description Construct weather details
     */
    var set_weatherDetails = function (weather) {

        weather_details = weather;

        // weather.forEach(function (val) {

        //     var dateTime = val.dt,
        //         dateTimeStr = val.dt_txt,
        //         clouds = val.clouds,
        //         main = val.main,
        //         rain = val.rain,
        //         weather = val.weather,
        //         wind = val.wind;
        // });
    };

    /**
     * @private
     * @description Get location details (City, Country, Population etc)
     */
    var get_locationDetails = function () {

        return location_details;
    };


    /**
     * @private
     * @description Construct weather details ()
     */
    var get_weatherDetails = function () {

        return weather_details;
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
     * Public Exports
     */
    var PUBLIC = {

        set_locationDetails: set_locationDetails,
        set_weatherDetails: set_weatherDetails,

        get_location_coords: get_location_coords,
        get_locationDetails: get_locationDetails,
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
     * @description Get a weather informations from {@link api.openweathermap.org}
     */
    var get_weatherInfo = function (latitude, longitude) {

        return $.ajax({
            async: true,
            url: "http://api.openweathermap.org/data/2.5/forecast?lat=" + latitude + "&lon=" + longitude + "&APPID=12e59094f11208eb3f96af241f52462b",
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
    }

    return PUBLIC;

})();



/**
 * @public
 * @description Main application logic
 */
var WeatherApp = (function () {

    var getCoords = Helpers.get_location_coords();

    getCoords.done(function (coords) {

        latitude = coords.latitude;
        longitude = coords.longitude;

        var weatherInfo = Api.get_weatherInfo(latitude, longitude);

        weatherInfo.done(function (statistics) {

            Helpers.set_locationDetails(statistics.city);
            Helpers.set_weatherDetails(statistics.list);

            var a = Helpers.get_locationDetails();
            console.log(a);
            var b = Helpers.get_weatherDetails();
            console.log(b);
        });
    });
})();