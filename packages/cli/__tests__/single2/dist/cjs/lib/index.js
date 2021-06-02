'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var egfCore = require('@ailhc/egf-core');

class classA {
    sayA(a) { }
}

class classB {
    sayb(b) {
        console.log("FDS");
    }
}

class classC {
    sayd(cc) {
        console.log(cc);
    }
}

class bc {
    constructor() {
        console.log("bc");
    }
}

class RefOtherPkg extends egfCore.App {
    constructor() {
        super();
        const a = new egfCore.App();
        console.log(a);
    }
}

exports.RefOtherPkg = RefOtherPkg;
exports.bc = bc;
exports.classA = classA;
exports.classB = classB;
exports.classC = classC;

    
//# sourceMappingURL=index.js.map
