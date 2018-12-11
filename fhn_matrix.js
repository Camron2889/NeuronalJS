//namespace
this.neuronal = this.neuronal || {};

//class
(function() {
    "use strict";
    
    //private data
    const _defaults = {
        gNa: 0.9,
        gK: 1.1,
        beta: 0.6,
        gamma: 1,
        c: 0.025,

        deltaT: 2 / 256,

        uDefault: -0.53,
        vDefault: -1.13
    };
    
    //constructor
    const FhnMatrix = function(height = 1, width = 1) {
        this.size = { x: width, y: height };
        this.restoreDefaults();
        
        this.solutions = [];
        for (let row = 0; row < height; row++) {
            this.solutions[row] = [];
            for (let column = 0; column < width; column++) {
                this.solutions[row][column] = { u: this.uDefault, v: this.vDefault, f: null };
            }
        }
    };
    
    const proto = FhnMatrix.prototype;
    
    //public methods
    proto.restoreDefaults = function() {
        const keys = Object.keys(_defaults);
        for (let i = 0; i < keys.length; i++) {
            this[keys[i]] = this.defaults[keys[i]];
        }
    };
    
    proto.reset = function() {
        this.restoreDefaults();

        for (let row = 0; row < this.size.y; row++) {
            for (let column = 0; column < this.size.x; column++) {
                const element = this.solutions[row][column];
                element.u = this.uDefault;
                element.v = this.vDefault;
                element.f = null;
            }
        }
    };
    
    proto.calculate = function() {
        for (let row = 0; row < this.size.y; row++) {
            for (let column = 0; column < this.size.x; column++) {
                const element = this.solutions[row][column];

                element.f = element.v * (1 - (Math.pow(element.v, 2) / 3));

                const newU = (element.v + this.beta - this.gamma * element.u) * this.deltaT + element.u;
                const newV = 1 / this.c * (this.gNa * element.f - this.gK * element.u) * this.deltaT + element.v;

                element.u = newU;
                element.v = newV;
            }
        }
    };
    
    proto.dissipate = function() {
        const deltaX = 0.025 / this.deltaT;
        const dx = deltaX / 10;
        const vForce = dx / (deltaX * deltaX);
        
        for (let row = 0; row < this.size.y; row++) {
            for (let column = 0; column < this.size.x; column++) {
                let vSum = 0;
                let n = 0;
                
                if (this.numRows > 1) {
                    const vDown = this.solutions[row + 1 < this.size.y ? row + 1 : row][column].v;
                    const vUp = this.solutions[row - 1 > -1 ? row - 1 : row][column].v;
                    vSum += vDown + vUp;
                    n += 2;
                }
                if (this.numColumns > 1) {
                    const vRight = this.solutions[row][column + 1 < this.size.x ? column + 1 : column].v;
                    const vLeft = this.solutions[row][column - 1 > -1 ? column - 1 : column].v;
                    vSum += vRight + vLeft;
                    n += 2;
                }
                
                const vDifference = vSum - (this.solutions[row][column].v * n);
                const vEffect = vDifference * vForce;
                
                this.solutions[row][column].v += vEffect;
            }
        }
    };
    
    neuronal.FhnMatrix = FhnMatrix;
})();