$(document).ready(function () {
    //load appropriate map and also prepopulate from and to fields
    var param = _getParameters();
    switch (param.type) {
        case "search":
            $.ajax({
                url: "/navigate/searchmap",
                data: {
                    search: param.search
                },
                success: function (data) {
                    console.log(param.search);
                    $("#map-wrapper").html(data);
                    return $("#map-directions-end").val(param.search);
                }
            });
            break;
        case "directions":
            $.ajax({
                url: "/navigate/navmap",
                data: {
                    from: param.from,
                    to: param.to
                },
                success: function (data) {
                    $("#map-directions-start").val(param.from);
                    $("#map-directions-end").val(param.to);
                    return $("#map-wrapper").html(data);
                }
            });
    }

    //preload some feed items
    $.getJSON('/report/getall', function (data) {
        $.each(data, function (key, val) {
            var time = _processDate(new Date(val.time));
            var type = val.type;
            var comment = val.comment;
            _createFeedItem(time,type,comment);
        });
    });


/**
 * retrieve the get parameters and their values in a querystring
 * @returns urlParams   url parameters in object format
 * @private
 */
function _getParameters() {
    var decode, match, pl, query, search, urlParams;
    pl = /\+/g;
    search = /([^&=]+)=?([^&]*)/g;
    decode = function (s) {
        return decodeURIComponent(s.replace(pl, " "));
    };
    query = window.location.search.substring(1);
    urlParams = {};
    while ((match = search.exec(query))) {
        urlParams[decode(match[1])] = decode(match[2]);
    }
    return urlParams;
};

/**
 * process a js Date object
 * @param date
 * @private
 */
function _processDate(date) {
    var longdate = date.toDateString();
    var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    return longdate + " @ " + time;
}

var isWindowSize = ($(window).width() >= 768);


    //connect to socket.io
    try {
    var socket = io.connect('/');
    socket.on('livereport', function (data) {
        console.log(data);
        data=data.report; //@todo for some reason there is a nested report
        _createFeedItem(_processDate(data.time),data.type,data.comment);
    });
    } catch(err) {

    }

    /**
     * dragging mobile sidebar
     */
    $("#feed-btn,#dir-btn").mousedown(function(e){
        if($(window).width() < 768) {
            $(document).mousemove(function(e){

                if (e.which!=0 &&
                    $("#map-content").hasClass("normal") &&
                    e.pageY < $(window).height() &&
                    e.pageY > 0 &&
                    e.pageX < $(window).width() &&
                    e.pageX > 0
                    ) {
                    $("#map-content").height(e.pageY);
                }
                else {
                    $("#map-content").removeClass("normal");


                    changeMobileSidebar(true);
                    $(document).unbind("mousemove");
                    return;
                }

           });
        }
    });


    /**
     * switch to the feed tab on click
     */
    $("#feed-btn").click(function() {
        $("#directions").fadeOut();
        $("#feed").fadeIn();

        $("#sidebar .btn").removeClass("on");
        $(this).addClass("on");
        changeMobileSidebar($("#map-content").hasClass("normal"));
    });

    /**
     *
     */
    $("#dir-btn").click(function() {
        $("#feed").fadeOut();
        $("#directions").fadeIn();

        $("#sidebar .btn").removeClass("on");
        $(this).addClass("on");
        changeMobileSidebar($("#map-content").hasClass("normal"));
    });

    /**
     * toggle the open/closed state of the sidebar
     */
    $("#shrink-arrow").click(function() {
        /*$(this).innerHTML='&#59237;';*/
        var type=$(this).data('type');
        if(type=='close') {
           _closeWindowSidebar();
        } else if (type=='open') {
            _openWindowSidebar();
        }
    });

    /**
     * show the feed tab in the sidebar on click
     */
    $("#feed-btn").click(function() {
        $("#directions").hide();
        $("#feed").fadeIn();
    });

    /**
     * change scrollbar location on window resize
     * switch to the mobile scrollbar formatting if necessary
     */
    $(window).resize(function() {

        if ($(window).width() < 768 && isWindowSize) {
            isWindowSize = false;
            var barType = $("#shrink-arrow").data('type');
            if (barType=="close"){
                _openMobileSidebar(0);
                $("#map-content,.navbar").click(function() {
                    _closeMobileSidebar();
                });
            }
            else {
                _closeMobileSidebar();
            }
        } else if ($(window).width() >= 768 && !isWindowSize) {
            isWindowSize = true;
            var mobileBarClosed = $("#map-content").hasClass("normal");
            if (mobileBarClosed) {
                _closeWindowSidebar();
                _closeMobileSidebar();
            }

            else {
                _openWindowSidebar();
                $("#map-content").css({'height':'', "background-color": "transparent"}).removeClass("collapsed").addClass("normal");
                $(".navbar").css("background-color", "");
            }
        }
        setTimeout(function(){
            google.maps.event.trigger(map, 'resize');
        },500);

    });

});

