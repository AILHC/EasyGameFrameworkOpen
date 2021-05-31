System.register(['./ammo-instantiated-d5a22fbd.js'], function (exports) {
    'use strict';
    var legacyCC;
    return {
        setters: [function (module) {
            legacyCC = module.bw;
            exports('default', module.ga);
        }],
        execute: function () {

            function atob(input) {
              var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
              var output = '';
              var chr1 = 0;
              var chr2 = 0;
              var chr3 = 0;
              var enc1 = 0;
              var enc2 = 0;
              var enc3 = 0;
              var enc4 = 0;
              var i = 0;
              input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

              do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));
                chr1 = enc1 << 2 | enc2 >> 4;
                chr2 = (enc2 & 15) << 4 | enc3 >> 2;
                chr3 = (enc3 & 3) << 6 | enc4;
                output += String.fromCharCode(chr1);

                if (enc3 !== 64) {
                  output += String.fromCharCode(chr2);
                }

                if (enc4 !== 64) {
                  output += String.fromCharCode(chr3);
                }
              } while (i < input.length);

              return output;
            }

            legacyCC._global.atob = atob;

        }
    };
});
//# sourceMappingURL=wait-for-ammo-instantiation.js.map
