var relay = (function() {
    var TIMEOUT_LENGTH = 2000;

    var registrations = {};

    addEventListener("message", function(event) {
        var eventType = event.data.type;
        var data = event.data.data;
        var responseCallbackName = event.data.responseCallbackName;

        if(registrations.hasOwnProperty(eventType)) {

            var callback = registrations[eventType];
            var responseData = callback.call(null, data);

            event.source.postMessage({type: responseCallbackName, data: responseData}, "*");
        }

    }, false);

    return {
        on: function (eventType, callback) {
            if(!registrations.hasOwnProperty(eventType)) {
                registrations[eventType] = callback;
            }
        },

        send: function (wnd, eventType, data, callback) {
            var timestamp = new Date().getTime();
            var successCallbackName = eventType + "_success_" + timestamp;

            var errorTimeout = setTimeout(function() {
                callback.call(null, new Error("Send failed. There was no response."), null);
            }, TIMEOUT_LENGTH);

            this.on(successCallbackName, function(data) {
                clearTimeout(errorTimeout);
                callback.call(null, null, data);
            });

            wnd.postMessage({type: eventType, data: data, responseCallbackName: successCallbackName}, "*");
        }
    }
})();



/* just a helper function */
function addListItem(listID, message) {
    var node = document.createElement("li");
    node.appendChild(document.createTextNode(message));

    document.getElementById(listID).appendChild(node);
}