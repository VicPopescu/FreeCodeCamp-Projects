/**
 * @description Component that displays local weather informations from an API provided by {@link https://darksky.net Dark Sky API}
 * @author Victor Popescu {@link https://github.com/VicPopescu}
 * 
 */

//Global DOM selectors
var $document = $('html');
var $root = $('#main');
var $welcome = $('#welcome');
var $unitsChange = $('#unitsChange');
var $location = $('#location');

var $weatherInfoContainer = $('#weatherInfo'),
    $currentWeather = $('#currentWeather'),
    $currentWeatherContainer = $('#currentWeatherContainer'),
    $chartContainer = $('#nextDaysWeather'),
    $weatherChart = $('#weatherChart');

var weatherChart;


/**
 * @public
 * @description Object used to store any helper functions
 */
var Helpers = (function () {

    //store details about user location
    var location_details = {};

    /**
     * @private
     * @description Error handling when getting user position
     */
    var error_handler = function (error) {

        var message = "";

        switch (error.code) {

            case error.PERMISSION_DENIED:
                message = "User denied the request for Geolocation.";
                break;
            case error.POSITION_UNAVAILABLE:
                message = "Location information is unavailable.";
                break;
            case error.TIMEOUT:
                message = "The request to get user location timed out.";
                break;
            case error.UNKNOWN_ERROR:
                message = "An unknown error occurred.";
                break;
            default:
                message = "God know what happened...";
        };

        $document.empty().append('OOOoopsie... :|   ' + message).css({
            'padding-top': '10vh',
            'text-align': 'center'
        });
    };


    /**
     * @public
     * @description Construct location details (only coords for now)
     */
    var set_locationDetails = function (lat, long) {
        location_details.lat = lat;
        location_details.long = long;
    };


    /**
     * @public
     * @description Get user location coordinates using HTML5 Geolocation. This is async and used to get and later locally save user location details using "set_locationDetails" method.
     */
    var get_location_coords = function () {

        //use deferred object so we can handle async functions
        var coords = $.Deferred();
        //if browser support geolocation
        if (navigator.geolocation) {
            //get user location details
            navigator.geolocation.getCurrentPosition(function (position) {
                //get user coordinates
                coords.resolve(position.coords);

            }, error_handler);
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
        //return a promise to be handled later
        return coords.promise();
    };

    /**
     * @public
     * @description Get city
     */
    var set_userLocationDetails = function (lat, lng) {

        var geocoder = new google.maps.Geocoder();
        var latlng = new google.maps.LatLng(lat, lng);

        geocoder.geocode({
                'latLng': latlng
            },
            function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {

                    location_details.location = results;

                    if (results[1]) {

                        $location.text('').text(results[1].formatted_address);

                        //find country name
                        // for (var i = 0; i < results[0].address_components.length; i++) {
                        //     for (var b = 0; b < results[0].address_components[i].types.length; b++) {

                        //         //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                        //         if (results[0].address_components[i].types[b] == "administrative_area_level_1") {
                        //             //this is the object you are looking for
                        //             city = results[0].address_components[i];
                        //             break;
                        //         }
                        //     }
                        // }
                    } else {
                        alert("No results found");
                    }
                } else {
                    alert("Geocoder failed due to: " + status);
                }
            });
    }


    /**
     * @public
     * @description Get location details. This is the only function for returning all user details in global scope.
     * @return {object} location_details An object with user location details.
     */
    var get_locationDetails = function () {

        return location_details;
    };


    /**
     * @public
     * @description Parse a timestamp and returns only the hour.
     * @return {string} t The hour obtained from the timestamp (eg. 12:00:00").
     */
    var get_hourFromTimestamp = function (time) {

        var t = new Date(time * 1000).toLocaleString().replace(/.+\,/, '');

        return t;
    };


    /**
     * @public
     * @description Get wind direction
     * @return {string} dir Wind direction
     */
    var get_windDegToCompass = function (deg) {

        var val = Math.floor((deg / 22.5) + 0.5);
        var arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
        var dir = arr[(val % 16)]

        return dir;
    };


    /**
     * Public Exports
     */
    var PUBLIC = {
        //sets
        set_locationDetails: set_locationDetails,
        //gets
        get_location_coords: get_location_coords,
        get_locationDetails: get_locationDetails,
        get_hourFromTimestamp: get_hourFromTimestamp,
        get_windDegToCompass: get_windDegToCompass,
        set_userLocationDetails: set_userLocationDetails
    };

    return PUBLIC;
})();



/**
 * @public
 * @description Weather informations handling
 */
