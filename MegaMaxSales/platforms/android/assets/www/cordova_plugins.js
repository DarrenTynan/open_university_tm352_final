cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "id": "cordova-plugin-googlemaps.cordova-plugin-googlemaps",
        "file": "plugins/cordova-plugin-googlemaps/www/googlemaps-cdv-plugin.js",
        "pluginId": "cordova-plugin-googlemaps",
        "clobbers": [
            "cordova-plugin-googlemaps"
        ]
    },
    {
        "id": "cordova-plugin-nativegeocoder.NativeGeocoder",
        "file": "plugins/cordova-plugin-nativegeocoder/www/NativeGeocoder.js",
        "pluginId": "cordova-plugin-nativegeocoder",
        "clobbers": [
            "nativegeocoder"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-whitelist": "1.3.2",
    "cordova-plugin-compat": "1.1.0",
    "cordova-plugin-googlemaps": "1.4.0",
    "cordova-plugin-nativegeocoder": "1.0.2"
};
// BOTTOM OF METADATA
});