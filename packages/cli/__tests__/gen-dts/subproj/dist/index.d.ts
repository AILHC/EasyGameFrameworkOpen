declare module '@ailhc/egf-cli' {
	export class subclassA {
	    /**
	     * ffjfjf
	     * @param a
	     */
	    sayA(a: number): void;
	}

}
declare module '@ailhc/egf-cli' {
	export class classB {
	    sayb(b: string): void;
	}

}
declare module '@ailhc/egf-cli' {
	export * from '@ailhc/egf-cli';
	export * from '@ailhc/egf-cli';

}