var Weather = (function () {

    //weather details
    var all_weather_details = {};
    var daily_weather_details = {};
    var current_weather_details = {};
    var units;


    /**
     * @public
     * @description Construct weather details
     */
    var set_weatherDetails = function (weatherData) {

        all_weather_details = weatherData;
        daily_weather_details = weatherData.daily;
        current_weather_details = weatherData.currently;
        units = all_weather_details.flags.units;
    };


    /**
     * @public
     * @description Return weather details
     * @param {string} flag Which details need to be fetched (all, daily, currently)
     */
    var get_weather_details = function (flag) {

        switch (flag) {
            case 'all':
                return all_weather_details;
            case 'daily':
                return daily_weather_details;
            case 'currently':
                return current_weather_details;
            default:
                break;
        };
    };


    /**
     * @public
     * @description Construct daily weather forecast
     * @returns {object} Daily forecast data
     */
    var get_dailyForecast = function () {

        var maxTemperatureData = [];
        var allTempDetails = [];
        var maxPrecipDetails = [];
        var allPrecipDetails = [];
        var weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var days = [];

        daily_weather_details.data.forEach(function (weatherPerDay, index) {

            maxTemperatureData.push(weatherPerDay.temperatureMax);
            maxPrecipDetails.push((weatherPerDay.precipProbability * 100).toFixed());

            var time = new Date(weatherPerDay.time * 1000);
            var dayName = weekDays[time.getDay()];
            days.push(dayName);


            allTempDetails.push([
                'Max: ' + weatherPerDay.temperatureMax + get_weatherUnits().t,
                'MaxTime: ' + Helpers.get_hourFromTimestamp(weatherPerDay.temperatureMaxTime),
                'Min: ' + weatherPerDay.temperatureMin + get_weatherUnits().t,
                'MinTime: ' + Helpers.get_hourFromTimestamp(weatherPerDay.temperatureMinTime),
            ]);

            allPrecipDetails.push([
                'Probability: ' + (weatherPerDay.precipProbability * 100).toFixed() + '%',
                'Intensity: ' + (weatherPerDay.precipIntensity) + get_weatherUnits().p,
                'Max Intensity: ' + (weatherPerDay.precipIntensityMax) + get_weatherUnits().p,
                'Type: ' + (weatherPerDay.precipType || "No precipitations! :)")
            ]);
        });

        return {
            dailyMaxTemp: maxTemperatureData, // Max temperature for next days. The chart "temperature" lines will be based on this data
            dailyAllTemp: allTempDetails, // More information about temperature. This will be displayed in the chart temperature tooltip
            dailyMaxPrecip: maxPrecipDetails, // Max precipitations for next days. The chart "precipitations" lines will be based on this data
            dailyAllPrecip: allPrecipDetails, // More information about precipitations. This will be displayed in the chart precipitations tooltip
            days: days // All days with data from forecast (starting on current day and next 7 days, usually)
        };
    }


    /**
     * @public
     * @description Get unit measurement for different zones (eg. EU: Degrees Celsius for Temperature, Millimeters per hour for Precipitations etc)
     */
    var get_weatherUnits = function () {

        var localUnits = {};

        /** LEGEND:
         *      t : temperature
         *      p : precipitations
         *      w : wind speed
         *      v : visibility
         *  press : pressure
         */
        switch (units) {
            case 'ca':
                localUnits = {
                    t: '\u00B0C',
                    p: ' mm/h',
                    w: ' km/h',
                    v: ' km',
                    press: ' hPa'
                };
                break;
            case 'si':
                localUnits = {
                    t: '\u00B0C',
                    p: ' mm/h',
                    w: ' m/s',
                    v: ' km',
                    press: ' hPa'
                };
                break;
            case 'uk2':
                localUnits = {
                    t: '\u00B0C',
                    p: ' mm/h',
                    w: ' miles/h',
                    v: ' miles',
                    press: ' hPa'
                };
                break;
            case 'us':
                localUnits = {
                    t: '\u00B0F',
                    p: ' inches/h',
                    w: ' miles/h',
                    v: ' miles',
                    press: ' mbar'
                };
                break;
            default:
                break;
        }
        return localUnits;
    };


    /**
     * @public
     * @description Get Weather Icon
     */
    var get_weatherIcon = function (icon) {

        switch (icon) {
            case "clear-day":
                return 'sunny';

            case "clear-night":
                return 'clear-moon';

            case "cloudy":
                return 'cloudy';

            case "partly-cloudy-day":
                return 'partly-cloudy-day';

            case "partly-cloudy-night":
                return 'partly-cloudy-night';

            case "thunderstorm":
                return 'thunder-storm';

            case "rain":
                return 'rainy';

            case "snow":
                return 'flurries';

                //TODO:
            case "sleet":
                return 'TODO';

            case "wind":
                return 'TODO';

            case "fog":
                return 'TODO';

            case "hail":
                return 'TODO';

            case "tornado":
                return 'TODO';

            default:
                return;
        };
    };

    /**
     * Public Exports
     */
    var PUBLIC = {
        //set
        set_weatherDetails: set_weatherDetails,
        //get
        get_weather_details: get_weather_details,
        get_weatherUnits: get_weatherUnits,
        get_dailyForecast: get_dailyForecast,
        get_weatherIcon: get_weatherIcon
    };

    return PUBLIC;
})();



