import { App } from "@ailhc/egf-core";

export class RefOtherPkg extends App {
    constructor() {
        super();
        const a = new App();
        console.log(a);
    }
}
