interface ITBase<T> { [key:string]:T}
interface IT_TableMap {
	readonly LongColKeySetting?: ITBase<IT_LongColKeySetting>;
	readonly ObjTypeSetting?: IT_ObjTypeSetting;
	readonly TableTypeCSVSetting?: ITBase<IT_TableTypeCSVSetting>;
	readonly TableTypeSetting?: ITBase<IT_TableTypeSetting>;
	readonly WithErrorTableSetting?: ITBase<IT_WithErrorTableSetting>;
	readonly MergeTableSetting?: ITBase<IT_MergeTableSetting>;
}