/**
 * @public
 * @description Charts handling. Provider: Chart.js/2.5.0
 */
var Charts = (function () {

    /**
     * @public
     * @description Create chart
     * @param {object} $container Target container, where the chart will be contained
     * @param {object} providedData Data to be displayed in the chart
     * @param {string} customType What type of chart should be (line, bar, pie etc). In this case only line chart applies
     * @param {object} customOptions Null || Custom options to replace chart options object
     */
    var create_chart = function ($container, providedData, customType, customOptions) {

        var dailyForecast = Weather.get_dailyForecast();

        var c = document.getElementById("weatherChart");
        var d = c.getContext("2d");


        /*
         *   Chart color settings
         */
        //creating color gradients for temperature
        var temperatureGradient = d.createLinearGradient(0, 0, 0, 450);
        temperatureGradient.addColorStop(0, 'rgba(255, 102, 0, 0.8)');
        temperatureGradient.addColorStop(0.5, 'rgba(255, 102, 0, 0.25)');
        temperatureGradient.addColorStop(1, 'rgba(255, 102, 0, 0)');
        //creating color gradients for precipitations
        var precipitationsGradient = d.createLinearGradient(0, 0, 0, 450);
        precipitationsGradient.addColorStop(0, 'rgba(0, 204, 204, 0.8)');
        precipitationsGradient.addColorStop(0.5, 'rgba(0, 204, 204, 0.25)');
        precipitationsGradient.addColorStop(1, 'rgba(0, 204, 204, 0)');

        /**
         * Custom Temperature dataset
         */
        var temperature = {
            id: "Temp",
            label: "Temperature",
            data: dailyForecast.dailyMaxTemp,
            moreDetails: dailyForecast.dailyAllTemp,
            backgroundColor: temperatureGradient,
            borderColor: "rgba(255, 51, 0, 1)",
            borderCapStyle: 'butt',
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            borderWidth: 1,
            pointBorderColor: "rgba(255, 51, 0, 1)",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(255, 51, 0, 1)",
            pointHoverBorderColor: "rgba(255, 51, 0, 1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            yAxisID: 'Temp',
            stack: 'Temp'
        };


        /**
         * Custom Precipitations dataset
         */
        var precipitations = {
            id: "Precip",
            label: "Precipitations",
            data: dailyForecast.dailyMaxPrecip,
            moreDetails: dailyForecast.dailyAllPrecip,
            backgroundColor: precipitationsGradient,
            borderColor: "rgba(75,192,192,1)",
            borderCapStyle: 'butt',
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            borderWidth: 1,
            pointBorderColor: "rgba(75,192,192,1)",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(75,192,192,1)",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            yAxisID: 'Precip',
            stack: 'Precip'
        };

        /**
         * Custom Y axes properties
         */
        var customWeatherYAxes = [{
            id: 'Temp',
            type: 'linear',
            position: 'left',
            stacked: true,
            gridLines: {
                color: 'rgba(255, 51, 0, 0.1)'
            },
            ticks: {
                fontColor: temperatureGradient,
                callback: function (label, index, labels) {
                    return label + Weather.get_weatherUnits().t;
                }
            },
            scaleLabel: {
                display: true,
                fontColor: 'rgba(255, 51, 0, 1)',
                fontSize: 14,
                labelString: 'Temp ' + Weather.get_weatherUnits().t
            }
        }, {
            id: 'Precip',
            type: 'linear',
            position: 'right',
            stacked: true,
            gridLines: {
                color: 'rgba(75, 192, 192, 0.1)'
            },
            ticks: {
                fontColor: precipitationsGradient,
                callback: function (label, index, labels) {
                    return label ? label + '%' : "";
                }
            },
            scaleLabel: {
                id: 'Temp',
                display: true,
                fontColor: 'rgba(75, 192, 192, 1)',
                fontSize: 14,
                labelString: 'Precip prob %'
            }
        }];

        /**
         * Chart legend "on click" handler. Toggling chart data for each dataset
         */
        var legend_onClick = function (event, legendItem) {

            var datasetIndex = legendItem.datasetIndex;
            var datasetId = weatherChart.data.datasets[datasetIndex].id;

            for (var key in weatherChart.data.datasets[datasetIndex]._meta) {
                var i = key;
            }

            var a = weatherChart.data.datasets[datasetIndex]._meta[i];

            if (a.hidden) {
                a.hidden = false;
                weatherChart.scales[datasetId].options.scaleLabel.display = true;
            } else {
                a.hidden = true;
                weatherChart.scales[datasetId].options.scaleLabel.display = false;
            }
            weatherChart.update();
        };


        /**
         * Chart tooltips callbacks to customize displayed informations
         */
        var weatherTooltipCallbacks = {

            title: function (tooltipItem, data) {

                var datasetIndex = tooltipItem[0].datasetIndex;
                var label1 = tooltipItem[0].xLabel;
                var label2 = data.datasets[datasetIndex].label;

                return label1 + "'s " + label2 || "Potato Title not found...";
            },
            label: function (tooltipItems, data) {

                var datasetIndex = tooltipItems.datasetIndex;
                var tooltopIndex = tooltipItems.index;

                return data.datasets[datasetIndex].moreDetails[tooltopIndex] || "Potato Label not found...";
            }
        };


        /**
         * Chart custom options for weather chart
         */
        var weatherChartOptions = {
            responsive: true,
            maintainAspectRatio: true,
            animation: {
                easing: 'easeInOutQuad',
                duration: 1000
            },
            scales: {
                xAxes: [{
                    gridLines: {
                        color: 'rgba(200, 200, 200, 0.1)'
                    },
                    ticks: {
                        fontColor: 'rgba(255, 255, 255, 0.7)',
                    },
                }],
                yAxes: customWeatherYAxes
            },
            elements: {
                line: {
                    tension: 0.4
                }
            },
            legend: {
                position: 'bottom',
                labels: {
                    fontSize: 12,
                    fontColor: 'rgba(255, 255, 255, 0.7)'
                },
                onClick: legend_onClick
            },
            tooltips: {
                backgroundColor: 'rgba(49, 49, 52, 0.7)',
                bodyFontColor: 'rgba(255, 255, 255, 0.7)',
                bodyFontSize: 16,
                bodySpacing: 10,
                caretSize: 10,
                cornerRadius: 4,
                titleFontColor: 'rgba(255, 255, 255, 0.9)',
                titleFontSize: 18,
                titleSpacing: 10,
                titleMarginBottom: 10,
                displayColors: false,
                xPadding: 10,
                yPadding: 10,
                callbacks: weatherTooltipCallbacks
            }
        };

        //global fonts for chart
        Chart.defaults.global.defaultFontFamily = "'Roboto', sans-serif";

        /**
         *  Finally... Chart constructing using previously created custom options or other passed options (if any)
         */
        //destroy previously created chart, if any, then create new chart instance
        weatherChart && weatherChart.destroy() || (weatherChart = new Chart($container, {
            type: customType || 'bar',
            data: {
                labels: dailyForecast.days,
                datasets: [temperature, precipitations]
            },
            options: customOptions || weatherChartOptions
        }))


    };


    /**
     * Public Exports
     */
    var PUBLIC = {

        create_chart: create_chart
    };

    return PUBLIC;
})();


