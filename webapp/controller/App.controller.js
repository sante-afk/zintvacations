sap.ui.define([
	'ssg/lk/zintvacations/controller/BaseController',
	'ssg/lk/zintvacations/model/formatter'
], function (BaseController, formatter) {
	'use strict';

	return BaseController.extend('ssg.lk.zintvacations.controller.App', {

		formatter: formatter,

		/**
		 * Выполняется инициализация переменных при запуске приложения
		 */
		onInit: function () {			
			this.oBusy = new sap.m.BusyDialog();
			this.oBusy.setBusyIndicatorDelay(0);

			this.oBundle = this.getOwnerComponent().getModel('i18n').getResourceBundle();
		}
	});
});
