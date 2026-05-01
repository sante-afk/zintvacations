sap.ui.define([
	'sap/ui/base/Object', 
	'sap/ui/model/Context'
], function (BaseObject, Context) {
	'use strict';

	return BaseObject.extend('ssg.lk.zhcmi944_v2.control.TableRowColorController', {
		/**
		 * Представляет собой конструктор элемента управления, в котором производится инициализация элемента
		 * @param {Object} oView Объект представления
		 * @param {Object} oTable Таблица
		 * @param {Object} mParameters Параметры
		 */
		constructor: function (oView, oTable, mParameters) {
			mParameters = mParameters || {};

			const sServiceModelName =
				mParameters.sModelName || undefined;
			const mClassConfiguration =
				mParameters.mClassConfiguration || {};

			jQuery.each(
				this.mClassConfiguration,
				function (sClassName, fnIsNeedSetClass) {
					if (jQuery.isFunction(fnIsNeedSetClass)) {
						return;
					}
					mClassConfiguration[sClassName] = function () {
						return false;
					};
				}
			);

			const oController = oView.getController();
			const oOwnerComponent = oController.getOwnerComponent();
			const oServiceModel =
				oOwnerComponent.getModel(sServiceModelName);

			this.oView = oView;
			this.oTable = oTable;
			this.oController = oController;
			this.oOwnerComponent = oOwnerComponent;
			this.oServiceModel = oServiceModel;
			this.sServiceModelName = sServiceModelName;
			this.mClassConfiguration = mClassConfiguration;
		},

		/**
		 * Прикрепляет функцию обработки события к событию _rowsUpdated
		 */
		_attachToTableRowsUpdated: function () {
			this.oTable.attachEvent(
				'_rowsUpdated',
				this.refreshRowColors,
				this
			);
		},

		/**
		 * Обрабатывает изменение цвета строки таблицы
		 * @param {Object} oRow Элемент управления строки
		 * @param {string} sClassName CSS класс
		 * @param {boolean} bIsNeedSetClass Флаг
		 */
		_toggleRowColor: function (oRow, sClassName, bIsNeedSetClass) {
			const oDomRefs = oRow.getDomRefs(true, false);
			if (oDomRefs.rowFixedPart)
				oDomRefs.rowFixedPart.toggleClass(
					sClassName,
					bIsNeedSetClass
				);
			if (oDomRefs.rowScrollPart)
				oDomRefs.rowScrollPart.toggleClass(
					sClassName,
					bIsNeedSetClass
				);
		},

		/**
		 * Обрабатывает конфигурацию цвета
		 * @param {Object} oRow Элемент управления строки
		 */
		_applyColorConfigurationToRow: function (oRow) {
			const oRowContext = oRow.getBindingContext(
				this.sServiceModelName
			);
			const fnToggleRowColor = this._toggleRowColor;
			jQuery.each(
				this.mClassConfiguration,
				function (sClassName, fnIsNeedSetClass) {
					let bIsNeedSetClass = false;
					if (oRowContext instanceof Context) {
						bIsNeedSetClass = fnIsNeedSetClass(oRowContext);
					}
					fnToggleRowColor(oRow, sClassName, bIsNeedSetClass);
				}
			);
		},

		/**
		 * Выполняет пересчёт цвета строки
		 */
		refreshRowColors: function () {
			this.oTable
				.getRows()
				.forEach(this._applyColorConfigurationToRow, this);
		},
	});
});
