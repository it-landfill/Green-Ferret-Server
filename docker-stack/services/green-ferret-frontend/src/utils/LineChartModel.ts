interface LineChartElementModel {
	checked: boolean;
	exists: boolean;
	color: string;
}

export interface LineChartModel {
	[key: string]: LineChartElementModel;
}