var preloaded_images = [];
var imageCount = 0;

var images = ["https://source.unsplash.com/category/nature/1920x1080",
    "https://source.unsplash.com/category/nature/1920x1081",
    "https://source.unsplash.com/category/nature/1920x1082",
    "https://source.unsplash.com/category/nature/1921x1080",
    "https://source.unsplash.com/category/nature/1921x1081",
    "https://source.unsplash.com/category/nature/1921x1082"
];


/* images is an array with image metadata */
preload(images);


/**
 * 
 * @param {number} brightness 
 */
var set_brightness = function (brightness) {

    if (brightness < 100) {
        $('#randomQuote').css({
            'background-color': 'rgba(0,0,0,0.4)',
            'filter': 'alpha(opacity=40)'
        });
        $('#content').css({
            'color': 'white',
        });
        $('#source').css({
            'color': 'white'
        });
        $('#getQuote').css({
            'background-color': 'rgba(255,255,255,0.4)',
            'color': 'black'
        });
    } else {
        $('#randomQuote').css({
            'background-color': 'rgba(255,255,255,0.4)',
            'filter': 'alpha(opacity=40)'
        });
        $('#content').css({
            'color': 'black',
        });
        $('#source').css({
            'color': 'black'
        });
        $('#getQuote').css({
            'background-color': 'rgba(0,0,0,0.4)',
            'color': 'white'
        });
    }
}



/**
 * 
 * @param {image} img 
 * @param {function} changeBrightness 
 */
function get_bg_brightness(img, changeBrightness) {

    var colorSum = 0;

    // create canvas
    var canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(this, 0, 0);

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

    var brightness = Math.floor(colorSum / (this.width * this.height));

    changeBrightness(brightness);

}


function preload(images, index) {

    index = index || 0;

    if (images && images.length > index) {

        var img = new Image();
        img.src = images[index];

        img.onload = function () {

            preloaded_images.push(img);
            $('#main').css("background-image", "url(" + preloaded_images[index].src + ")");
            

            //get_bg_brightness(img, set_brightness);
            setTimeout(function () {

                preload(images, index + 1);

            }, 10000);
        }
    } else {

        index = 0;
        preloaded_images = [];
        preload(images, index);
    }
}


/**
 * @author Victor Popescu {@link https://github.com/VicPopescu}
 * @description Component used to fetch a random quote from an API provided by {@link https://quotesondesign.com/api-v4-0/ QuotesOnDesign}
 */
var RandomQuoteComponent = function () {

    //selectors
    var root = $('main'),
        quote_container = $('#randomQuote'),
        quote_title = $('#title'),
        quote_content = $('#quote'),
        quote_source = $('#source');

    var random_quote = Api.get_quote();
    //var random_bgImg = Api.get_bg();

    random_quote.done(function (data) {
        display_quote(data[0]);
    });

    /**
     * @private
     * @memberof RandomQuoteComponent
     * @description Use quote retrieved from API and display it on page
     * @param {object} data Object retrieved from quote API
     */
    var display_quote = function (data) {

        var quote = data,
            id = quote.id,
            title = quote.title,
            content = quote.content,
            source = quote.link;


        quote_container.data("quote-id", id);
        quote_content.html(content);
        quote_source.text(title).prop('href', source);
    };
};


/**
 * @description API providers
 */
var Api = (function () {


    /**
     * @description Get a random quote from {@link http://quotesondesign.com/}
     */
    var get_quote = function () {

        return $.ajax({
            url: "http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1&_jsonp=?",
            dataType: 'jsonp', //using jsonp to allow CORS (Cross-origin resource sharing)
            success: function (data) {
                //display_quote(data[0]);
            },
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


$('#getQuote').on("click.getNewQuote", RandomQuoteComponent);
$('#getQuote').trigger('click.getNewQuote');
