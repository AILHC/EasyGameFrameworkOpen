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
