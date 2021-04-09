import { ICreateTsIndexOption } from '../options/ICreateTsIndexOption';
import { CTILogger } from '../tools/CTILogger';
import { ICommandModule } from './ICommandModule';
export declare class CleanCommandModule implements ICommandModule {
    do(executePath: string, passed: Partial<ICreateTsIndexOption>): Promise<void>;
    write(_param: {
        directories: Array<string>;
        option: ICreateTsIndexOption;
        logger: CTILogger;
    }): Promise<void>;
}
