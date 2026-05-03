sap.ui.define([
	'sap/ui/core/UIComponent',
	'ssg/lk/zintvacations/model/models',
	'sap/ui/model/json/JSONModel',
], function (UIComponent, models, JSONModel) {
	'use strict';

	return UIComponent.extend('ssg.lk.zintvacations.Component', {

		metadata: {
			manifest: 'json'
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			const oMain = new JSONModel({
				isMobile: sap.ui.Device.system.phone,
				browser: sap.ui.Device.browser.filterName,
				resize: document.documentElement,
				count: 0,
				requests: { 
					results: [
						{
							pernr: "1001",
							fullname: "Смирнов Михаил Алексеевич",
							leaveType: "Type01",
							statusID: "01",
							startDate: new Date(2026, 4, 4),
							endDate: new Date(2026, 4, 6),
							docsSet: {
								results: [
									{
										doctype: "Приказ",
										fileName: "prikaz_1001_01.pdf"
									}
								]
							}
						},
						{
							pernr: "1002",
							fullname: "Александр Дмитриевич Белов",
							leaveType: "Type02",
							statusID: "02",
							startDate: new Date(2026, 4, 20),
							endDate: new Date(2026, 4, 28),
							docsSet: {
								results: []
							}
						},
						{
							pernr: "1003",
							fullname: "Максим Юрьевич Орлов",
							leaveType: "Type01",
							statusID: "03",
							startDate: new Date(2026, 4, 1),
							endDate: new Date(2026, 4, 3),
							docsSet: {
								results: [
									{
										doctype: "Заявление",
										fileName: "zayavlenie_1003_01.pdf"
									}
								]
							}
						}
					]
				}
			});

			const oCalendarSettings = new JSONModel({
				startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
				viewKey: 'M',
				intervalDate: 31
			});

			const oStartUp = new sap.ui.model.json.JSONModel();
			oStartUp.loadData("/sap/bc/ui2/start_up", null, false);

			const oPersonal = new JSONModel({
				pernr: "10001",
				role: "HR",
			});
			const oPositionDict = new JSONModel();
			const oDictAwartDict = new JSONModel({
				"Type01": {
					"text": "Оплачиваемый отпуск"
				},
				"Type02": {
					"text": "Неоплачиваемы отпуск"
				}
			});
			const oDictPersgDict = new JSONModel({
				"results": [
					{ id: 1, text: "Основной отдел" },
					{ id: 9, text: "Внешний отдел" }
				]
			});
			const oCalendar = new JSONModel({
				"rows": [
					{
						"photo": "",
						"pernr": "1001",
						"fullname": "Смирнов Михаил Алексеевич",
						"role": "HR",
						"daysOfVacLeft": 28,
						"vacSet": [
							{
								"id": "0001",
								"pernr": "1001",
								"startDate": new Date(2026, 4, 4),
								"endDate": new Date(2026, 4, 6),
								"leaveType": "Type01"
							},
						],
						"startDate": "",
						"endDate": "",
						"leaveType": "",
						"comments": "",
						"type": "",
						"tentative": ""
					},
					{
						"photo": "",
						"pernr": "1002",
						"fullname": "Александр Дмитриевич Белов",
						"role": "employee",
						"daysOfVacLeft": 28,
						"vacSet": [
							{
								"id": "0001",
								"pernr": "1002",
								"startDate": new Date(2026, 4, 20),
								"endDate": new Date(2026, 4, 28),
								"leaveType": "Type02"
							},
						],
						"startDate": "",
						"endDate": "",
						"leaveType": "",
						"comments": "",
						"type": "",
						"tentative": ""
					},
					{
						"photo": "",
						"pernr": "1003",
						"fullname": "Максим Юрьевич Орлов",
						"role": "Hr",
						"daysOfVacLeft": 28,
						"vacSet": [
							{
								"id": "0001",
								"pernr": "1003",
								"startDate": new Date(2026, 4, 1),
								"endDate": new Date(2026, 4, 3),
								"leaveType": "Type01"
							},
						],
						"startDate": "",
						"endDate": "",
						"leaveType": "",
						"comments": "",
						"type": "",
						"tentative": ""
					},
				]
			});
			const oDictRequestStatusDict = new JSONModel({
				"01": { text: "На рассмотрении" },
				"02": { text: "Отклонена" },
				"03": { text: "Одобрена" }
			});
			const oFilters = new JSONModel({
				filtersPernr: [],
				departments: [],
				startDate: null,
				endDate: null
			});
			const oActiveFilterModel = new JSONModel({
				activeFilter: "employeeinfo"
			});

			this.getModel().read("/dictPerskSet", {
				success: (oData) => {
					oPositionDict.setData(oData.results);
				},
				error: (oError) => {
					this.openMessage(oError.responseText[0] !== "<" ? JSON.parse(oError.responseText) : oError.responseText);
				}
			});

			this.getModel().read("/dictAwartSet", {
				success: (oData) => {
					oDictAwartDict.setData(oData.results);
				},
				error: (oError) => {
					this.openMessage(oError.responseText[0] !== "<" ? JSON.parse(oError.responseText) : oError.responseText);
				}
			});

			this.getModel().read("/dictRequestStatusSet", {
				success: (oData) => {
					oDictRequestStatusDict.setData(oData.results);
				},
				error: (oError) => {
					this.openMessage(oError.responseText[0] !== "<" ? JSON.parse(oError.responseText) : oError.responseText);
				}
			});

			this.setModel(models.createDeviceModel(), 'device')
				.setModel(oMain, 'mMain')
				.setModel(oDictAwartDict, 'mDictAwartDict')
				.setModel(oStartUp, 'mStartUp')
				.setModel(oCalendar, 'mCalendar')
				.setModel(oCalendarSettings, 'mCalendarSettings')
				.setModel(oPersonal, 'mPersonal')
				.setModel(oPositionDict, 'mPositionDict')
				.setModel(oDictPersgDict, 'mDictPersgDict')
				.setModel(oDictRequestStatusDict, 'mDictRequestStatusDict')
				.setModel(oFilters, 'mFilters')
				.setModel(oActiveFilterModel, 'mActiveFilterModel');
		},
		
	});
});
