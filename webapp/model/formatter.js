sap.ui.define([], function () {
    "use strict";
  
    const Formatter = {};
  
    /**
     * Возвращает иконку статуса утверждающего в зависимости от переданного статуса.
     * @param {string} iStatus Статус утверждающего.
     * @returns {string} Иконка статуса утверждающего.
     */
    Formatter.calculateVacationDays = function(startDate, endDate) {
        if (startDate && endDate) {
            const oTimeDiff = endDate.getTime() - startDate.getTime();
            const iDaysDiff = Math.ceil(oTimeDiff / (1000 * 3600 * 24));
            const iLastDigit = iDaysDiff % 10;
            const iLastTwoDigits = iDaysDiff % 100;

            let sDayWord;
            if (iLastTwoDigits >= 11 && iLastTwoDigits <= 14) {
                sDayWord = 'дней';
            } else if (iLastDigit === 1) {
                sDayWord = 'день';
            } else if (iLastDigit >= 2 && iLastDigit <= 4) {
                sDayWord = 'дня';
            } else {
                sDayWord = 'дней';
            }

            return 'Выбрано: ' + iDaysDiff.toString() + ' ' + sDayWord;
        }
        return "0";
    };
    
    /**
     * Форматирует код позиции в текстовое представление.
     * @param {string} oPositionCode Код позиции.
     * @returns {string} Текстовое представление позиции с HTML-разделителем.
     */
    Formatter.formatPosition = function (oPositionCode) {
        const oPositionDict = this.getView().getModel("mPositionDict").getData();
        if (!oPositionDict || oPositionDict instanceof Object) return;

        const oPositionEntry = oPositionDict.find(oEntry => oEntry.pernr === oPositionCode);
        if (oPositionEntry && oPositionEntry.plansText) {
            return oPositionEntry.plansText.toLowerCase();
        } else if (oPositionEntry) {
            return "нет данных";
        } else {
            return oPositionCode;
        }
    };

    /**
     * Форматирует код позиции в текстовое представление.
     * @param {string} sLeaveTypeCode Код позиции.
     * @returns {string} Текстовое представление позиции с HTML-разделителем.
     */

    Formatter.formatAward = function (sLeaveTypeCode) {
        if (!sLeaveTypeCode) {
            return "";
        }
        
        const oDictAwartDict = this.getView().getModel("mDictAwartDict");
        
        if (!oDictAwartDict) {
            return sLeaveTypeCode;
        }
        
        const oData = oDictAwartDict.getData();
        
        if (oData && typeof oData === "object") {
            if (oData[sLeaveTypeCode] && oData[sLeaveTypeCode].text) {
                return oData[sLeaveTypeCode].text;
            }
        }
        
        return sLeaveTypeCode;
    };

    /**
     * Форматирует код позиции в текстовое представление.
     * @param {string} sDepartmentCode Код позиции.
     * @returns {string} Текстовое представление позиции с HTML-разделителем.
     */

    Formatter.formatDepartment = function (sDepartmentCode) {
        const oDictPersgDict = this.getView().getModel("mDictPersgDict").getData();
        
        const oPersgEntry = oDictPersgDict.find(oObj => oObj.id === sDepartmentCode);
        if (oPersgEntry) {
            return oPersgEntry.text;
        } else {
            return sDepartmentCode;
        }
    };

    /**
     * Форматирует код позиции в текстовое представление.
     * @param {string} sStatusCode Код позиции.
     * @returns {string} Текстовое представление позиции с HTML-разделителем.
     */

    Formatter.formatStatus = function (sStatusCode, sDocId) {
        const oBundle = this.getResourceBundle();
        const oDictRequestStatusDict = this.getView().getModel("mDictRequestStatusDict").getData();
        
        const oStatusEntry = oDictRequestStatusDict.find(oObj => oObj.statusID === sStatusCode);
        if (oStatusEntry) {
            if (sStatusCode === '01' && !sDocId) {
                return oBundle.getText('EMPLOYEE_VACATION_DOCS_NOT_SIGNED');
            } else {
                return oStatusEntry.statusText;
            }
        } else {
            return sStatusCode;
        }
    };
    /**
     * Форматирует код позиции в текстовое представление.
     * @param {string} sStartDate Код позиции дат.
     * @param {string} sEndDate Код позиции дат.
     * @returns {string} Текстовое представление позиции с HTML-разделителем.
     */

    Formatter.dateRangeFormatter = function(sStartDate, sEndDate){
        if (!sStartDate || !sEndDate){
            return "Данные о датах отпуска недоступны";
        };

        const oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
            pattern: "d MMM yyyy 'г.'"
        });

        const sStartDateString = oDateFormat.format(new Date(sStartDate));
        const sEndDateString = oDateFormat.format(new Date(sEndDate));

        return `с ${sStartDateString} - до ${sEndDateString}`;
    };
    /**
     * Форматирует код позиции в текстовое представление.
     * @param {string} sCreateDate Код позиции дат.
     * @returns {string} Текстовое представление позиции с HTML-разделителем.
     */

    Formatter.createDateVacationFormatter = function(sCreateDate) {
        if (!sCreateDate){
            return "Данные о дате создания отпуска недоступны";
        };

        const oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
            pattern: "d MMM yyyy 'г.'"
        });
        
        const sCreateDateString = oDateFormat.format(new Date(sCreateDate));

        return sCreateDateString;
    }
    /**
     * Форматирует код позиции в текстовое представление.
     * @param {string} sStatus Код позиции.
     * @returns {string} Текстовое представление позиции с HTML-разделителем.
     */

    Formatter.formatChangeText = function(sStatus){
        switch(sStatus){
            case "02": return "Дата отклонения заявки";
            case "03": return "Дата подтверждения заявки ";
            default: return "Дата подачи заявки"
        }
    };

    /**
     * Форматирует код позиции в текстовое представление.
     * @param {string} sIdEmployee Код позиции id сотрудника.
     * @param {string} sPernrEmployee Код позиции индификационный номер сотрудника.
     * @param {string} sIdMessage Код позиции id сотрудника в другом диалоге.
     * @param {string} sPernrMessage Код позиции индификационный номер сотрудника в другом диалоге.
     * @returns {string} Текстовое представление позиции с HTML-разделителем.
     */

    Formatter.getUploadUrl = function(sIdEmployee, sPernrEmployee, sIdMessage, sPernrMessage){
        if (sIdEmployee && sPernrEmployee) {
            return `/sap/opu/odata/SAP/ZINT_VACATIONS_SRV/FileSet(ID='${sIdEmployee}',pernr='${sPernrEmployee}')/$value`;
        } else {
            return `/sap/opu/odata/SAP/ZINT_VACATIONS_SRV/FileSet(ID='${sIdMessage}',pernr='${sPernrMessage}')/$value`;
        }
    }

     /**
     * Форматирует код позиции в текстовое представление.
     * @param {string} sStatus Код позиции.
     * @param {string} sFullnameSignedBy Код позиции имени.
     * @returns {string} Текстовое представление позиции с HTML-разделителем.
     */

    Formatter.formatDecitionText = function(sStatus, sFullnameSignedBy){
        switch(sStatus){
            case "02": return "Решение отклонил: " + sFullnameSignedBy;
            case "03": return "Решение принял: " + sFullnameSignedBy;
            default: return "Ответственный сотрудник еще не рассмотрел вашу заявку на отпуск."
        }
    };

    /**
     * Форматирует отображение позиции в текстовое представление все, что ниже.
     * @param {string} sStatus Код позиции.
     * @param {string} sDocId Код позиции по номеру документа.
     * @returns {string} Текстовое представление позиции с HTML-разделителем.
     */

    Formatter.formatVisibleButton = function(sStatus, sDocId){
        return (sStatus === "01") && !sDocId;
    };

    Formatter.formatVisibleLabel = function(sStatus){
        return (sStatus === "01");
    };

    Formatter.formatVisionVacationDocuments = function(sDocId, sDocType) {
        return (sDocId && sDocType === "Заявление на отпуск");
    };

    Formatter.formatVisionHRDocuments = function(sDocId, sDocType) {
        return (sDocId && sDocType === "Приказ на отпуск");
    };

    Formatter.formatVisionOtherDocuments = function(sDocId, sDocType) {
        return (sDocId && sDocType === "Прочие документы к отпуску");
    };

    Formatter.getPendingCount = function(aRequests) {
        if (!Array.isArray(aRequests)) {
            return 0;
        }

        return aRequests.filter(r => r.statusID === '01').length;
    };

    Formatter.getReviewedCount = function(aRequests) {
        if (!Array.isArray(aRequests)) {
            return 0;
        }

        return aRequests.filter(r => r.statusID !== '01').length;
    };

    return Formatter;
    
  });  