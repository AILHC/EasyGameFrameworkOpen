import { ICreateTsIndexOption } from '../options/ICreateTsIndexOption';
import { CTILogger } from '../tools/CTILogger';
export interface ICommandModule {
    do(cliCwd: string, passed: Partial<ICreateTsIndexOption>): Promise<void>;
    write({ directories, option, logger, }: {
        directories: Array<string>;
        option: ICreateTsIndexOption;
        logger: CTILogger;
    }): Promise<void>;
}