/**
 * @public
 * @description Components used for displaying different data to user
 */
var Display = (function () {

    /**
     * @public
     * @description Display current weather informations
     */
    var display_currentWeather = function ($container, currentWeatherData) {

        //all details for current potato weather
        var apparentTemp = currentWeatherData.apparentTemperature,
            temperature = currentWeatherData.temperature,
            dewPoint = currentWeatherData.dewPoint,
            cloudCover = currentWeatherData.cloudCover,
            humidity = currentWeatherData.humidity,
            ozone = currentWeatherData.ozone,
            precipProbability = currentWeatherData.precipProbability,
            precipIntensity = currentWeatherData.precipIntensity,
            precipType = currentWeatherData.precipType,
            pressure = currentWeatherData.pressure,
            windSpeed = currentWeatherData.windSpeed,
            windBearing = currentWeatherData.windBearing,
            time = currentWeatherData.time,
            icon = currentWeatherData.icon;

        //template construction
        var template = '';
        template += '<p>Apparent Temperature: <span class="lightblue">' + apparentTemp + Weather.get_weatherUnits().t + '</span></p>';
        template += '<p>Temperature: <span class="lightblue">' + temperature + Weather.get_weatherUnits().t + '</span></p>';
        template += '<p>Humidity: <span class="lightblue">' + (humidity * 100).toFixed() + '%</span></p>';
        template += '<p>Precipitations Probability: <span class="lightblue">' + (precipProbability * 100).toFixed() + '%</span></p>';
        precipIntensity && (template += '<p>Precipitations Intensity: <span class="lightblue">' + precipIntensity + Weather.get_weatherUnits().p + '</span></p>');
        precipType && (template += '<p>Precipitations Type: <span class="lightblue">' + precipType + '</span></p>');
        template += '<p>Preassure: <span class="lightblue">' + pressure + Weather.get_weatherUnits().press + '</span></p>';
        template += '<p>Wind Speed: <span class="lightblue">' + windSpeed + Weather.get_weatherUnits().w + '</span></p>';
        windBearing && (template += '<p>Wind Coming From: <span class="lightblue">' + Helpers.get_windDegToCompass(windBearing) + '</span></p>');

        //DOM manipualtions
        $container.empty().append(template);
        $container.siblings('.icon').hide();
        $container.siblings('.icon.' + Weather.get_weatherIcon(icon)).clearQueue().stop();
        $container.siblings('.icon.' + Weather.get_weatherIcon(icon)).show(1000).css('display', 'inline-block');
    };

    /**
     * Public Exports
     */
    var PUBLIC = {

        display_currentWeather: display_currentWeather
    };

    return PUBLIC;
})();

