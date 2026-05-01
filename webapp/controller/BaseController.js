sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/UIComponent',
	'ssg/lk/zintvacations/mixins/openMessage',
	'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
], function (Controller, UIComponent, openMessage,Filter,FilterOperator) {
	'use strict';

	const oBaseController = Controller.extend('ssg.lk.zintvacations.controller.BaseController', $.extend({},
		openMessage, {
		/**
		 * Выполняется получение ресурсной модели i18n.
		 * @returns {sap.ui.model.resource.ResourceModel} Объект ресурсной модели i18n.
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel('i18n').getResourceBundle();
		},

		/**
		 * Выполняется получение объекта роутинга.
		 * @returns {sap.ui.core.routing.Router} Объект роутинга.
		 */
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * Выполняет получение объекта модели.
		 * @returns {sap.ui.model.Model} Возвращает объект модели.
		 */
		getModel: function () {
			return this.getOwnerComponent().getModel();
		},
		
		/**
		 * Выполняет получение объекта модели по наименованию.
		 * @param {string} sName Имя модели.
		 * @returns {sap.ui.model.Model} Возвращает объект модели.
		 */
		getComponentModel: function (sName) {
			return this.getOwnerComponent().getModel(sName);
		},
		
		/**
		 * Выполняет форматирование даты, что бы при получении даты сервером, она не становилась +1 или -1 сутки.
		 * @param {Object} oDateTime Объект даты.
		 * @returns {Date|null} Объект даты.
		 */
		getFormatEditDateTime: function (oDateTime) {
			if (oDateTime) {
				oDateTime = new Date(oDateTime.getFullYear(), oDateTime.getMonth(), oDateTime.getDate());
				const oDate = new Date();
				const iOffset = Math.abs(oDate.getTimezoneOffset());

				return new Date(oDateTime.getTime() + iOffset * 60000);
			} else {
				return null;
			}
		},

		getEmployees: function(dispVac = false) {
			return new Promise((resolve, reject) => {
				const sPernr = this.mPersonal.getProperty('/pernr');
				const aFilters = this.getFilters();
				const aFiltersForVacSet = this.getFiltersForVacSet();

				this.oBusyDialog.open();
				this.mZintVacationsSrv.read('/employeesSet', {
					filters: aFilters,
					urlParameters: {
						pernr: sPernr
					},
					success: (oData) => {
						const aEmployees = oData.results;
						this.iCountVacSet = aEmployees.length;
						const aFilteredEmployees = [];

						if (this.iCountVacSet === 0) {
							this.mCalendar.setProperty('/results', aEmployees);
							this.mCalendar.setProperty('/rows', aFilteredEmployees);
							this.oBusyDialog.close();
							delete this.iCountVacSet;
							resolve();
						}
						
						aEmployees.forEach(oEmployee => {
							const sKey = this.mZintVacationsSrv.createKey('/employeesSet', oEmployee);
		
							this.mZintVacationsSrv.read(sKey + '/vacSet', {
								filters: aFiltersForVacSet,
								success: (oVacSetData) => {
									
									this.iCountVacSet -= 1;
									
									if (!dispVac) {
										oVacSetData.results.forEach(oVacation => {
											oVacation.startDate.setHours(0.0);
											oVacation.endDate.setHours(24.0);
										});
										
										oEmployee.vacSet = oVacSetData.results;
										aFilteredEmployees.push(oEmployee);
									} 
									
									if (dispVac && oVacSetData.results.length > 0) {
											oVacSetData.results.forEach(oVacation => {
											oVacation.startDate.setHours(0.0);
											oVacation.endDate.setHours(24.0);
										});
										
										oEmployee.vacSet = oVacSetData.results;
										aFilteredEmployees.push(oEmployee);
									}



									if (this.iCountVacSet === 0) {
										this.mCalendar.setProperty('/results', aEmployees);
										this.mCalendar.setProperty('/rows', aFilteredEmployees);
										this.oBusyDialog.close();
										delete this.iCountVacSet;
										resolve();
									}
								},
								error: (oError) => {
									this.openMessage(oError.responseText[0] !== "<" ? JSON.parse(oError.responseText) : oError.responseText);
									
									this.iCountVacSet -= 1;
									if (this.iCountVacSet === 0) {
										this.mCalendar.setProperty('/results', aEmployees);
										this.mCalendar.setProperty('/rows', aFilteredEmployees);
										this.oBusyDialog.close();
										delete this.iCountVacSet;
										resolve();
									}
								}
							});
						});
					},
					error: (oError) => {
						this.openMessage(oError.responseText[0] !== "<" ? JSON.parse(oError.responseText) : oError.responseText);
						this.oBusyDialog.close();
						reject(oError);
					}
				});
					
			});
		},

		getVacationRequests: function(sPernr, HRVacCheck = false) {
			return new Promise((resolve, reject) => {
				const sMyPernr = this.mPersonal.getProperty('/pernr');

				if (!sPernr) {
					sPernr = this.mPersonal.getProperty('/pernr');
				}

				const aFilters = [
					new Filter("pernr", FilterOperator.EQ, sPernr),
					new Filter("HRVacCheck", FilterOperator.EQ, HRVacCheck && sMyPernr === sPernr)
				];

				this.mZintVacationsSrv.read('/requestSet', {
					filters: aFilters, 
					urlParameters: {
						$expand: [
							'docsSet'
						]
					},
					success: (oData) => {
						const aNewRequests = oData.results.filter(oItem => oItem.statusID === "01");
						this.mMain.setProperty("/count", aNewRequests.length);
						this.mMain.setProperty('/requests', oData);
						
						resolve(oData);
					},
					error: (oError) => {
						this.openMessage(oError.responseText[0] !== "<" ? JSON.parse(oError.responseText) : oError.responseText);
						
						if (this.oEmployeeVacationDialog) {
							this.onCloseEmployeeVacationDialog();
						} else if (this.oApproveVacationDialog) {
							this.onCloseApproveVacationDialog();
						}
						
						reject(oError);
					}
				});
			});
		},

		getFilters: function () {
			const aFilters = [];
			const aSelectedPernr = this.mFilters.getProperty("/filtersPernr") || [];			
			

			if (aSelectedPernr.length > 0 || aSelectedPernr.pernr) {
				const aPernrFilters = aSelectedPernr.map(oEmployee => new Filter("pernr", FilterOperator.EQ, oEmployee.pernr)
				);
				aFilters.push(new Filter({
					filters: aPernrFilters,
					and: false
				}));
			}

			const aSelectedDepartments = this.mFilters.getProperty("/departments") || [];
			if (aSelectedDepartments.length > 0) {
				const aDepartmentsFilters = aSelectedDepartments.map(sRole => new Filter("role", FilterOperator.EQ, sRole)
				);
				aFilters.push(new Filter({
					filters: aDepartmentsFilters,
					and: false
				}));
			}

			return aFilters;
		},

		getFiltersForVacSet: function () {
			const aFilters = [];
			const oStartDate = this.mFilters.getProperty("/startDate");
			const oEndDate = this.mFilters.getProperty("/endDate");

			if (oStartDate && oEndDate) {
				aFilters.push(
					new Filter("startDate", FilterOperator.EQ, oStartDate),
					new Filter("endDate", FilterOperator.EQ, oEndDate),
				);
			}

			return aFilters;
		},

		getFiltersForDocId: function () {
			const aFilters = [];
			const sPernr = this.mPersonal.getProperty("/pernr");
			const sRequestId = ""
		
				if (sPernr) {
					aFilters.push(
						new sap.ui.model.Filter("pernr", sap.ui.model.FilterOperator.EQ, sPernr),
						new sap.ui.model.Filter("requestId", sap.ui.model.FilterOperator.EQ, sRequestId)
					);
				}
	
			return aFilters;
		},
		
		getAboutMeSet: function () {
			return new Promise((resolve, reject) => {
				this.mZintVacationsSrv.read("/AboutMeSet('')", {
					success: oData => {
						this.mPersonal.setData(oData);
						resolve(oData);
					},
					error: (oError) => {
						this.openMessage(oError.responseText[0] !== "<" ? JSON.parse(oError.responseText) : oError.responseText);
						reject();
					}
				});
			});
		},

		onCellClick: function (oEvent) {
			const oRowBindingContext = oEvent.getParameter('rowBindingContext');
			const sRowIndex = oEvent.getParameter('rowIndex');
			const oSource = oEvent.getSource();

			if (oRowBindingContext) {
				oSource.setSelectionInterval(sRowIndex, sRowIndex);
			}
		},

		getPernrForHR: function () {
			const oTable = sap.ui.getCore().byId('idTableHRRequests');
			const iSelectedIndex = oTable.getSelectedIndex();
			let sPernr;

			if (iSelectedIndex !== -1) {
				const oContext = oTable.getContextByIndex(iSelectedIndex);
            	const oObject = oContext.getObject();
				sPernr = oObject.pernr;
			}
            
			return sPernr;
		}
    }));

	return oBaseController;
});
