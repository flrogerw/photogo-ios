SETUP:
cordova create photogo com.photogo.mobile photoandgo
cd .\photoandgo
cordova platforms add android
cordova plugin add cordova-plugin-device
cordova plugin add cordova-plugin-console
cordova plugin add cordova-plugin-dialogs
cordova plugin add cordova-plugin-media
cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-file.git
cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin- file-transfer.git
cordova plugin add com.ionic.keyboard
cordova plugin add cordova-plugin-statusbar
cordova plugin add cordova-plugin-inappbrowser
cordova plugin add https://github.com/Wizcorp/phonegap-facebook-plugin.git --variable APP_ID=535521996587090 --variable APP_NAME=Photo&Go
cordova plugin add https://github.com/wymsee/cordova-imagePicker.git
cordova plugin add cordova-plugin-screen-orientation
cordova plugin add cordova-instagram-plugin
cordova plugin add https://github.com/bez4pieci/Phonegap-Cookies-Plugin.git