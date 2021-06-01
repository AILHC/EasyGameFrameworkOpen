declare module 'egfCli' {
	class classA {
	    /**
	     * ffjfjf
	     * @param a
	     */
	    sayA(a: number): void;
	}

}
declare module 'egfCli' {
	class classB {
	    sayb(b: string): void;
	}

}
declare module 'egfCli' {
	class classC {
	    sayd(cc: any): void;
	}

}
declare module 'egfCli' {
	class bc {
	    constructor();
	}

}
declare module 'egfCli' {
	import { App } from '@ailhc/egf-core';
	class RefOtherPkg extends App {
	    constructor();
	}

}
declare module 'egfCli' {
	
	
	
	
	

}

declare namespace egfCli {
	type classA = import('egfCli').classA;
	type classB = import('egfCli').classB;
	type classC = import('egfCli').classC;
	type bc = import('egfCli').bc;
	type RefOtherPkg = import('egfCli').RefOtherPkg;
}
declare const egfCli:typeof import("egfCli");