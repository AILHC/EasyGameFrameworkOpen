declare module 'tests' {
	class classA {
	    /**
	     * ffjfjf
	     * @param a
	     */
	    sayA(a: number): void;
	}

}
declare module 'tests' {
	class classB {
	    sayb(b: string): void;
	}

}
declare module 'tests' {
	class classC {
	    sayd(cc: any): void;
	}

}
declare module 'tests' {
	class bc {
	    constructor();
	}

}
declare module 'tests' {
	import { App } from '@ailhc/egf-core';
	class RefOtherPkg extends App {
	    constructor();
	}

}
declare module 'tests' {
	
	
	
	
	

}

declare namespace tests {
	type classA = import('tests').classA;
	type classB = import('tests').classB;
	type classC = import('tests').classC;
	type bc = import('tests').bc;
	type RefOtherPkg = import('tests').RefOtherPkg;
}
declare const tests:typeof import("tests");