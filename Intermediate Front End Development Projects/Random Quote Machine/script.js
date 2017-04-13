/**
 * @author Victor Popescu {@link https://github.com/VicPopescu}
 * @description Component used to fetch and display a random quote from an API provided by {@link https://quotesondesign.com/api-v4-0/ QuotesOnDesign}
 * Background images are provided by {@link https://source.unsplash.com/}
 */


/**
 * @public
 * @description Object used to store any helper function
 */
var Helpers = (function () {

    //array of preloaded images
    var preloaded_images = [];

    /**
     * @public
     * @description Takes an array of images src (images) and preload every image before need to be used
     */
    var images_preload = function (images, index) {

        index = index || 0;

        //till the end of images array
        if (images && images.length > index) {

            //create an image object to locally store the image
            var img = new Image();
            img.crossOrigin = '*';


            //when image is downloaded
            img.onload = function () {

                //set the page background to the current downloaded image
                $('#backgroundChange').css("background-image", "url(" + img.src + ")");

                //change quote background color according to page background-image brightness
                setTimeout(function () {
                    Helpers.get_bg_brightness(img, set_brightness);
                }, 10000);

                //postpose next image preload for certain time
                setTimeout(function () {
                    //recursive call to preload next image
                    images_preload(images, index + 1);
                }, 10000);
            }

            img.src = images[index];

        } else { //if all images are preloaded, reset the index to beginning and iterate through them

            index = 0;
            images_preload(images, index);
        }
    }


    /**
     * @private
     * @description Change quote container background color according to page background-image brightness
     * @param {number} brightness 
     */
    var set_brightness = function (brightness) {

        if (brightness > 100) {
            $('#randomQuote').css({
                'background-color': 'rgba(0,0,0,0.6)',
                'filter': 'alpha(opacity=40)'
            });
            $('#content').css({
                'color': 'white',
            });
            $('#source').css({
                'color': 'white'
            });
            $('#getQuote').css({
                'background-color': 'rgba(255,255,255,0.7)',
                'color': 'black'
            });
        } else {
            $('#randomQuote').css({
                'background-color': 'rgba(255,255,255,0.6)',
                'filter': 'alpha(opacity=40)'
            });
            $('#content').css({
                'color': 'black',
            });
            $('#source').css({
                'color': 'black'
            });
            $('#getQuote').css({
                'background-color': 'rgba(0,0,0,0.7)',
                'color': 'white'
            });
        }
    }


    /**
     * @public
     * @description 
     * @param {image} img 
     * @param {function} adjustBrightness 
     */
    var get_bg_brightness = function (img, adjustBrightness) {

        var colorSum = 0;

        // create canvas
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var data = imageData.data;
        var r, g, b, avg;

        for (var x = 0, len = data.length; x < len; x += 4) {
            r = data[x];
            g = data[x + 1];
            b = data[x + 2];

            avg = Math.floor((r + g + b) / 3);
            colorSum += avg;
        }

        var brightness = Math.floor(colorSum / (img.width * img.height));

        adjustBrightness(brightness);
    }

    /**
     * Public Methods
     */
    var PUBLIC = {
        images_preload: images_preload,
        get_bg_brightness: get_bg_brightness
    }

    return PUBLIC;

})();



/**
 * @public
 * @description API providers
 */
var Api = (function () {

    /**
     * @public
     * @description Get a random quote from {@link http://quotesondesign.com/}
     */
    var get_quote = function () {

        return $.ajax({
            url: "http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1&_jsonp=?",
            dataType: 'jsonp', //using jsonp to allow CORS (Cross-origin resource sharing)
            error: function () {
                alert("Something went wrong with the server...");
            }
        });
    };


    /**
     * Public methods
     */
    var PUBLIC = {
        get_quote: get_quote
    }

    return PUBLIC;

})();


/**
 * @public
 * @description Display quote on screen. Triggered when "New Awesome Quote" button is pressed.
 */
var displayRandomQuote = function () {

    //fetch a random quote from API
    var random_quote = Api.get_quote();

    /**
     * @private
     * @description Use quote retrieved from API and display it on page
     * @param {object} data Object retrieved from quote API
     */
    var display_quote = function (quote) {

        //dom selectors
        var $root = $('main'),
            $quote_container = $('#randomQuote'),
            $quote_title = $('#title'),
            $quote_content = $('#quote'),
            $quote_source = $('#source');

        //quote details from API
        var id = quote.id,
            title = quote.title,
            content = quote.content,
            source = quote.link;

        //append quote in DOM
        $quote_container.data("quote-id", id);
        $quote_content.fadeOut(500, function () {
            $(this).html(content).fadeIn(500);
        })
        $quote_source.text(title).prop('href', source);
    };

    //display quote when done fetching
    random_quote.done(function (data) {
        display_quote(data[0]);
    });
};



/**
 * @public
 * @description Main application logic
 */
var AwesomeQuoteGenerator = (function () {

    //array of images src
    var images = [
        "https://source.unsplash.com/category/nature/1920x1080",
        "https://source.unsplash.com/category/nature/1920x1081",
        "https://source.unsplash.com/category/nature/1920x1082",
        "https://source.unsplash.com/category/nature/1921x1080",
        "https://source.unsplash.com/category/nature/1921x1081",
        "https://source.unsplash.com/category/nature/1921x1082"
    ];

    //preload background images
    Helpers.images_preload(images);


    //attach event handlers
    $('#getQuote').on("click.getNewQuote", displayRandomQuote);

    $(function () {
        $('#getQuote').trigger('click.getNewQuote');
    })
})();