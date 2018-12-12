//namespace
this.neuronal = this.neuronal || {};

//class
(function() {
    "use strict";

    //constructor
    const Vector2 = function(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    };
    
    const proto = Vector2.prototype;
    
    proto.set = function(x, y) {
        this.x = x;
        this.y = y;
    }
    
    proto.rotate = function(t) {
        const cosT = Math.cos(t);
        const sinT = Math.sin(t);

        const x1 = this.x * cosT - this.y * sinT;
        const y1 = this.x * sinT + this.y * cosT;
        this.x = x1;
        this.y = y1;

        return this;
    };
    
    proto.clone = function(target) {
        target = target || new Vector2();
        target.x = this.x;
        target.y = this.y;
        
        return target;
    };
    
    proto.add = function(otherV2) {
        this.x += otherV2.x;
        this.y += otherV2.y;
        
        return this;
    };
    
    proto.subtract = function(otherV2) {
        this.x -= otherV2.x;
        this.y -= otherV2.y;
        
        return this;
    };
    
    proto.scale = function(s) {
        this.x *= s;
        this.y *= s;
        
        return this;
    };
    
    proto.getMagnitude = function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    
    neuronal.Vector2 = Vector2;
})();