/**
 * @public
 * @description Events handling
 */
var EventHandlers = (function () {

    var loading = false;

    /**
     * @private
     * @description Get weather for SI, CA, UK2, US systems of measurement
     */
    var getNewUnitsData = function () {

        var el = $(this);
        var unit = el.data('unit');


        if (!el.hasClass('selected') && loading === false) {

            loading = true;

            el.addClass('selected');
            el.siblings().removeClass('selected');

            var weatherInfo = Api.get_weatherInfo(Helpers.get_locationDetails().lat, Helpers.get_locationDetails().long, unit);
            //then:
            weatherInfo.done(function (statistics) {
                //display page after all data is fetched
                $document.fadeIn(1000);
                //construct weather details
                Weather.set_weatherDetails(statistics);
                //create chart ($container, data, customType, customOptions)
                Charts.create_chart($weatherChart, Weather.get_weather_details('daily'), 'line', null);
                //display today's weather forecast ($container, data)
                Display.display_currentWeather($currentWeatherContainer, Weather.get_weather_details('currently'));

                loading = false;
            });
        }
    };


    /**
     * @public
     * @description Attach and initlialize event handlers
     */
    var init = function () {

        $unitsChange.find('li').off('click.changeUnits').on('click.changeUnits', getNewUnitsData);
    };

    /**
     * Public Exports
     */
    var PUBLIC = {

        init: init
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
    var get_weatherInfo = function (latitude, longitude, units) {

        var url = "https://crossorigin.me/https://api.darksky.net/forecast/d212e752e77024fa82c5713e0debad8b/" + latitude + "," + longitude + "?units=" + (units || 'auto') + "&exclude=minutely";

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
 * @description Main application logic. This makes the entire potato running
 */
var WeatherApp = (function () {

    //get user location coordinates
    var getCoords = Helpers.get_location_coords();
    //then:
    getCoords.done(function (coords) {

        //set user latitude and longitude and city
        Helpers.set_locationDetails(coords.latitude, coords.longitude);
        Helpers.set_userLocationDetails(coords.latitude, coords.longitude);
        //get weather info using previously obtained coords
        var weatherInfo = Api.get_weatherInfo(Helpers.get_locationDetails().lat, Helpers.get_locationDetails().long, 'ca');
        //then:
        weatherInfo.done(function (statistics) {
            //default units highlight
            $unitsChange.find('[data-unit="auto"]').addClass('selected');
            //display page after all data is fetched
            $document.fadeIn(1000);
            //construct weather details
            Weather.set_weatherDetails(statistics);
            //create chart ($container, data, customType, customOptions)
            Charts.create_chart($weatherChart, Weather.get_weather_details('daily'), 'line', null);
            //display today's weather forecast ($container, data)
            Display.display_currentWeather($currentWeatherContainer, Weather.get_weather_details('currently'));
            //attach event handlers
            EventHandlers.init();
        });
    });
})();