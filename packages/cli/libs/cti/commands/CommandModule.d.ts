/// <reference types="node" />
import * as fs from 'fs';
import { ICreateTsIndexOption } from '../options/ICreateTsIndexOption';
import { CTILogger } from '../tools/CTILogger';
export declare class CommandModule {
    static promisify: {
        exists: typeof fs.exists.__promisify__;
        glob: (arg1: string, arg2: any) => Promise<string[]>;
        readDir: (arg1: string) => Promise<string[]>;
        readFile: typeof fs.readFile.__promisify__;
        stat: (arg1: string) => Promise<fs.Stats>;
        unlink: (arg1: fs.PathLike) => Promise<void>;
        writeFile: (arg1: string, arg2: any, arg3: string) => Promise<void>;
    };
    static targetFileFilter({ filenames, option, logger, }: {
        filenames: Array<string>;
        option: ICreateTsIndexOption;
        logger: CTILogger;
    }): Array<string>;
}
