//namespace
this.neuronal = this.neuronal || {};

//class
(function() {
    "use strict";
    
    //constructor
    const LinkedList = function() {
        this.head = null;
        
        this.previousNode = null;
        this.currentNode = null;
        
        this.length = 0;
    };
    
    const proto = LinkedList.prototype;
    
    proto.begin = function() {
        if (this.head) {
            this.previousNode = null;
            this.currentNode = this.head;
            return this.head.value;
        }
        return null;
    };
    
    proto.next = function() {
        if (this.currentNode && this.currentNode.next) {
            this.previousNode = this.currentNode;
            this.currentNode = this.currentNode.next;
            return this.currentNode.value;
        }
        return null;
    };
    
    proto.end = function() {
        if (this.begin() !== null) {
            while (this.next()) {}
            return this.currentNode.value;
        }
        return null;
    };
    
    proto.push = function(obj) {
        const node = {
            value: obj,
            next: this.head,
            previous: null
        };
        
        this.head = node;
        ++this.length;
    };
    
    proto.popBack = function() {
        if (this.end() !== null) {
            const node = this.currentNode;
            if (this.previousNode) {
                this.previousNode.next = null;
            }
            --this.length;
            if (this.length === 0) {
                this.head = this.currentNode = this.previousNode = null;
            }
            return node.value;
        }
        return null;
    };
    
    proto.removeHere = function() {
        const current = this.currentNode;
        if (!current) return null;
        
        const next = current.next;
        const previous = this.previousNode;
        if (next) {
            if (previous) { //case: { o -> O -> o }
                previous.next = next;
            } else { //case: { _ -> O -> o }
                this.head = next;
            }
            this.currentNode = next;
            current.next = null;
        } else {
            if (previous) { //case: { o -> O -> _ }
                this.currentNode = previous;
                current.next = null;
                this.previousNode = null;

            } else { //case: { _ -> O -> _ }
                this.head = null;
                this.currentNode = null;
                this.previousNode = null;
            }
        }
        --this.length;
        return current.value;
    };
    
    proto.find = function(value) {
        let currentValue = this.begin();
        if (currentValue === null) return false;
        if (currentValue === value) return true;
        
        while ((currentValue = this.next()) !== null) {
            if (currentValue === value) return true;
        }

        return false;
    };
    
    proto.toArray = function() {
        if (this.begin() === null) return null;
        const arr = [this.currentNode.value];
        while (this.next() !== null) {
            arr.push(this.currentNode.value);
        }
        return arr;
    };
    
    neuronal.LinkedList = LinkedList;
})();