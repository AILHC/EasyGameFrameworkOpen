declare module 'egfCli' {
	class subclassA {
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
	
	
	
	

}

declare namespace egfCli {
	type subclassA = import('egfCli').subclassA;
	type classB = import('egfCli').classB;
}
declare const egfCli:typeof import("egfCli");