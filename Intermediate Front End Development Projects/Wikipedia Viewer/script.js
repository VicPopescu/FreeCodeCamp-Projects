/**
 * @description TO DO
 * @author Victor Popescu {@link https://github.com/VicPopescu}
 * 
 */

//Global DOM selectors
var $document = $('html');
var $root = $('#main');
var $resultsContainer = $('#searchResults');

/**
 * @public
 * @description Object used to store any helper functions
 */
var Helpers = (function () {

    var results;

    var set_wikiResult = function(data){
        results = data.query.search;
    };

    var get_wikiResults = function(){
        return results;
    }

    /**
     * Public Exports
     */
    var PUBLIC = {
        //sets
        set_wikiResult : set_wikiResult,
        //gets
        get_wikiResults : get_wikiResults
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
     * @description Fetch wikipedia pages based on keyword
     */
    var wiki_query = function (keyword) {

        var url = "https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=&list=search&srsearch="+ keyword +"&srnamespace=0&srlimit=10";

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
        wiki_query: wiki_query
    };

    return PUBLIC;
})();



/**
 * @public
 * @description Main application logic. This makes the entire potato running
 */
var WeatherApp = (function () {

    var keyword = "Bear";
    var wikiResults = Api.wiki_query(keyword);

    wikiResults.done(function(data){

        Helpers.set_wikiResult(data);

        var results = Helpers.get_wikiResults();

        for(var i = 0; i < results.length; i++){
            $resultsContainer.append(
                '<li><a href="https://en.wikipedia.org/wiki/'+ results[i].title +'" target="_blank"><p>'+ results[i].title +'</p>'+ results[i].snippet + '</a></li>'
            );
        }
    });

})();
