declare module '@ailhc/egf-cli/src/classA' {
	export class classA {
	    /**
	     * ffjfjf
	     * @param a
	     */
	    sayA(a: number): void;
	}

}
declare module '@ailhc/egf-cli/src/classB' {
	export class classB {
	    sayb(b: string): void;
	}

}
declare module '@ailhc/egf-cli/src/classC' {
	export class classC {
	    sayd(cc: any): void;
	}

}
declare module '@ailhc/egf-cli' {
	export * from '@ailhc/egf-cli/src/classA';
	export * from '@ailhc/egf-cli/src/classB';
	export * from '@ailhc/egf-cli/src/classC';

}
declare module '@ailhc/egf-cli/src2/classA' {
	export class classA {
	    /**
	     * ffjfjf
	     * @param a
	     */
	    sayA(a: number): void;
	}

}
declare module '@ailhc/egf-cli/src2/classB' {
	export class classB {
	    sayb(b: string): void;
	}

}
declare module '@ailhc/egf-cli/src2/classD' {
	export class classD {
	    sayb(b: string): void;
	}

}
declare module '@ailhc/egf-cli/src2' {
	export * from '@ailhc/egf-cli/src/classA';
	export * from '@ailhc/egf-cli/src/classB';
	export * from '@ailhc/egf-cli/src/classD';

}
