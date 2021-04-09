import { ICreateTsIndexOption } from '../options/ICreateTsIndexOption';
import { CTILogger } from '../tools/CTILogger';
import { ICommandModule } from './ICommandModule';
export declare class EntrypointCommandModule implements ICommandModule {
    do(executePath: string, passed: Partial<ICreateTsIndexOption>): Promise<void>;
    write({ directories, option, logger, }: {
        directories: Array<string>;
        option: ICreateTsIndexOption;
        logger: CTILogger;
    }): Promise<void>;
}
