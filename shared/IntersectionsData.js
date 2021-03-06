(function() {
    var IntersectionsData = function(data) {
        var _this = this;
        this.data = data;
        this.listeners = [];
        var idmap = {};
        for (var i=0; i<this.data.length; i++) {
            idmap[this.data[i]['id']] = i;
            if (!this.data[i].hasOwnProperty('reports')) {
                this.data[i]['reports'] = [];
            }
        }

        this.get = function(intersection_id) {
            if (this.data.hasOwnProperty(idmap[intersection_id])) {
                return this.data[idmap[intersection_id]];
            } else {
                return null;
            }
        };

        this.getLat = function(intersection_id) {
            return this.get(intersection_id)['loc']['coordinates'][1];
        };

        this.getLon = function(intersection_id) {
            return this.get(intersection_id)['loc']['coordinates'][0];
        };

        this.each = function(callback) {
            for (var i=0; i<this.data.length; i++) {
                callback(this.data[i]);
            }
        };

        this.update = function(intersection_id, update) {
            var intersection = _this.get(intersection_id);
            if (intersection != null && update != null) {
                for (var i=0; i<update['reports'].length; i++) {
                    intersection['reports'].push(update['reports'][i]);
                }
                _this._dispatchUpdate(intersection_id);
            }
        };

        this.addUpdateListener = function(f) {
            this.listeners.push(f);
        };

        this._dispatchUpdate = function(intersection_id) {
            for (var i=0; i<this.listeners.length; i++) {
                this.listeners[i](intersection_id);
            }
        };

        this.size = function() {
             return this.data.length;
        };
    };

    if (typeof exports !== 'undefined') {
        module.exports = IntersectionsData;
    } else {
        window.IntersectionsData = IntersectionsData;
    }
})();
