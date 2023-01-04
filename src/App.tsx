import { useEffect, useState } from "react";
import "./App.css";
import ReactJson from "react-json-view";
import { Button, Col, Modal, Row, Space, Table, Tooltip } from "antd";
import { AuditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { mock } from "./data";
import { dataHandler } from "./dataHandler";

declare const chrome: any;

{
	/* <ReactJson src={data} name={null} collapsed={1} displayDataTypes={false} />; */
}

function App() {
	const [originData, setOriginData] = useState<any>([]);
	const [data, setData] = useState<any>([]);
	const [columns, setColumns] = useState<any>([]);
	const [item, setItem] = useState<any>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleOk = () => {
		setIsModalOpen(false);
	};

	const getColumns = function (filters: any[]) {
		return [
			{
				title: "event_time",
				dataIndex: "event_time",
				key: "event_time",
				sorter: (a: any, b: any) => {
					return a.event_time - b.event_time;
				},
				render: (val: number) => {
					return <Tooltip title={val}>{dayjs(val).format("YYYY-MM-DD HH:mm:ss")}</Tooltip>;
				},
			},
			{
				title: "event_name",
				dataIndex: "event_name",
				key: "event_name",
				filters,
				onFilter: (value: any, record: any) => record?.event_name?.indexOf(value) === 0,
			},
			{
				title: "_app_id",
				dataIndex: "_app_id",
				key: "_app_id",
			},
			// {
			// 	title: "_url_path",
			// 	dataIndex: "_url_path",
			// 	key: "_url_path",
			// 	ellipsis: true,
			// },
			{
				title: "操作",
				dataIndex: "_url_path",
				key: "_url_path",
				render: (val: string, record: any) => {
					return (
						<div>
							<Button
								onClick={() => {
									setItem(record);
									setIsModalOpen(true);
								}}>
								<AuditOutlined />
							</Button>
						</div>
					);
				},
			},
		];
	};

	

	const queryCb = () => {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs: any) {
			chrome.tabs.sendMessage(tabs[0].id, { type: "popup-query" }, function (response: any) {
				console.log("popup-query", response);
			});
		});
	};

	const clearCb = () => {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs: any) {
			chrome.tabs.sendMessage(tabs[0].id, { type: "popup-delete" }, function (response: any) {
				console.log("popup-delete", response);
			});
		});
		setOriginData([]);
	};
	useEffect(() => {
		// setOriginData(mock);

		chrome.runtime.onMessage.addListener(function (message: any, sender: any, sendResponse: any) {
			console.log(message);
			try {
				const { type, data } = message;
				type === "content-query" && setOriginData(data);
				sendResponse({
					data: "content-query success",
				});
			} catch (e) {
				sendResponse({
					data: "content-query fail",
				});
			}
		});
	}, []);

	useEffect(()=>{
		queryCb()
	}, [])

	useEffect(() => {
		const { result, filters } = dataHandler(originData);
		setData(result);
		setColumns(getColumns(filters));
	}, [originData]);

	return (
		<div className="App">
			<Row gutter={[24, 16]} style={{ marginBottom: 20 }}>
				<Col>
					<Space wrap>
						<Button onClick={queryCb} type="primary">
							query
						</Button>
						<Button onClick={clearCb}>delete</Button>
					</Space>
				</Col>
			</Row>
			<Row gutter={[24, 16]}>
				<Col span={24}>
					<Table dataSource={data} pagination={false} columns={columns} size={"small"} />
				</Col>
			</Row>

			<Modal footer={null} title="源数据" open={isModalOpen} onCancel={handleOk} width={800}>
				<ReactJson src={item} name={null} collapsed={1} displayDataTypes={false} />
			</Modal>
		</div>
	);
}

export default App;
