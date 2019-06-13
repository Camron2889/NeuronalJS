//requires: linkedlist.js, vector3.js

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

        uDefault: -0.53,
        vDefault: -1.13 //should be resting voltage
    };
    
    //shortcuts
    const Vector3 = neuronal.Vector3;
    
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
    
    proto.newVertex = function(x = 0, y = 0, z = 0) {
        const vertex = {
            neighbors: [],
            u: this.uDefault,
            v: this.vDefault,
            f: null,
            enabled: true
        };
        vertex.position = new Vector3(x, y, z);
        this.vertexList.push(vertex);
        return vertex;
    };
    
    proto.newEdge = function(vertex0, vertex1, weight = 1) {
        const edge = [vertex0, vertex1, weight];
        vertex0.neighbors.push([vertex1, edge]);
        vertex1.neighbors.push([vertex0, edge]);
        this.edgeList.push(edge);
        return edge;
    };
    
    proto.newDirectedEdge = function(vertex0, vertex1, weight = 1) {
        const edge = [vertex0, vertex1, weight];
        vertex1.neighbors.push([vertex0, edge]);
        this.edgeList.push(edge);
        return edge;
    };
    
    proto.reset = function() {
        this.restoreDefaults();
        
        let vertex = this.vertexList.begin();
        while(vertex !== null) {
            vertex.u = this.uDefault;
            vertex.v = this.vDefault;
            vertex.f = null;
            vertex = this.vertexList.next();
        }
    };
    
    proto.calculate = function() {
        let vertex = this.vertexList.begin();
        while(vertex !== null) {
            vertex.f = vertex.v * (1 - (Math.pow(vertex.v, 2) / 3));
            const newU = (vertex.v + this.beta - this.gamma * vertex.u) * this.deltaT + vertex.u;
            const newV = 1 / this.c * (this.gNa * vertex.f - this.gK * vertex.u) * this.deltaT + vertex.v;
            vertex.u = newU;
            vertex.v = newV;
            
            vertex = this.vertexList.next();
        }
    };
    
    proto.dissipate = function() {
        const deltaX = 0.025 / this.deltaT;
        const dx = deltaX / 10;
        const vForce = dx / (deltaX * deltaX);
        
        let vertex = this.vertexList.begin();
        while(vertex !== null) {
            let vSum = 0;
            let n = 0;
            for (let i = 0; i < vertex.neighbors.length; i++) {
                const neighbor = vertex.neighbors[i][0];
                if (neighbor.enabled) {
                    ++n;
                    const edge = vertex.neighbors[i][1];
                    const vDiff = _defaults.vDefault - neighbor.v;
                    
                    vSum += _defaults.vDefault + vDiff * edge[2];
                }
            }
            
            const vDifference = vSum - (vertex.v * n);
            const vEffect = vDifference * vForce;
            vertex.v += vEffect;
            
            vertex = this.vertexList.next();
        }
    };
    
    proto.removeEdge = function(edge) {
        for (let v = 0; v < 2; v++) {
            const vert = edge[v];
            for (let n = 0; n < vert.neighbors.length; n++) {
                console.log(n);
                const neighborEdge = vert.neighbors[n][1];
                if (neighborEdge === edge) {
                    vert.neighbors.splice(n, 1);
                    break;
                }
            }
        }
        let currentEdge = graph.edgeList.begin();
        while (currentEdge !== null) {
            if (currentEdge === edge) {
                graph.edgeList.removeHere();
            }
            
            currentEdge = graph.edgeList.next();
        }
    };
    
    proto.removeVertex = function(vertex) {
        for (let n = 0; n < vertex.neighbors.length; n++) {
            this.removeEdge(vertex.neighbors[n][1]);
            --n;
        }
        
        let currentVertex = graph.vertexList.begin();
        while (currentVertex !== null) {
            if (currentVertex === vertex) {
                graph.vertexList.removeHere();
            }
            
            currentVertex = graph.vertexList.next();
        }
    };
    
    proto.mergeVertices = function(vertex0, vertex1) {
        let currentVertex = graph.vertexList.begin();
        while (currentVertex !== null) {
            //NOT IMPLEMENTED
            
            currentVertex = graph.vertexList.next();
        }
    };
    
    proto.createPolygon = function(centerX, centerY, radius, sides, angleOffset = 0) {        
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
    
    proto.createCircle = function(centerX, centerY, radius, targetDist, angleOffset = 0) {
        const n = -2 * radius * radius;
        const targetAngle = Math.acos((targetDist * targetDist + n) / n);
        const sides = Math.round(Math.PI * 2 / targetAngle);
        return this.createPolygon(centerX, centerY, radius, sides, angleOffset);
    };
    
    proto.createLineBetween = function(vertex0, vertex1, targetDist, directed = false) {
        const mag = vertex1.position.clone().subtract(vertex0.position).getMagnitude();
        let numEdges;
        if (targetDist > mag) {
            numEdges = 1;
        } else {
            numEdges = Math.round(mag / targetDist);
        }
        const edgeLength = mag / numEdges;
        const unitEdge = vertex1.position.clone().subtract(vertex0.position).normalize().scale(edgeLength);
        
        const makeEdge = directed ? this.newDirectedEdge.bind(this) : this.newEdge.bind(this);
        
        let prevVertex = vertex0;
        
        for (let i = 0; i < numEdges - 1; i++) {
            const p = prevVertex.position.clone().add(unitEdge);
            const newVertex = this.newVertex(p.x, p.y, p.z);
            makeEdge(prevVertex, newVertex);
            prevVertex = newVertex;
        }

        makeEdge(prevVertex, vertex1);
    };
    
    proto.createLine = function(x0, y0, x1, y1, targetDist, directed = false) {
        const vert0 = this.newVertex(x0, y0);
        const vert1 = this.newVertex(x1, y1);
        this.createLineBetween(vert0, vert1, targetDist, directed);
        return [vert0, vert1];
    };
    
    neuronal.FhnGraph = FhnGraph;
})();
