//requires: linkedlist.js

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
    const FhnGraph = function() {
        this.restoreDefaults();
        
        this.vertexList = new neuronal.LinkedList();
        this.edgeList = new neuronal.LinkedList();
    };
    
    const proto = FhnGraph.prototype;
    
    //public methods
    proto.restoreDefaults = function() {
        const keys = Object.keys(_defaults);
        for (let i = 0; i < keys.length; i++) {
            this[keys[i]] = _defaults[keys[i]];
        }
    };
    
    proto.newVertex = function(x = 0, y = 0) {
        const vertex = {
            position: {x, y},
            neighbors: [],
            u: this.uDefault,
            v: this.vDefault,
            f: null,
            enabled: true
        };
        this.vertexList.push(vertex);
        return vertex;
    };
    
    proto.newEdge = function(vertex0, vertex1) {
        const edge = [vertex0, vertex1];
        vertex0.neighbors.push(vertex1);
        vertex1.neighbors.push(vertex0);
        this.edgeList.push(edge);
        return edge;
    };
    
    proto.reset = function() {
        this.restoreDefaults();
        
        let vertex = this.vertices.begin();
        while(vertex !== null) {
            vertex.u = this.uDefault;
            vertex.v = this.vDefault;
            vertex.f = null;
            vertex = this.vertices.next();
        }
    };
    
    proto.calculate = function() {
        let vertex = this.vertices.begin();
        while(vertex !== null) {
            vertex.f = vertex.v * (1 - (Math.pow(vertex.v, 2) / 3));
            const newU = (vertex.v + this.beta - this.gamma * vertex.u) * this.deltaT + vertex.u;
            const newV = 1 / this.c * (this.gNa * vertex.f - this.gK * vertex.u) * this.deltaT + vertex.v;
            vertex.u = newU;
            vertex.v = newV;
            
            vertex = this.vertices.next();
        }
    };
    
    proto.dissipate = function() {
        const deltaX = 0.025 / this.deltaT;
        const dx = deltaX / 10;
        const vForce = dx / (deltaX * deltaX);
        
        let vertex = this.vertices.begin();
        while(vertex !== null) {
            let vSum = 0;
            let n = 0;
            for (let i = 0; i < vertex.neightbors.length; i++) {
                const neighbor = vertex.neightbors[i];
                if (neighbor.enabled) {
                    ++n;
                    vSum += neightbor.v
                }
            }
            
            const vDifference = vSum - (vertex.v * n);
            const vEffect = vDifference * vForce;
            vertex.v += vEffect;
            
            vertex = this.vertices.next();
        }
    };
    
    proto.createCircle = function(centerX, centerY, radius, sides, angleOffset = 0) {        
        let angle = angleOffset;
        let x = Math.cos(angle) * radius + centerX;
        let y = Math.sin(angle) * radius + centerY;
        
        const firstVertex = this.newVertex(x, y);
        let prevVertex = firstVertex;
        
        const apexAngle = Math.PI * 2 / sides;
        for (let i = 0; i < sides - 1; i++) {
            angle += apexAngle;
            x = Math.cos(angle) * radius + centerX;
            y = Math.sin(angle) * radius + centerY;
            
            const newVertex = this.newVertex(x, y);
            this.newEdge(prevVertex, newVertex);
            prevVertex = newVertex;
        }
        
        this.newEdge(prevVertex, firstVertex);
        
        return firstVertex;
    };
    
    neuronal.FhnGraph = FhnGraph;
})();