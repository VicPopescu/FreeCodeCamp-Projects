/**
 * @description TO DO
 * @author Victor Popescu {@link https://github.com/VicPopescu}
 * 
 */

//Global DOM selectors
var $document = $('html');
var $root = $('#main');

/**
 * @public
 * @description Object used to store any helper functions
 */
var Helpers = (function () {

    /**
     * Public Exports
     */
    var PUBLIC = {
        //sets
        //gets
    };

    return PUBLIC;
})();

/**
 * @public
 * @description Components used for displaying different data to user
 */
var Display = (function () {

    /**
     * Public Exports
     */
    var PUBLIC = {
        //TO DO
    };

    return PUBLIC;
})();


/**
 * @public
 * @description Events handling
 */
var EventHandlers = (function () {

    /**
     * @public
     * @description Attach and initlialize event handlers
     */
    var init = function () {
        //TO BE
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
 * @description API requests
 */
var Api = (function () {

    /**
     * @public
     * @description TODO
     */
    var TODO = function () {

        var url = "TODO";

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
        //TO BE
    };

    return PUBLIC;
})();



/**
 * @public
 * @description Main application logic. This makes the entire potato running
 */
var WeatherApp = (function () {
    //TO DO or NOT TO DO
})();
