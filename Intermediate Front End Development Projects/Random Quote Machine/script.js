/**
 * @author Victor Popescu {@link https://github.com/VicPopescu}
 * @description Component used to fetch and display a random quote from an API provided by {@link https://quotesondesign.com/api-v4-0/ QuotesOnDesign}
 * Background images are provided by {@link https://source.unsplash.com/}
 */

//Global DOM selectors
var $root = $('main'),
    $background = $('#backgroundChange'),
    $quote_container = $('#randomQuote'),
    $quote_content = $('#content'),
    $quote_title = $('#title'),
    $quote_text = $('#quote'),
    $quote_source = $('#source'),
    $quote_getquote = $('#getQuote'),
    $quote_twittershare = $('#tweetQuote');


/**
 * @public
 * @description Object used to store any helper function
 */
var Helpers = (function () {


    /****      PRIVATE FUNCTIONS       ****/

    /**
     * @private
     * @description Change quote container background color according to page background-image brightness
     * @param {number} brightness 
     */
    var set_brightness = function (brightness) {

        //too bright image background
        if (brightness > 100) {
            $quote_container.css({
                'background-color': 'rgba(0,0,0,0.6)',
                'filter': 'alpha(opacity=40)'
            });
            $quote_content.css({
                'color': 'white',
            });
            $quote_source.css({
                'color': 'white'
            });
            $quote_getquote.css({
                'background-color': 'rgba(255,255,255,0.7)',
                'color': 'black'
            });

            //too dark image background
        } else {
            $quote_container.css({
                'background-color': 'rgba(255,255,255,0.6)',
                'filter': 'alpha(opacity=40)'
            });
            $quote_content.css({
                'color': 'black',
            });
            $quote_source.css({
                'color': 'black'
            });
            $quote_getquote.css({
                'background-color': 'rgba(0,0,0,0.7)',
                'color': 'white'
            });
        }
    };


    /****      PUBLIC FUNCTIONS       ****/

    /**
     * @public
     * @description Takes an array of images src (images) and preload every image before need to be used
     * @param {array} images Array holding images src's
     * @param {number} index Keep track of image index in array
     */
    var images_preload = function (images, index) {

        //keep track of image index in array
        index = index || 0;

        //till the end of images array
        if (images && images.length > index) {

            //create an image object to locally store the image. Set "crossOrigin" = ALL, to allow cross servers image fetching
            var img = new Image();
            img.crossOrigin = '*';

            //when the image is finished downloading
            img.onload = function () {

                //set the page background to the current downloaded image
                setTimeout(function () {
                    $background.css("background-image", "url(" + img.src + ")");
                },0);
                //change quote background color according to page background-image brightness
                setTimeout(function () {
                    Helpers.get_bg_brightness(img, set_brightness);
                }, 4000);
                //postpose next image preload for certain time
                setTimeout(function () {
                    //recursive call to preload next image
                    images_preload(images, index + 1);
                }, 10000);
            };

            //set current image object src, from images array
            img.src = images[index];

        } else { //if all images are preloaded, reset the index to beginning and iterate through them

            //reset iamges array index to 0
            index = 0;
            //start preloading images from index 0
            setTimeout(function () {
                images_preload(images, index);
            }, 0);
        }
    };


    /**
     * @public
     * @description Create a canvas from current background image, then calculate image brightness
     * @param {image} img Current background image object
     * @param {function|callback} adjustBrightness Adjust quote container brightness according to resulted brightness and this callback settings
     */
    var get_bg_brightness = function (img, adjustBrightness) {

        var colorSum = 0;

        // create canvas from image object
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

        //background image brightness
        var brightness = Math.floor(colorSum / (img.width * img.height));
        //adjust quote container brightness
        adjustBrightness(brightness);
    };


    /**
     * @public
     * @description This handles twitter sharing for the current quote. It will open a new smaller window with all details already in place
     */
    var share_on_twitter = function () {

        //details for sharing quote
        var baseURL = 'https://twitter.com/intent/tweet?hashtags=AwesomeQuotes&text=';
        var quote = $quote_text.text().slice(0, -1); //slice last breakpoint from quote string
        var author = $quote_source.text();
        var URL = baseURL + encodeURIComponent('"' + quote + '"  ' + author);
        //open new window
        window.open(URL, 'Tweet about it!', 'width=600,height=500');
    };


    /**
     * Public Exports
     */
    var PUBLIC = {
        images_preload: images_preload,
        get_bg_brightness: get_bg_brightness,
        share_on_twitter: share_on_twitter
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
     * @description Get a random quote from {@link http://quotesondesign.com/}
     */
    var get_quote = function () {

        return $.ajax({
            async: true,
            url: "https://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1&_jsonp=?",
            dataType: 'jsonp', //using jsonp to allow CORS (Cross-origin resource sharing)
            error: function () {
                alert("Something went wrong with the server...");
            }
        });
    };


    /**
     * Public exports
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

        //quote details from API
        var id = quote.id,
            title = quote.title,
            content = quote.content,
            source = quote.link;

        //append quote in DOM
        $quote_container.data("quote-id", id);
        $quote_text.fadeOut(500, function () {
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
    $quote_getquote.on("click.getNewQuote", displayRandomQuote);
    //share n twitter button handler bind
    $quote_twittershare.on('click', Helpers.share_on_twitter);
    //on first page load, fetch first quote and display it
    $(function () {
        $quote_getquote.trigger('click.getNewQuote');
    })
})();