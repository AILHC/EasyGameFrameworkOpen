declare module 'genDts' {
	class classA {
	    /**
	     * ffjfjf
	     * @param a
	     */
	    sayA(a: number): void;
	}

}
declare module 'genDts' {
	class classB {
	    sayb(b: string): void;
	}

}
declare module 'genDts' {
	class classC {
	    sayd(cc: any): void;
	}

}
declare module 'genDts' {
	class bc {
	    constructor();
	}

}
declare module 'genDts' {
	import { App } from '@ailhc/egf-core';
	class RefOtherPkg extends App {
	    constructor();
	}

}
declare module 'genDts' {
	
	
	
	
	

}

declare namespace genDts {
	type classA = import('genDts').classA;
	type classB = import('genDts').classB;
	type classC = import('genDts').classC;
	type bc = import('genDts').bc;
	type RefOtherPkg = import('genDts').RefOtherPkg;
}
declare const genDts:typeof import("genDts");