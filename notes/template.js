//namespace
this.namespaceName = this.namespaceName || {};

//class enclosure
(function() {
    "use strict";
    
    //constructor
    const ClassName = function() {

        //public non-static
        this.methodName = function() { 
          //It's rarely necessary for a method to be non-static.
        };

        this.propertyName = "value";
    };

    const proto = ClassName.prototype;

    //public static
    proto.methodName = function() {
        
    };

    proto.propertyName = "value";

    //private
    const _methodName = function() {

    };

    const _propertyName = "value";

    //attach class to namespace
    namespaceName.ClassName = ClassName;
})();