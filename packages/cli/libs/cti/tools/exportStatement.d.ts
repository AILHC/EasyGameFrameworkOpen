import { ICreateTsIndexOption } from '../options/ICreateTsIndexOption';
import { CTILogger } from './CTILogger';
export declare function getExportStatementCreator(option: ICreateTsIndexOption, logger: CTILogger): (target: string) => string;
