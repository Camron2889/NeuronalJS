//namespace
this.neuronal = this.neuronal || {};

//class
(function() {
    "use strict";
    
    //private static data
    const _defaults = {
        gNa: 0.9,
        gK: 1.1,
        beta: 0.6,
        gamma: 1,
        c: 0.025,

        deltaT: 2 / 256,

        uDefault: -0.530837665,
        vDefault: -1.130837665, //should be resting voltage 
        fDefault: -0.648801591
    };
    
    //constructor
    const FhnNode = function() {
        this.restoreDefaults();
        this.reset();
    };
    
    const proto = FhnNode.prototype;
    
    //public methods
    proto.restoreDefaults = function() {
        const keys = Object.keys(_defaults);
        for (let i = 0; i < keys.length; i++) {
            this[keys[i]] = _defaults[keys[i]];
        }
    };
    
    proto.reset = function() {
        this.v = this.vDefault;
        this.u = this.uDefault;
        this.f = this.fDefault;
    };
    
    proto.calculate = function() {
        const newU = (this.v + this.beta - this.gamma * this.u) * this.deltaT + this.u;
        const newV = 1 / this.c * (this.gNa * this.f - this.gK * this.u) * this.deltaT + this.v;
        this.u = newU;
        this.v = newV;
        this.f = this.v * (1 - (Math.pow(this.v, 2) / 3));
    };
    
    neuronal.FhnNode = FhnNode;
})();
