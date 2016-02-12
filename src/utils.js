export var getNestedValue = function (rootVal, path) {
    var pathKeys = path.split('.');
    var currentPathVal = rootVal;

    for (var j = 0; j < pathKeys.length; j++) {
        var key = pathKeys[j];

        if (currentPathVal[key] != undefined) {
            currentPathVal = currentPathVal[key];
        } else {
            currentPathVal = '';
        };
    };

    return currentPathVal;
};

// Takes an object and a dot-notated path, created the nested tree for that path
// and setting a value
export var setNestedValue = function (object, path, val) {
    var pathKeys = path.split('.');
    var currentPathVal = object;

    for (var j = 0; j < pathKeys.length; j++) {
        var key = pathKeys[j];

        if (j < pathKeys.length - 1) {
            currentPathVal[key] = {};
            currentPathVal = currentPathVal[key];
        } else {
            currentPathVal[key] = val;
        }
    };

    currentPathVal[key] = val;

    return object;
}

// Get a nested firebase ref for a given dot-notated path
export var getNestedRef = function (ref, path) {
    var pathKeys = path.split('.');
    var currentRef = ref;

    for (var j = 0; j < pathKeys.length; j++) {
        var key = pathKeys[j];
        currentRef = currentRef.child(key);
    };

    return currentRef;
}
