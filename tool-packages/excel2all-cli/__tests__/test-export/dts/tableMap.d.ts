interface ITBase<T> { [key:string]:T}
interface IT_TableMap {
	readonly MergeTableSetting?: ITBase<IT_MergeTableSetting>;
	readonly TableTypeSetting?: ITBase<IT_TableTypeSetting>;
	readonly TableTypeCSVSetting?: ITBase<IT_TableTypeCSVSetting>;
	readonly ObjTypeSetting?: IT_ObjTypeSetting;
}
interface IT_MergeTableSetting {
	/** 主键 */
	readonly id?: number;
	/** 数字 */
	readonly field_int?: number;
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
