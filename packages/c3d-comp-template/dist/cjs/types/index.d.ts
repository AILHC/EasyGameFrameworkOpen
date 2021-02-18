declare module "c3d-comp-template/src/TestComp" {
    import { Component } from "cc";
    export class TestComp extends Component {
        start(): void;
    }
}
declare module "c3d-comp-template" {
    export * from "c3d-comp-template/src/TestComp";
}
