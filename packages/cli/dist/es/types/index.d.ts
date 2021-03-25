declare module "@ailhc/egf-cli/rollupdo" {
    function rollupBuild(
        isWatch: boolean,
        entrys: string[],
        outputDir: string,
        output: string[],
        format: string,
        typesDir: string,
        unRemoveComments: string,
        target: string,
        minify: boolean
    ): Promise<void>;
    export { rollupBuild as build };
}
