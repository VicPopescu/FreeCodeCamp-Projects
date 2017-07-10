/**
 * @description A wikipedia viewer. Search for wiki entries.
 * @author Victor Popescu {@link https://github.com/VicPopescu}
 * 
 */

//Global DOM selectors
var $document = $('html');
var $root = $('#main');
var $searchOptions = $('#searchOptions');
var $searchField = $('#searchField');
var $errors = $('#errors');
var $resultsContainer = $('#searchResults');

/**
 * @public
 * @description Object used to store any helper functions
 */
var Helpers = (function () {

    var results;

    var set_wikiResult = function (data) {
        results = data.query.search;
    };

    var get_wikiResults = function () {
        return results;
    }

    /**
     * Public Exports
     */
    var PUBLIC = {
        //sets
        set_wikiResult: set_wikiResult,
        //gets
        get_wikiResults: get_wikiResults
    };

    return PUBLIC;
})();

/**
 * @public
 * @description Components used for displaying different data to user
 */
var Display = (function () {

    var displayResults = function (keyword) {

        $resultsContainer.fadeOut('fast');

        var wikiResults = Api.wiki_query(keyword);

        wikiResults.done(function (data) {

            if (data.error) {
                $errors.empty().text("Something bad happened, we can't get the results...");
                $searchOptions.animate({
                    'margin-top': '10%'
                }, 500);
                return;
            } else {
                $errors.empty();
            }
            if (!data.continue) {
                $searchOptions.animate({
                    'margin-top': '10%'
                }, 500);
                $errors.empty().text("We couldn't find any results... Please try something else!");
                return;
            } else {
                $errors.empty();
            }

            //
            $searchOptions.animate({
                'margin-top': '1%'
            }, 500);

            //locally save the received data
            Helpers.set_wikiResult(data);
            //fetch the data to be used
            var results = Helpers.get_wikiResults();
            //clear previously searched
            $resultsContainer.empty();
            //loop through results, build list items and append them into DOM
            for (var i = 0; i < results.length; i++) {
                //result details
                var title = results[i].title,
                    description = results[i].snippet;
                //build item template
                var item = '<li><a href="https://en.wikipedia.org/wiki/' + title + '" target="_blank"><p>' + title + '</p>' + description + '</a></li>';
                //append item in the list
                $resultsContainer.append(item);
            }
            $resultsContainer.fadeIn('slow');
        });

    };
    /**
     * Public Exports
     */
    var PUBLIC = {
        displayResults: displayResults
    };

    return PUBLIC;
})();


/**
 * @public
 * @description Events handling
 */
var EventHandlers = (function () {

    var getWikiEntries = function (e) {

        //continue only if user presses "enter"
        if (e.which !== 13) return;

        var keyword = $(this).val();

        if (!keyword.length) {
            //
            $searchOptions.animate({
                'margin-top': '10%'
            }, 500);

            $resultsContainer.fadeOut('slow');
            $errors.empty().text("You can't search for nothingness...");

            return;
        }

        Display.displayResults(keyword);
    };

    /**
     * @public
     * @description Attach and initlialize event handlers
     */
    var init = function () {
        $searchField.on('keypress.getWikiEntries', getWikiEntries);
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

        var url = "https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=&list=search&srsearch=" + keyword + "&srnamespace=0&srlimit=10";

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
var WikiViewer = (function () {

    EventHandlers.init();
})();