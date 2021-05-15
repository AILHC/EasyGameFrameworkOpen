declare module 'c3dCompTemplate' {
	import { Component } from 'cc';
	class TestComp extends Component {
	    start(): void;
	}

}
declare module 'c3dCompTemplate' {
	

}

declare namespace c3dCompTemplate {
	type TestComp = import('c3dCompTemplate').TestComp;
}
declare const c3dCompTemplate:typeof import("c3dCompTemplate");