interface ITBase<T> { [key:string]:T}
interface IT_TableMap {
	readonly MergeTableSetting?: ITBase<IT_MergeTableSetting>;
	readonly TableTypeSetting?: ITBase<IT_TableTypeSetting>;
	readonly TableTypeCSVSetting?: ITBase<IT_TableTypeCSVSetting>;
	readonly ObjTypeSetting?: IT_ObjTypeSetting;
	readonly LongColKeySetting?: ITBase<IT_LongColKeySetting>;
}
interface IT_MergeTableSetting {
	/** 主键 */
	readonly id?: number;
	/** 数字 */
	readonly field_int?: number;
	/** 布尔值 */
	readonly field_bool?: boolean;
	/** 数字数组 */
	readonly field_int_array?: number[];
	/** 字符串 */
	readonly field_string?: string;
	/** 字符串数组 */
	readonly field_string_array?: string[];
	/** JSON */
	readonly field_json?: any;
	readonly obj?: {
		/** 多列对象:数字字段 */
		readonly obj_field_int?: number;
		/** 字符串字段 */
		readonly obj_field_string?: string;
		/** 数字数组字段 */
		readonly obj_field_int_array?: number[];
		/** 字符串数组字段 */
		readonly obj_field_string_array?: string[];
		/** json字段 */
		readonly obj_field_json?: any;
	}
}
interface IT_TableTypeSetting {
	/** 主键 */
	readonly id?: number;
	/** 数字 */
	readonly field_int?: number;
	/** 布尔值 */
	readonly field_bool?: boolean;
	/** 数字数组 */
	readonly field_int_array?: number[];
	/** 字符串 */
	readonly field_string?: string;
	/** 字符串数组 */
	readonly field_string_array?: string[];
	/** JSON */
	readonly field_json?: any;
	readonly obj?: {
		/** 多列对象:数字字段 */
		readonly obj_field_int?: number;
		/** 字符串字段 */
		readonly obj_field_string?: string;
		/** 数字数组字段 */
		readonly obj_field_int_array?: number[];
		/** 字符串数组字段 */
		readonly obj_field_string_array?: string[];
		/** json字段 */
		readonly obj_field_json?: any;
	}
}
interface IT_TableTypeCSVSetting {
	/** ä¸»é® */
	readonly id?: number;
	/** æ°å­ */
	readonly field_int?: number;
	/** å¸å°å¼ */
	readonly field_bool?: boolean;
	/** æ°å­æ°ç» */
	readonly field_int_array?: number[];
	/** å­ç¬¦ä¸² */
	readonly field_string?: string;
	/** å­ç¬¦ä¸²æ°ç» */
	readonly field_string_array?: string[];
	/** JSON */
	readonly field_json?: any;
	readonly obj?: {
		/** å¤åå¯¹è±¡:æ°å­å­æ®µ */
		readonly obj_field_int?: number;
		/** å­ç¬¦ä¸²å­æ®µ */
		readonly obj_field_string?: string;
		/** æ°å­æ°ç»å­æ®µ */
		readonly obj_field_int_array?: number[];
		/** å­ç¬¦ä¸²æ°ç»å­æ®µ */
		readonly obj_field_string_array?: string[];
		/** jsonå­æ®µ */
		readonly obj_field_json?: any;
	}
}
interface IT_ObjTypeSetting {
	/** 数字 */
	readonly Prop1?: number;
	/** 布尔值 */
	readonly PropBool?: boolean;
	/** 数字数组 */
	readonly Prop2?: number[];
	/** 字符串 */
	readonly Prop3?: string;
	/** 字符串数组 */
	readonly Prop4?: string[];
	/** json对象 */
	readonly Prop5?: any;
	readonly MyObject?: {
		/** 嵌套对象测试:主键id */
		readonly id?: number;
		/** 名字 */
		readonly name?: string;
	}
}
interface IT_LongColKeySetting {
	/** 主键 */
	readonly id?: number;
	/** 数字 */
	readonly field_int?: number;
	/** 布尔值 */
	readonly field_bool?: boolean;
	/** 数字数组 */
	readonly field_int_array?: number[];
	/** 字符串 */
	readonly field_string?: string;
	/** 字符串数组 */
	readonly field_string_array?: string[];
	/** JSON */
	readonly field_json?: any;
	/** 字符串数组 */
	readonly test_array3?: string[];
	/** 字符串数组 */
	readonly test_array4?: string[];
	/** 字符串数组 */
	readonly test_array5?: string[];
	/** 字符串数组 */
	readonly test_array6?: string[];
	/** 字符串数组 */
	readonly test_array7?: string[];
	/** 字符串数组 */
	readonly test_array8?: string[];
	/** 字符串数组 */
	readonly test_array9?: string[];
	/** 字符串数组 */
	readonly test_array10?: string[];
	/** 字符串数组 */
	readonly test_array11?: string[];
	/** 字符串数组 */
	readonly test_array12?: string[];
	/** 字符串数组 */
	readonly test_array13?: string[];
	/** 字符串数组 */
	readonly test_array14?: string[];
	/** 字符串数组 */
	readonly test_array15?: string[];
	/** 字符串数组 */
	readonly test_array16?: string[];
	/** 字符串数组 */
	readonly test_array17?: string[];
	/** 字符串数组 */
	readonly test_array18?: string[];
	/** 字符串数组 */
	readonly test_array19?: string[];
	/** 字符串数组 */
	readonly test_array20?: string[];
	/** 字符串数组 */
	readonly test_array21?: string[];
	/** 字符串数组 */
	readonly test_array22?: string[];
	/** 字符串数组 */
	readonly test_array23?: string[];
	/** 字符串数组 */
	readonly test_array24?: string[];
	/** 字符串数组 */
	readonly test_array25?: string[];
	/** 字符串数组 */
	readonly test_array26?: string[];
	/** 字符串数组 */
	readonly test_array27?: string[];
	/** 字符串数组 */
	readonly test_array28?: string[];
	/** 字符串数组 */
	readonly test_array29?: string[];
	/** 字符串数组 */
	readonly test_array30?: string[];
	/** 字符串数组 */
	readonly test_array31?: string[];
	/** 字符串数组 */
	readonly test_array32?: string[];
	/** 字符串数组 */
	readonly test_array33?: string[];
	/** 字符串数组 */
	readonly test_array34?: string[];
	/** 字符串数组 */
	readonly test_array35?: string[];
	/** 字符串数组 */
	readonly test_array36?: string[];
	/** 字符串数组 */
	readonly test_array37?: string[];
	/** 字符串数组 */
	readonly test_array38?: string[];
	/** 字符串数组 */
	readonly test_array39?: string[];
	/** 字符串数组 */
	readonly test_array40?: string[];
	/** 字符串数组 */
	readonly test_array41?: string[];
	/** 字符串数组 */
	readonly test_array42?: string[];
	/** 字符串数组 */
	readonly test_array43?: string[];
	/** 字符串数组 */
	readonly test_array44?: string[];
	/** 字符串数组 */
	readonly test_array45?: string[];
	/** 字符串数组 */
	readonly test_array46?: string[];
	readonly obj?: {
		/** 多列对象:数字字段 */
		readonly obj_field_int?: number;
		/** 字符串字段 */
		readonly obj_field_string?: string;
		/** 数字数组字段 */
		readonly obj_field_int_array?: number[];
		/** 字符串数组字段 */
		readonly obj_field_string_array?: string[];
		/** json字段 */
		readonly obj_field_json?: any;
	}
}
