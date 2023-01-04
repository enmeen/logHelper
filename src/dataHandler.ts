import { mock } from "./data";

type IItem = {
	event_name: string;
	event_time: number;
	_app_id: string;
	[key: string]: any;
};

function getFilters(item: string[]) {
	return item.map((item: string) => {
		return {
			text: item,
			value: item,
		};
	});
}

export function dataHandler(data = mock) {
	const result: any = [];
	const filters: any = new Set();
	if (data && data.length > 0) {
		data.forEach((item: any) => {
			if (item && item.value) {
				result.push({
					...item.value,
				});
				item.value.event_name && filters.add(item.value.event_name);
			}
		});
	}
	return { result, filters: getFilters([...filters]) };
}
