import { ICreateTsIndexOption } from './options/ICreateTsIndexOption';
export declare class TypeScritIndexWriter {
    getDefaultOption(cwd?: string): ICreateTsIndexOption;
    create(option: ICreateTsIndexOption, _cliCwd?: string): Promise<void>;
    createEntrypoint(option: ICreateTsIndexOption, _cliCwd?: string): Promise<void>;
}
