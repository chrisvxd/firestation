export default function getNestedValue (rootVal, path) {
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