// Generated by CoffeeScript 1.6.3
(function() {
  var _getParameters;

  $(document).ready(function() {
    var param;
    param = _getParameters();
    switch (param.type) {
      case "search":
        $.ajax({
          url: "/navigate/searchmap",
          data: {
            search: param.search
          },
          success: function(data) {
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
          success: function(data) {
            $("#map-directions-start").val(param.from);
            $("#map-directions-end").val(param.to);
            return $("#map-wrapper").html(data);
          }
        });
    }
    return $.getJSON('/report/getall', function(data) {
      return $.each(data, function(key, val) {
        var comment, time, type;
        time = val.time;
        type = val.type;
        comment = val.comment;
        return $("#live-feed").prepend('<div class="feed-item"><hr>' + '<div class="feed-type">' + type + '</div><div class="feed-comment">' + comment + '</div><div class="feed-time">—' + time + '</div></div>');
      });
    });
  });

  /*
    Extracts GET parameters from url
  */


  _getParameters = function() {
    var decode, match, pl, query, search, urlParams;
    pl = /\+/g;
    search = /([^&=]+)=?([^&]*)/g;
    decode = function(s) {
      return decodeURIComponent(s.replace(pl, " "));
    };
    query = window.location.search.substring(1);
    urlParams = {};
    while ((match = search.exec(query))) {
      urlParams[decode(match[1])] = decode(match[2]);
    }
    return urlParams;
  };

}).call(this);

/*
//@ sourceMappingURL=map.map
*/
