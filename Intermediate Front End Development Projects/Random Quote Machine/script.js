/**
 * @module RandomQuoteComponent
 * @author Victor Popescu {@link https://github.com/VicPopescu}
 * @description Component used to fetch a random quote from an API provided by {@link https://quotesondesign.com/api-v4-0/ QuotesOnDesign}
 */
function RandomQuoteComponent() {

    //vars
    var root = $('main'),
        quote_container = $('#randomQuote'),
        quote_title = $('#title'),
        quote_content = $('#quote'),
        quote_source = $('#source');

    var api_bg_image_link = "https://source.unsplash.com/category/nature/1920x1080#" + new Date().getTime();
    var api_quote_link = "http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1&_jsonp=?";


    get_bg_brightness(api_bg_image_link, function (brightness) {

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
    });

    //API: get random quote
    var quote_API = $.ajax({

        url: api_quote_link,
        dataType: 'jsonp', //using jsonp to allow CORS (Cross-origin resource sharing)
        success: function (data) {

            //display quote on page
            display_quote(data[0]);
        },
        error: function () {
            alert("Something went wrong with the server...");
        }
    });


    function get_bg_brightness(imageSrc, callback) {

        var img = document.createElement("img");
        img.crossOrigin = "Anonymous";
        img.src = imageSrc;
        //img.style.display = "none";
        //document.body.appendChild(img);
        var colorSum = 0;

        img.onload = function () {

        $('body').css('background-image', "url(" + img.src + ")");
            


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
            callback(brightness);
        }
    }

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
        //quote_container.fadeOut(0, function () {
        //$(this).data("quote-id", id).fadeIn(1000);
        quote_content.html(content);
        quote_source.text(title).prop('href', source);
        //});

    };
};


$('#getQuote').on("click.getNewQuote", RandomQuoteComponent);