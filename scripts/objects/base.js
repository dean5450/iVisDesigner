// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// scripts/objects/base.js
// Base objects.

(function() {

// Plain Object.
var Plain = function(obj) {
    this.obj = obj;
    this.type = "plain";
};
var plain_get = function() { return this.obj; };
Plain.prototype = new IV.objects.BaseObject({
    can: function(cap) {
        if(cap == "get-point") return true;
        if(cap == "get-number") return true;
        if(cap == "get-style") return true;
    },
    get: plain_get,
    clone: function() {
        return new Plain(IV.deepClone(this.obj));
    }
});

IV.objects.Plain = Plain;
IV.objects.Number = Plain;
IV.objects.Style = Plain;
IV.objects.Point = Plain;

// Composite Object.
var Composite = function(obj, wrap) {
    // Copy all fields.
    var fields = { };
    for(var i in obj) {
        if(i[0] != "_") {
            fields[i] = obj[i];
            if(wrap) { fields[i] = new IV.objects.Plain(fields[i]); }
        }
    }
    this.fields = fields;
    this.type = "Composite";
};
Composite.prototype = new IV.objects.BaseObject({
    get: function(context) {
        var obj = { };
        for(var i in this.fields) {
            obj[i] = this.fields[i].get(context);
        }
        return obj;
    },
    clone: function() {
        var obj = { };
        for(var i in this.fields) {
            obj[i] = this.fields[i].clone();
        }
        return new Composite(obj);
    }
});
IV.objects.Composite = Composite;

// Composite Color and Alpha.
var CompositeColorAlpha = function(color, alpha) {
    this.color = color;
    this.alpha = alpha;
    this.type = "CompositeColorAlpha";
};
CompositeColorAlpha.prototype = new IV.objects.BaseObject({
    get: function(context) {
        var c = this.color.get(context);
        c.a = this.alpha.get(context);
        return new IV.Color(c.r, c.g, c.b, c.a);
    },
    clone: function() {
        return new CompositeColorAlpha(this.color.clone(), this.alpha.clone());
    }
});
IV.objects.CompositeColorAlpha = CompositeColorAlpha;

// Point Offset.
var PointOffset = function(point, offset) {
    this.offset = offset;
    this.point = point;
    this.path = point.path;
    this.type = "PointOffset";
};
PointOffset.prototype = new IV.objects.BaseObject({
    get: function(context) {
        var pt = this.point.getPoint(context);
        return pt.add(this.offset);
    },
    getPath: function() {
        return this.point.getPath();
    },
    getGuidePath: function() {
        return this.point.getGuidePath();
    },
    can: function(cap) {
        if(cap == "get-point") return true;
        return false;
    },
    clone: function() {
        return new PointOffset(this.point, this.offset);
    }
});
IV.objects.PointOffset = PointOffset;

// Linear Mapping.
var NumberLinear = function(path, min, max) {
    this.path = path;
    this.min = min;
    this.max = max;
    this.type = "NumberLinear";
};
NumberLinear.prototype = new IV.objects.BaseObject({
    get: function(context) {
        var value = context.get(this.path);
        var s = context.getSchema(this.path);
        if(s.max !== undefined && s.min !== undefined)
            value = (value - s.min) / (s.max - s.min);
        return this.min + value * (this.max - this.min);
    },
    clone: function() {
        return new NumberLinear(this.path, this.min, this.max);
    }
});
IV.objects.NumberLinear = NumberLinear;

// Color Linear Mapping.
var ColorLinear = function(path, color1, color2) {
    this.path = path;
    this.color1 = color1;
    this.color2 = color2;

    this.stops = [ 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1 ].map(function(x) {
        return color1.interpLab(color2, x);
    });

    this.type = "ColorLinear";
};
ColorLinear.prototype = new IV.objects.BaseObject({
    get: function(context) {
        var value = context.get(this.path);
        var s = context.getSchema(this.path);
        if(s.max !== undefined && s.min !== undefined)
            value = (value - s.min) / (s.max - s.min);
        var tp = this.stops.length - 1;
        var idx1 = Math.floor(value * tp);
        if(idx1 < 0) idx1 = 0;
        if(idx1 >= tp) idx1 = tp - 1;
        var idx2 = idx1 + 1;
        var t = value * tp - idx1;
        return this.stops[idx1].interp(this.stops[idx2], t);
    },
    clone: function() {
        return new ColorLinear(this.path, this.color1, this.color2);
    }
});
IV.objects.ColorLinear = ColorLinear;

var ReferenceWrapper = function(ref_path, object) {
    this.obj = object;
    this.reference_path = ref_path;
};
ReferenceWrapper.prototype = new IV.objects.BaseObject({
    get: function(context) {
        var ref_context = context.referenceContext(this.reference_path);
        return this.obj.get(ref_context);
    },
    clone: function() {
        return new ReferenceWrapper(this.reference_path, this.obj);
    }
});
IV.objects.ReferenceWrapper = ReferenceWrapper;

})();
