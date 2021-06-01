declare module 'testModule' {
	class classA {
	    /**
	     * ffjfjf
	     * @param a
	     */
	    sayA(a: number): void;
	}

}
declare module 'testModule' {
	class classB {
	    sayb(b: string): void;
	}

}
declare module 'testModule' {
	class classC {
	    sayd(cc: any): void;
	}

}
declare module 'testModule' {
	class bc {
	    constructor();
	}

}
declare module 'testModule' {
	import { App } from '@ailhc/egf-core';
	class RefOtherPkg extends App {
	    constructor();
	}

}
declare module 'testModule' {
	
	
	
	
	

}

declare namespace testModule {
	type classA = import('testModule').classA;
	type classB = import('testModule').classB;
	type classC = import('testModule').classC;
	type bc = import('testModule').bc;
	type RefOtherPkg = import('testModule').RefOtherPkg;
}
declare const testModule:typeof import("testModule");