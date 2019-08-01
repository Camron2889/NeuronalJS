//namespace
this.neuronal = this.neuronal || {};

//class
(function() {
    "use strict";
    
    //constructor
    const LineChart = function(container = document.body, numPoints = 64, defaultValue = 0) {
        this.container = container;
        this.numPoints = numPoints;
        this.defaultValue = defaultValue;
        
        this.settings = {
            linePadding: [20, 30, 20, 60],
            labelLineLength: 20,
            labelXPosition: 35,
            labelFontSize: 16,
            midlineEnabled: false,
            midlineValue: 0,
            range: { min: -100, max: 20 }
        };
        
        this._points = [];
        
        const sgs = this.settings;
        this._rangeSize = sgs.range.max - sgs.range.min;
        

        this.appendElements();

        this.lastValLine = { _enabled: false, _element: this._elements.lines.lastVal };
        Object.defineProperty(this.lastValLine, 'enabled', {
            get: function() {
                return this._enabled;
            },
            set: function(bool) {
                this._enabled = !!bool;
                if (this._enabled) {
                    this._element.style.display = "initial";
                } else {
                    this._element.style.display = "none";
                }
            }
        });
        this.lastValLine.enabled = false;

        const labels = this._elements.labels;
        labels.mid.innerHTML = sgs.midlineValue;
        labels.min.innerHTML = sgs.range.min;
        labels.max.innerHTML = sgs.range.max;

        this.updateSize();

        for (let i = 0; i < this.numPoints; i++) {
        const point = this._elements.main.createSVGPoint();

        point.x = sgs.linePadding[3] + this.deltaX * i;
        point.y = this._yCoordinateTransform(defaultValue);

        this._elements.polyLine.points.appendItem(point);
        }

        this.drawPoints();
    };
    
    const proto = LineChart.prototype;
    
    proto.appendElements = function() {

        this._elements = {};
        const el = this._elements;

        el.main = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        el.main.setAttribute("style", "display: block; width: 100%; height: 100%; background-color: #FFF;");
        this.container.appendChild(el.main);

        el.polyLine = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        el.polyLine.setAttribute("style", "fill: none; stroke: #0079fc; stroke-width: 3;");
        el.main.appendChild(el.polyLine);

        el.lines = {
            mid: undefined,
            min: undefined,
            max: undefined,
            begin: undefined,
            end: undefined,
            mouse: undefined,
            lastVal: undefined
        };

        el.labels = {
            mid: undefined,
            min: undefined,
            max: undefined
        };

        const lineStyle = "fill: none; stroke: #777; stroke-width: 1.5; stroke-dasharray: 2,2;";
        const labelStyle = `dominant-baseline: central; text-anchor: end; font-size: ${this.settings.labelFontSize}px;`;

        const lineKeys = Object.keys(el.lines);
        for (let i = 0; i < lineKeys.length; i++) {
            el.lines[lineKeys[i]] = document.createElementNS("http://www.w3.org/2000/svg", "line");
            el.main.appendChild(el.lines[lineKeys[i]]);
            el.lines[lineKeys[i]].setAttribute("style", lineStyle);
        }

        const labelKeys = Object.keys(el.labels);
        for (let i = 0; i < labelKeys.length; i++) {
            el.labels[labelKeys[i]] = document.createElementNS("http://www.w3.org/2000/svg", "text");
            el.main.appendChild(el.labels[labelKeys[i]]);
            el.labels[labelKeys[i]].setAttribute("style", labelStyle);
        }

        el.lines.begin.style.strokeDasharray = "none";
        el.lines.begin.style.stroke = "black";
        el.lines.end.style.strokeDasharray = "none";
        el.lines.end.style.stroke = "black";

        el.lines.mouse.style.display = "none";

        if (!this.settings.midlineEnabled) {
            el.labels.mid.style.display = "none";
            el.lines.mid.style.display = "none";
        }
    };
    
    proto.updateSize = function() {
        //update size values
        const main = this._elements.main;
        const sgs = this.settings;
        
        this.width = main.clientWidth || main.parentNode.clientWidth;
        this.height = main.clientHeight || main.parentNode.clientHeight;
        const innerWidth = this.width - (sgs.linePadding[1] + sgs.linePadding[3]);
        const innerHeight = this.height - (sgs.linePadding[0] + sgs.linePadding[2]);
        const deltaX = innerWidth / (this.numPoints - 1);
        const midY = this._yCoordinateTransform(sgs.midlineValue);

        for	(let i = 0; i < this._points.length; i++) {
            const posX = sgs.linePadding[3] + deltaX * i;
            const point = this._elements.polyLine.points.getItem(i);
            point.x = posX;
        }

        //draw lines
        const lines = this._elements.lines;

        lines.mid.setAttribute("x1", sgs.linePadding[3] - sgs.labelLineLength);
        lines.mid.setAttribute("y1", midY);
        lines.mid.setAttribute("x2", this.width - sgs.linePadding[1]);
        lines.mid.setAttribute("y2", midY);

        lines.min.setAttribute("x1", sgs.linePadding[3] - sgs.labelLineLength);
        lines.min.setAttribute("y1", sgs.linePadding[0]);
        lines.min.setAttribute("x2", this.width - sgs.linePadding[1]);
        lines.min.setAttribute("y2", sgs.linePadding[0]);

        lines.max.setAttribute("x1", sgs.linePadding[3] - sgs.labelLineLength);
        lines.max.setAttribute("y1", this.height - sgs.linePadding[2]);
        lines.max.setAttribute("x2", this.width - sgs.linePadding[1]);
        lines.max.setAttribute("y2", this.height - sgs.linePadding[2]);

        lines.begin.setAttribute("x1", sgs.linePadding[3]);
        lines.begin.setAttribute("y1", sgs.linePadding[0]);
        lines.begin.setAttribute("x2", sgs.linePadding[3]);
        lines.begin.setAttribute("y2", this.height - sgs.linePadding[2]);

        lines.end.setAttribute("x1", this.width - sgs.linePadding[1]);
        lines.end.setAttribute("y1", sgs.linePadding[0]);
        lines.end.setAttribute("x2", this.width - sgs.linePadding[1]);
        lines.end.setAttribute("y2", this.height - sgs.linePadding[2]);

        lines.mouse.setAttribute("y1", sgs.linePadding[0]);
        lines.mouse.setAttribute("y2", this.height - sgs.linePadding[2]);

        lines.lastVal.setAttribute("x1", sgs.linePadding[3]);
        lines.lastVal.setAttribute("x2", this.width - sgs.linePadding[1]);

        //draw labels
        const labels = this._elements.labels;

        labels.mid.setAttribute("x", sgs.labelXPosition);
        labels.mid.setAttribute("y", midY);
        labels.max.setAttribute("x", sgs.labelXPosition);
        labels.max.setAttribute("y", sgs.linePadding[0]);
        labels.min.setAttribute("x", sgs.labelXPosition);
        labels.min.setAttribute("y", this.height - sgs.linePadding[2]);
    };
    
    proto.drawPoints = function() {
        const pts = this._points;
        for	(let i = 0; i < this.numPoints; i++) {
            const point = this._elements.polyLine.points.getItem(i);
            if (i < pts.length) {
                point.y = this._yCoordinateTransform(pts[i]);
            } else {
                point.y = this._yCoordinateTransform(pts[pts.length - 1]) || this.defaultValue;
            }
        }
        if (this.lastValLine.enabled) {
            const posY = this._yCoordinateTransform(pts[pts.length - 1]) || this.defaultValue;
            this._elements.lines.lastVal.setAttribute("y1", posY);
            this._elements.lines.lastVal.setAttribute("y2", posY);
        }
    };
    
    proto.push = function(val) {
        this._points.push(val);
        if (this._points.length > this.numPoints) {
            this._points.shift();
        }
    };
    
    proto.bindMouse = function(callback) {
        const el = this._elements;
        const sgs = this.settings;
        const mouseLine = el.lines.mouse;

        let currentIndex = 0;
        let currentXPos = 0;

        const getMouseCoords = (event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            return { x: x, y: y };
        }

        this.mouseMoveEvent = el.main.addEventListener("mousemove", (event) => {
            
            const coords = getMouseCoords(event);
            const ratio = (coords.x - sgs.linePadding[3]) / this.innerWidth;
            const xIndex = Math.floor(this.numPoints * ratio);
            const xPos = sgs.linePadding[3] + xIndex * this.deltaX;

            currentIndex = xIndex;
            currentXPos = xPos;

            if (xPos >= sgs.linePadding[3] && xPos <= this.width - sgs.linePadding[1]) {
                mouseLine.style.display = "initial";
                el.main.style.cursor = "crosshair";
                mouseLine.setAttribute("x1", xPos);
                mouseLine.setAttribute("x2", xPos);
            } else {
                mouseLine.style.display = "none";
                el.main.style.cursor = "initial";
            }
        });

        this.mouseLeaveEvent = el.main.addEventListener("mouseleave", (event) => {
            mouseLine.style.display = "none";
            el.main.style.cursor = "initial";
        });

        this.clickEvent = this.elements.main.addEventListener("click", (event) => {
            if (currentXPos >= sgs.linePadding[3] && currentXPos <= this.width - sgs.linePadding[1]) {
                callback(currentIndex);
            }
        });
    };
    
    proto.reset = function() {
        this.points = [];
        this.drawPoints();
    };
  
    proto._yCoordinateTransform = function(x) {
        const innerHeight = this.height - (this.settings.linePadding[0] + this.settings.linePadding[2]);
        return this.settings.linePadding[0] + (this._rangeSize + this.settings.range.min - x) / this._rangeSize * innerHeight;
    };
    
    neuronal.LineChart = LineChart;
})();