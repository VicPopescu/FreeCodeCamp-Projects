/**
 * @author Victor Popescu {@link https://github.com/VicPopescu}
 * @description Component that displays local weather informations from an API provided by {@link https://darksky.net Dark Sky API}
 */

//Global DOM selectors
var $document = $('html');
var $root = $('#main');
var $welcome = $('#welcome');

var $weatherInfoContainer = $('#weatherInfo'),
    $currentWeather = $('#currentWeather'),
    $currentWeatherContainer = $('#currentWeatherContainer'),
    $chartContainer = $('#nextDaysWeather'),
    $weatherChart = $('#weatherChart');

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
     * @private
     * @description Parse timestamp and returns only the hour
     */
    var get_hourFromTimestamp = function (time) {

        var t = new Date(time * 1000).toLocaleString();

        return t.replace(/.+\,/, '');
    };


    /**
     * @private
     * @description Get wind direction
     */
    var get_windDegToCompass = function(deg) {
        var val = Math.floor((deg / 22.5) + 0.5);
        var arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
        return arr[(val % 16)];
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
        get_windDegToCompass: get_windDegToCompass
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
     * @private
     * @description Construct weather details
     */
    var set_weatherDetails = function (weatherData) {

        all_weather_details = weatherData;
        daily_weather_details = weatherData.daily;
        current_weather_details = weatherData.currently;
        units = all_weather_details.flags.units;
    };


    /**
     * @private
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
     * @private
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
     * @private
     * @description Get unit measurement for different zones (eg. EU: Degrees Celsius for Temperature, Millimeters per hour for Precipitations etc)
     */
    var get_weatherUnits = function () { //TODO: add units for all tracked weather information

        var localUnits = {};

        /** Legend:
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
     * @private
     * @description Get Weather Icon
     */
    var get_weatherIcon = function (icon) {

        switch (icon) {
            case "clear-day":
                return 'sunny';

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

            case "sleet":
                return 'TODO';

            case "wind":
                return 'TODO';

            case "fog":
                return 'TODO';

            case "clear-night":
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

            if (weatherChart.data.datasets[datasetIndex]._meta[0].hidden) {
                weatherChart.data.datasets[datasetIndex]._meta[0].hidden = false;
                weatherChart.scales[datasetId].options.scaleLabel.display = true;
            } else {
                weatherChart.data.datasets[datasetIndex]._meta[0].hidden = true;
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
        var weatherChart = new Chart($container, {
            type: customType || 'bar',
            data: {
                labels: dailyForecast.days,
                datasets: [temperature, precipitations]
            },
            options: customOptions || weatherChartOptions
        });
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

        console.log(currentWeatherData);

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

        /** Legend:
         *      t : temperature
         *      p : precipitations
         *      w : wind speed
         *      v : visibility
         *  press : pressure
         */
        var template = '';
        template += '<p>Apparent Temperature: ' + apparentTemp + Weather.get_weatherUnits().t + '</p>';
        template += '<p>Temperature: ' + temperature + Weather.get_weatherUnits().t + '</p>';
        template += '<p>Humidity: ' + (humidity * 100).toFixed() + '%</p>';
        template += '<p>Precipitations Probability: ' + (precipProbability * 100).toFixed() + '%</p>';
        precipIntensity && (template += '<p>Precipitations Intensity: ' + precipIntensity + Weather.get_weatherUnits().p + '</p>');
        precipType && (template += '<p>Precipitations Type: ' + precipType + '</p>');
        template += '<p>Preassure: ' + pressure + Weather.get_weatherUnits().press + '</p>';
        template += '<p>Wind Speed: ' + windSpeed + Weather.get_weatherUnits().w + '</p>';
        windBearing && (template += '<p>Wind Coming From: ' + Helpers.get_windDegToCompass(windBearing) + '</p>');

        //DOM manipualtions
        $container.empty().append(template);
        $container.siblings('.icon').hide();
        $container.siblings('.icon.' + Weather.get_weatherIcon(icon)).toggle(1500).css('display', 'inline-block');
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
 * @description API providers
 */
var Api = (function () {

    /**
     * @public
     * @description Get a weather informations from {@link api.darksky.net/forecast Forecast}
     */
    var get_weatherInfo = function (latitude, longitude) {

        var url = "https://crossorigin.me/https://api.darksky.net/forecast/d212e752e77024fa82c5713e0debad8b/" + latitude + "," + longitude + "?units=auto&exclude=minutely";

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

        //user latitude and longitude
        Helpers.set_locationDetails(coords.latitude, coords.longitude);
        //get weather info using previously obtained coords
        var weatherInfo = Api.get_weatherInfo(Helpers.get_locationDetails().lat, Helpers.get_locationDetails().long);
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
        });
    });
})();