/**
 * create new feed item
 * @param time
 * @param type
 * @param comment
 */
function _createFeedItem(time,type,comment) {
    var html=$('<div class="feed-item feed-item-hidden"><hr>' + '<div class="feed-type">' + type + '</div><div class="feed-comment">' + comment + '</div><div class="feed-time">—' + time + '</div></div>');
    $("#live-feed").prepend(html);
    html.removeClass('feed-item-hidden',300);
}

/**
 * switch to the mobile sidebar
 * @param bool normal       whether in normal state
 */
function changeMobileSidebar(normal) {
    if(normal && $(window).width() < 768) {
        _openMobileSidebar(500);
        //click anywhere to exit list
        // TODO: assign in initialization, have check state
        $("#map-content,.navbar").click(function() {
            _closeMobileSidebar();
        });
    }
}

/**
 * close the mobile sidebar
 */
function _closeMobileSidebar() {
    time=500;
    $("#sidebar .btn").removeClass("on");
    $("#map-content").css({"background-color": "transparent"}).removeClass("collapsed").addClass("normal");
    //$("#map-content").css({'height':'', "background-color": "transparent"}).removeClass("collapsed").addClass("normal");
    $("#map-content").animate({
        height: '100%'
    }, time, function(){});
    $(".navbar").css("background-color", "");
    setTimeout(function(){
        google.maps.event.trigger(map, 'resize');
    },500);
}

/**
 * open the mobile sidebar
 * @param int t     animation time of height change
 */
function _openMobileSidebar(t) {
    $("#map-content").css({'min-height':'60px', "background-color": "rgba(0,0,0,0.4)"}).removeClass("normal").addClass("collapsed");
    $("#map-content").animate({
        height: '20%'
    }, t, function(){});
    $(".navbar").css("background-color", "#223044");
}

/**
 * close the main desktop sidebar
 */
function _closeWindowSidebar() {
    $("#shrink-arrow").data('type', 'open').html('&#59237;');
    $("#map-content").css('width','100%');
    setTimeout(function(){
        google.maps.event.trigger(map, 'resize');
    },500);
}

/**
 * open the main desktop sidebar
 */
function _openWindowSidebar() {
    $("#shrink-arrow").data('type', 'close').html('&#59238;');
    $("#map-content").css('width','');
}

/**
 * get directions by request
 * @param start     start location
 * @param end       end location
 */

function getDirections(start, end) {
    $.getJSON('/navigate/nav?start=344234568&end=2345009892', function(data) {
        var coors = [];
        for (var i=0; i<data.path.length; i++) {
            coors.push(new google.maps.LatLng(data.path[i].lat, data.path[i].lon));
        }
        var path = new google.maps.Polyline({
            path: coors,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
        path.setMap(map);
    });
}

/**
 * set a timeout on direction retrieval
 */
$(function(){
    setTimeout(function(){
        getDirections();
    },2000);
});
