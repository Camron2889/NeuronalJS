//namespace
this.neuronal = this.neuronal || {};
neuronal._precomp = neuronal._precomp || {};

//class
(function() {
    "use strict";
    
    neuronal._precomp.hueScale = [60/360, 120/360, 180/360, 240/360, 300/360];
    
    //constructor
    const Color = function(r = 0, g = 0, b = 0, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    
    const proto = Color.prototype;
    
    proto.set = function(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a || this.a;
    };
    
    proto.fromHsl = function(h, s, l) {
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(18 * h / 3 % 2 - 1));
        const m = l - c / 2;
        const _hScale = neuronal._precomp.hueScale;
        
        let r, g, b;
        
        if (h < _hScale[2]) {
          if (h < _hScale[0]) {
            r = c, g = x, b = 0;
          } else if (h < _hScale[1]) {
            r = x, g = c, b = 0;
          } else {
            r = 0, g = c, b = x;
          }
        } else {
          if (h < _hScale[3]) {
            r = 0, g = x, b = c;
          } else if (h < _hScale[4]) {
            r = x, g = 0, b = c;
          } else {
            r = c, g = 0, b = x;
          }
        }
        
        this.r = r + m;
        this.g = g + m;
        this.b = b + m;
        
        return this;
    };
    
    proto.getHsl = function() {
        const r = this.r;
        const g = this.g;
        const b = this.b;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const range = max - min;
        
        let h;
        let s;
        const l = (max + min) / 2;
        
        if (range === 0) {
            h = s = 0;
        } else {
            s = range / (1 - Math.abs(2 * l - 1));
            h = 3/18;
            switch (max) {
                case r:
                    h *= ((g - b) / range) % 6;
                    break;
                case g:
                    h *= ((b - r) / range) + 2
                    break;
                case b:
                    h *= ((r - g) / range) + 4;
                    break;
          }
        }
        return {
            h: h,
            s: s,
            l: l
        };
    };
    
    proto.toHex = function() {
        let r = Math.floor(this.r * 255).toString(16);
        let g = Math.floor(this.g * 255).toString(16);
        let b = Math.floor(this.b * 255).toString(16);
        
        if (r.length === 1) {
            r = "0" + r;
        }
        if (g.length === 1) {
            g = "0" + g;
        }
        if (b.length === 1) {
            b = "0" + b;
        }
        
        return "#" + r + g + b;
    };
    
    neuronal.Color = Color;
})();