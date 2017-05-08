/**
 * @author Victor Popescu {@link https://github.com/VicPopescu}
 * @description Component that displays local weather informations from an API provided by {@link https://darksky.net Dark Sky API}
 */

//Global DOM selectors
var $root = $('main');
var $chartContainer = $('#chartContainer');
var $weatherChart = $('#weatherChart');

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
     * Public Exports
     */
    var PUBLIC = {
        //sets
        set_locationDetails: set_locationDetails,
        //gets
        get_location_coords: get_location_coords,
        get_locationDetails: get_locationDetails,
        get_hourFromTimestamp: get_hourFromTimestamp
    };

    return PUBLIC;
})();



/**
 * @public
 * @description Weather informations handling
 */
var Weather = (function () {


    //weather details
    var weather_details = {};
    var units;


    /**
     * @private
     * @description Construct weather details
     */
    var set_weatherDetails = function (weatherData) {

        weather_details = weatherData;
        units = weather_details.flags.units;
    };


    /**
     * @private
     * @description Construct weather details
     */
    var get_weatherDetails = function () {

        return weather_details;
    };


    /**
     * @private
     * @description Set unit measurement for different zones (eg. EU: Degrees Celsius for Temperature, Millimeters per hour for Precipitations etc)
     */
    var get_weatherUnits = function () { //TODO: add units for all tracked weather information

        var localUnits = {};
        
        //todo add units for more (wind, etc)
        switch (units) {
            case 'ca':
                localUnits = {
                    t: '\u00B0C',
                    p: ' mm/h'
                };
                break;
            case 'si':
                localUnits = {
                    t: '\u00B0C',
                    p: ' mm/h'
                };
                break;
            case 'uk2':
                localUnits = {
                    t: '\u00B0C',
                    p: ' mm/h'
                };
                break;
            case 'us':
                localUnits = {
                    t: '\u00B0F',
                    p: ' inches/h'
                };
                break;
            default:
                break;
        }
        return localUnits;
    };

    /**
     * Public Exports
     */
    var PUBLIC = {

        set_weatherDetails: set_weatherDetails,
        get_weatherDetails: get_weatherDetails,
        get_weatherUnits: get_weatherUnits
    };

    return PUBLIC;
})();



/**
 * @public
 * @description Charts handling. Provider: Chart.js/2.5.0
 */
var Charts = (function () {

    var create_chart = function ($container, providedData, customType, customOptions) {

        //chart container
        var ctx = $container;

        var temperatureData = [];
        var tempDetails = [];
        var precipDetails = [];
        var precipitationsData = [];
        var weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var days = [];

        providedData.data.forEach(function (weatherPerDay, index) {

            temperatureData.push(weatherPerDay.temperatureMax);
            precipitationsData.push((weatherPerDay.precipProbability * 100).toFixed());

            var time = new Date(weatherPerDay.time * 1000);
            var dayName = weekDays[time.getDay()];
            days.push(dayName);


            tempDetails.push([
                'Max: ' + weatherPerDay.temperatureMax + Weather.get_weatherUnits().t,
                'MaxTime: ' + Helpers.get_hourFromTimestamp(weatherPerDay.temperatureMaxTime),
                'Min: ' + weatherPerDay.temperatureMin + Weather.get_weatherUnits().t,
                'MinTime: ' + Helpers.get_hourFromTimestamp(weatherPerDay.temperatureMinTime),
            ]);

            precipDetails.push([
                'Probability: ' + (weatherPerDay.precipProbability * 100).toFixed() + '%',
                'Intensity: ' + (weatherPerDay.precipIntensity) + Weather.get_weatherUnits().p,
                'Max Intensity: ' + (weatherPerDay.precipIntensityMax) + Weather.get_weatherUnits().p,
                'Type: ' + weatherPerDay.precipType
            ]);
        });

        var c = document.getElementById("weatherChart");
        var d = c.getContext("2d");

        var temperatureGradient = d.createLinearGradient(0, 0, 0, 450);
        temperatureGradient.addColorStop(0, 'rgba(255, 102, 0, 0.8)');
        temperatureGradient.addColorStop(0.5, 'rgba(255, 102, 0, 0.25)');
        temperatureGradient.addColorStop(1, 'rgba(255, 102, 0, 0)');

        var precipitationsGradient = d.createLinearGradient(0, 0, 0, 450);
        precipitationsGradient.addColorStop(0, 'rgba(0, 204, 204, 0.8)');
        precipitationsGradient.addColorStop(0.5, 'rgba(0, 204, 204, 0.25)');
        precipitationsGradient.addColorStop(1, 'rgba(0, 204, 204, 0)');

        //TODO: make a generic constructor to avoid code repetitions
        var temperature = {
            label: "Temperature",
            data: temperatureData,
            moreDetails: tempDetails,
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
            yAxisID: 'Temp'
        };

        var precipitations = {
            label: "Precipitations",
            data: precipitationsData,
            moreDetails: precipDetails,
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
            yAxisID: 'Precip'
        };


        //build chart
        var myChart = new Chart(ctx, {
            type: customType || 'bar',
            data: {
                labels: days,
                datasets: [precipitations, temperature]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                animation: {
                    easing: 'easeInOutQuad',
                    duration: 520
                },
                scales: {
                    xAxes: [{
                        gridLines: {
                            color: 'rgba(200, 200, 200, 0.05)'
                        }
                    }],
                    yAxes: [{
                        id: 'Temp',
                        type: 'linear',
                        position: 'left',
                        ticks: {
                            max: 160,
                            min: 0,
                            fontColor: temperatureGradient,
                            callback: function (label, index, labels) {
                                return label + Weather.get_weatherUnits().t;
                            }
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Temperature ' + Weather.get_weatherUnits().t
                        }
                    }, {
                        id: 'Precip',
                        type: 'linear',
                        position: 'right',
                        ticks: {
                            max: 100,
                            min: 0,
                            fontColor: precipitationsGradient,
                            callback: function (label, index, labels) {
                                return label + '%';
                            }
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Precipitations'
                        },
                        gridLines: {
                            color: 'rgba(200, 200, 200, 0.08)'
                        }
                    }]
                },
                elements: {
                    line: {
                        tension: 0.4
                    }
                },
                legend: {
                    position: 'bottom'
                },
                point: {
                    backgroundColor: 'green'
                },
                tooltips: {
                    titleFontFamily: 'Open Sans',
                    titleSpacing: 10,
                    titleFontColor: 'white',
                    backgroundColor: 'rgba(49, 49, 52, 0.7)',
                    caretSize: 5,
                    bodySpacing: 8,
                    cornerRadius: 2,
                    xPadding: 10,
                    yPadding: 10,
                    callbacks: {
                        label: function (tooltipItems, data) {

                            var datasetIndex = tooltipItems.datasetIndex;
                            var tooltopIndex = tooltipItems.index;

                            return data.datasets[datasetIndex].moreDetails[tooltopIndex];
                        }
                    }
                }
            }
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
            console.log(statistics);
            //construct location details
            //Helpers.set_locationDetails(statistics);
            //construct weather details
            Weather.set_weatherDetails(statistics);

            //create chart ($container, customChartData, customType, customOptions)
            Charts.create_chart($weatherChart, Weather.get_weatherDetails().daily, 'line', null);
        });
    });
})();