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
				count: 0
			});

			const oCalendarSettings = new JSONModel({
				startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
				viewKey: 'M',
				intervalDate: 31
			});	

			const oStartUp = new sap.ui.model.json.JSONModel();
			oStartUp.loadData("/sap/bc/ui2/start_up", null, false);
			
			const oPersonal = new JSONModel();
			const oPositionDict = new JSONModel();
			const oDictAwartDict = new JSONModel();
			const oDictPersgDict = new JSONModel();
			const oCalendar = new JSONModel();		
			const oDictRequestStatusDict = new JSONModel();
			const oFilters = new JSONModel({
				filtersPernr: [],
				departments: [],
				startDate: null,
				endDate: null
			});
			const oActiveFilterModel  = new JSONModel({
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

			this.getModel().read("/dictPersgSet", {
				success: (oData) => {
					oDictPersgDict.setData(oData.results);
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
				.setModel(oStartUp, 'mStartUp')
				.setModel(oCalendar, 'mCalendar')
				.setModel(oCalendarSettings, 'mCalendarSettings')
				.setModel(oPersonal, 'mPersonal')
				.setModel(oPositionDict, 'mPositionDict')
				.setModel(oDictAwartDict, 'mDictAwartDict')
				.setModel(oDictPersgDict, 'mDictPersgDict')
				.setModel(oDictRequestStatusDict, 'mDictRequestStatusDict')
				.setModel(oFilters, 'mFilters')
				.setModel(oActiveFilterModel, 'mActiveFilterModel');
		}
		
	});
});
