interface IT_TableTypeCSVSetting {
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
