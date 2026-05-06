sap.ui.define([
	'ssg/lk/zintvacations/controller/BaseController',
	'ssg/lk/zintvacations/model/formatter',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageBox',
    'sap/m/MessageToast',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'ssg/lk/zintvacations/mixins/openMessage'
], function (BaseController, formatter, JSONModel, MessageBox, MessageToast, Filter, FilterOperator, openMessage) {
	'use strict';

	return BaseController.extend('ssg.lk.zintvacations.controller.Main', $.extend({},
		openMessage, {

		formatter: formatter,
        _oSelectedRequest: null,

		/**
		 * Выполняется инициализация переменных при запуске приложения.
		 */
		onInit: function () {
			this.oBusyDialog = new sap.m.BusyDialog({
                customIconWidth: '200px',
                customIconHeight: '136px',
                customIconRotationSpeed: 0,
                customIcon: jQuery.sap.getModulePath("ssg.lk.zintvacations") + "/mixins/loading.gif"
            }).setBusyIndicatorDelay(0);
            
			this.oBundle = this.getOwnerComponent().getModel('i18n').getResourceBundle();
			this.oRouter = this.getOwnerComponent().getRouter();

			this.mZintVacationsSrv = this.getComponentModel();
			this.mCalendar = this.getComponentModel('mCalendar');
            this.mPersonal = this.getComponentModel('mPersonal');
            this.mPositionDict = this.getComponentModel('mPositionDict');
            this.mFilters = this.getComponentModel('mFilters');
            this.mActiveFilterModel = this.getComponentModel('mActiveFilterModel');
            this.mMain = this.getComponentModel('mMain');

            this._oDateSelectionState = {
                firstClick: null,
                currentRow: null
            };
            
            this.getRouter().getRoute('main').attachPatternMatched(this._onRouteMatched, this);
		},

        _onRouteMatched: function () {
            this.onDefaultCalendarSettings();
            this.getAboutMeSet()
                .then(oData => {
                    this.getEmployees();

                    if (oData.role === 'HR') {
                        this.getVacationRequests();
                    }
                });
        },

        onIntervalSelect: function(oEvent) {
            const oSelectedDate = oEvent.getParameter("startDate");
            const oRow = oEvent.getParameter("row");
            
            if (!oRow) return;
            if (!this._oDateSelectionState.firstClick) {
                this._oDateSelectionState = {
                    firstClick: oSelectedDate,
                    currentRow: oRow
                };
                MessageToast.show("Выберите конечную дату для создания отпуска.");
            } else {

                if(this._oDateSelectionState.currentRow.getId() !== oRow.getId()){
                    MessageBox.error("Выберите даты для одного сотрудника");
                    this._resetSelectionState();
                    return
                }
                const oStartDate = this._oDateSelectionState.firstClick;
                const oEndDate = oSelectedDate;

                const [dStart, dEnd] = oStartDate <= oEndDate 
                    ? [oStartDate, oEndDate] 
                    : [oEndDate, oStartDate];

                this.openCreateDialogForInterval(
                    this._oDateSelectionState.currentRow.getBindingContext("mCalendar").getObject(),
                    dStart,
                    dEnd
                );

                this._resetSelectionState();
            }
        },

        _resetSelectionState:function(){
            this._oDateSelectionState = {
                firstClick: null,
                currentRow: null
            };
        },

        onOpenUploadOrderDialog: function (oEvent) {
            const oSource = oEvent.getSource();
            const oContext = oSource.getBindingContext('mMain');
            const oObject = oContext.getObject();
            const oModel = oContext.getModel();
            
            const sDocType = oModel ? "VACASTA" : "VACAORD"

            const mUploadOrderDialog = new JSONModel({
                ...oObject,
                docType: sDocType
            })

            this.oUploadOrderDialog = sap.ui.xmlfragment('ssg.lk.zintvacations.fragment.UploadOrderDialog', this);
            this.getView().addDependent(this.oUploadOrderDialog);
            this.oUploadOrderDialog.setModel(mUploadOrderDialog, 'mUploadOrderDialog');

            this.oUploadOrderDialog.open();
        },

        onOpenDetailedInformationDialog: function (oEvent) {
            const oSource = oEvent.getSource();
            const oContext = oSource.getBindingContext('mMain');
            const oObject = oContext.getObject();

            const mDetailedInformationDialog = new JSONModel(oObject);

            this.oDetailedInformationDialog = sap.ui.xmlfragment('ssg.lk.zintvacations.fragment.DetailedInformationDialog', this);
            this.getView().addDependent(this.oDetailedInformationDialog);
            this.oDetailedInformationDialog.setModel(mDetailedInformationDialog, "mDetailedInformationDialog");

            this.oDetailedInformationDialog.open();
        },

        onCloseDetailedInformationDialog: function () {
            this.oDetailedInformationDialog.close();
            this.oDetailedInformationDialog.destroy();
            delete this.oDetailedInformationDialog;
        },
        
        openCreateDialogForInterval: function(oEmployee, oStartDate, oEndDate) {
            const oPerson = this.mPersonal.getData();

            if (oPerson.pernr === oEmployee.pernr || oPerson.role === "HR") {
                const oCreateDialogForIntervalData = {
                    pernr: oEmployee.pernr,
                    fullname: oEmployee.fullname,
                    daysOfVacLeft: oEmployee.daysOfVacLeft ? oEmployee.daysOfVacLeft : 0,
                    startDate: oStartDate,
                    endDate: oEndDate,
                    isChangeEmployeeVis: false,
                    tab: 'createVacation'
                };
            
                if (!this.oCreateNewVacationDialog) {
                    this.oCreateNewVacationDialog = sap.ui.xmlfragment("ssg.lk.zintvacations.fragment.CreateNewVacationDialog", this);
                    this.getView().addDependent(this.oCreateNewVacationDialog);
                }
            
                const oCreateDialogForInterval = this.oCreateNewVacationDialog.getModel("mCreateNewVacationDialog") || new JSONModel();
                oCreateDialogForInterval.setData(oCreateDialogForIntervalData);
                this.oCreateNewVacationDialog.setModel(oCreateDialogForInterval, "mCreateNewVacationDialog");
                this.oCreateNewVacationDialog.open();
            } else {
                MessageBox.error(this.oBundle.getText("ERROR_CREATE_VACATION"));
            }


            
        },
        
        onOpenEmployeeVacationDialog: function() {
            const sRole = this.mPersonal.getProperty('/role');
            const mEmployeeVacationDialog = new JSONModel({
                enabledButtons: false
            });

            this.oEmployeeVacationDialog = sap.ui.xmlfragment("ssg.lk.zintvacations.fragment.EmployeeVacationDialog", this);
            this.getView().addDependent(this.oEmployeeVacationDialog);
            this.oEmployeeVacationDialog.setModel(mEmployeeVacationDialog, "mEmployeeVacationDialog");

            this.oEmployeeVacationDialog.open();
            // this.oEmployeeVacationDialog.setBusy(true);

            let sPernr;
            if (sRole === 'HR') {
                sPernr = this.getPernrForHR();
            }
            
            this.getVacationRequests(sPernr, true)
                .then(() => {
                    this.oEmployeeVacationDialog.setBusy(false);
                });
        },

        onCloseEmployeeVacationDialog: function () {
            const sRole = this.mPersonal.getProperty('/role');
            this.oEmployeeVacationDialog.close();
            this.oEmployeeVacationDialog.destroy();
            delete this.oEmployeeVacationDialog;

            if (sRole === 'HR') {
                this.getVacationRequests();
            }
        },

        onOpenApproveVacationDialog: function() {
            const mApproveVacationDialog = new JSONModel({
                enabledApproveReject: false,
                enabledOpen: false,
                selectedKey: 'approve'
            });

            this.oApproveVacationDialog = sap.ui.xmlfragment("ssg.lk.zintvacations.fragment.ApproveVacationDialog", this);
            this.getView().addDependent(this.oApproveVacationDialog);
            this.oApproveVacationDialog.setModel(mApproveVacationDialog, "mApproveVacationDialog");
            
            this.oApproveVacationDialog.open();
            // this.oApproveVacationDialog.setBusy(true);

            // this.getVacationRequests()
            //     .then(() => {
            //         this.oApproveVacationDialog.setBusy(false);
            //     });
        },

        onSearchVacationDialog: function(oEvent) {
            const sValue = oEvent.getParameter("newValue").toLowerCase();
            const sSelectedKey = this.oApproveVacationDialog.getModel('mApproveVacationDialog').getProperty('/selectedKey');
                
            const oTable = sSelectedKey === 'approve' ? 
                sap.ui.getCore().byId("idApproveTable") : 
                sap.ui.getCore().byId("idTableHRRequests");
            const oBinding = oTable.getBinding("rows");
            const aFilters = [];
            
            if (sValue) {
                const oFilterPernr = new sap.ui.model.Filter("pernr", 'Contains', sValue);
                const oFilterFullname = new sap.ui.model.Filter("fullname", 'Contains', sValue);
                
                aFilters.push(new sap.ui.model.Filter([oFilterPernr, oFilterFullname], false));
            }
            
            oBinding.filter(aFilters);
        },

        onSelectApproveVacationRow: function (oEvent) {
            const oSource = oEvent.getSource();
            const aSelectedIndices = oSource.getSelectedIndices();
            const oModel = this.oApproveVacationDialog.getModel('mApproveVacationDialog');

            const oData = oModel.getData();

            if (oData.selectedKey === 'approve') {
                oModel.setProperty('/enabledApproveReject', aSelectedIndices.length > 0);
            } else {
                oModel.setProperty('/enabledOpen', aSelectedIndices.length > 0);
            }
        },

        onCloseApproveVacationDialog: function () {
            this.oApproveVacationDialog.close();
            this.oApproveVacationDialog.destroy();
            delete this.oApproveVacationDialog;
        },     

        onCloseVacationDialog: function () {
            this.oMessageTableDialog.close();
            this.oMessageTableDialog.destroy();
            delete this.oMessageTableDialog;
        },

        expandVacations: function(oEvent){
            const oSource = oEvent.getSource();
            const oSelected = oSource.getProperty('selected');
            const oTableTree = this.byId('treeTableMobile');

            if (oSelected) {
                oTableTree.expandToLevel(1);
            } else {
                oTableTree.collapseAll();
                this.collapseFilters();
            }
            
        },

        displayedWithVacations: function(oEvent) {
            const oSource = oEvent.getSource();
            const oSelected = oSource.getProperty('selected');
            
            // if (oSelected) {
            //     this.getEmployees(true);
            // } else {
            //     this.getEmployees();
            // }
        },
        
        onOpenVacationDialog: function (oEvent) {
            const oAppointment = oEvent.getParameter('appointment');
            let oContext = oAppointment ? 
                oAppointment.getBindingContext("mCalendar") : oEvent.getParameter('rowBindingContext'); 
            const oObject = oContext.getObject();

            if (oObject.vacSet) return;

            const sPath = oContext.getPath();
            const sMainPath = sPath.split('vacSet')[0];
            const sMainObject = this.mCalendar.getProperty(sMainPath);
            const mMessageTableDialog = new JSONModel({
                ...oObject,
                fullname: sMainObject.fullname,
                pernr: sMainObject.pernr
            });

            this.oMessageTableDialog = sap.ui.xmlfragment("ssg.lk.zintvacations.fragment.MessageTableDialog", this);
            this.getView().addDependent(this.oMessageTableDialog);
            
            this.oMessageTableDialog.setModel(mMessageTableDialog, "mMessageTableDialog");
            this.oMessageTableDialog.open();
        },

        onOpenEmployeeInformationDialog: function (oEvent) {           
            const oRow = oEvent.getParameter('row');
            const oContext = oRow.getBindingContext("mCalendar");
            const oObject = oContext.getObject();
            const sPath = oContext.getPath();
            const mEmployeeInformationDialog = new JSONModel({
                ...oObject
            });
            

            this.oEmployeeInformationDialog = sap.ui.xmlfragment("ssg.lk.zintvacations.fragment.EmployeeInformationDialog", this);
            this.getView().addDependent(this.oEmployeeInformationDialog);
            this.oEmployeeInformationDialog.setModel(mEmployeeInformationDialog, "mEmployeeInformationDialog");
            this.oEmployeeInformationDialog.open();
        },

        onCloseEmployeeInformationDialog: function () {
            this.oEmployeeInformationDialog.close();
            this.oEmployeeInformationDialog.destroy();
            delete this.oEmployeeInformationDialog;
        },
        
        onOpenCreateVacationDialog: function () {
            const oPlanningCalendar = this.getView().byId("PlanningCalendar");
            const oSelectedRow = oPlanningCalendar.getSelectedRows()[0];
            const aRows = this.mCalendar.getProperty('/rows');
            const oPersonal = this.mPersonal.getData();
            const todayDate = new Date();
            todayDate.setDate(todayDate.getDate());
            let oModelData;
        
                if (oSelectedRow) {
                    const oSelectedEmployee = oSelectedRow.getBindingContext('mCalendar').getObject();
                    oModelData = {
                        pernr: oSelectedEmployee.pernr,
                        fullname: oSelectedEmployee.fullname,
                        daysOfVacLeft: oSelectedEmployee.daysOfVacLeft,
                        generalCountDays: 0,
                        daysok: true,
                        isChangeEmployeeVis: false,
                        tab: 'createVacation',
                        enabledSave: false,
                        todayDate: todayDate
                    };
                } else if (oPersonal.role !== 'HR') {
                    const oFindedEmployee = aRows.find(oObj => oObj.pernr === oPersonal.pernr);
                    oModelData = {
                        pernr: oFindedEmployee ? oFindedEmployee.pernr : '',
                        fullname: oFindedEmployee ? oFindedEmployee.fullname : '',
                        daysOfVacLeft: oFindedEmployee ? oFindedEmployee.daysOfVacLeft : 0,
                        generalCountDays: 0,
                        daysok: true,
                        isChangeEmployeeVis: false,
                        tab: 'createVacation',
                        enabledSave: false,
                        todayDate: todayDate
                    };
                } else {
                    oModelData = {
                        pernr: '',
                        fullname: '',
                        daysOfVacLeft: 0,
                        generalCountDays: 0,
                        daysok: true,
                        isChangeEmployeeVis: true,
                        tab: 'createVacation',
                        enabledSave: false,
                        todayDate: todayDate
                    };
                }
        
            if (!this.oCreateNewVacationDialog) {
                this.oCreateNewVacationDialog = sap.ui.xmlfragment("ssg.lk.zintvacations.fragment.CreateNewVacationDialog", this);
                this.getView().addDependent(this.oCreateNewVacationDialog);
            }
        
            const mCreateNewVacationDialog = new JSONModel(oModelData);
            this.oCreateNewVacationDialog.setModel(mCreateNewVacationDialog, "mCreateNewVacationDialog");
            this.oCreateNewVacationDialog.open();
        },

        onCheckNewVacation: function () {
            const oModel = this.oCreateNewVacationDialog.getModel('mCreateNewVacationDialog');
            const oData = oModel.getData();
            let bDaysOk = true, bChangedType = Boolean(oData.type);

            if (oData.type === 'Type01' && oData.startDate && oData.endDate) {
                const oTimeDiff = oData.endDate.getTime() - oData.startDate.getTime();
                const iDaysDiff = Math.ceil(oTimeDiff / (1000 * 3600 * 24));
                const iGeneralCountDays = Number(oData.daysOfVacLeft) - iDaysDiff;
                bDaysOk = iGeneralCountDays > 0;

                oModel.setProperty('/generalCountDays', iGeneralCountDays);
                oModel.setProperty('/daysok', bDaysOk);
            }

            oModel.setProperty('/enabledSave', bChangedType && bDaysOk);
        },

        onChangeEmployeeForNewVacation: function (oEvent) {
            const oModel = this.oCreateNewVacationDialog.getModel('mCreateNewVacationDialog');
            const oSelectedItem = oEvent.getParameter('selectedItem');
            const oContext = oSelectedItem.getBindingContext('mCalendar');
            const oObject = oContext.getObject();

            oModel.setProperty('/daysOfVacLeft', oObject.daysOfVacLeft);
            oModel.setProperty('/fullname', oObject.fullname);
        },
        
        onOpenCommentDialog: function (oEvent, sAction) {
            const oSource = oEvent.getSource();

            if (this.oCommentTableDialog) {
                this.onCloseCommentDialog();
            };

            const mCommentTableDialog = new JSONModel({
                action: sAction,
                comment: '',
                btnEnabled: false
            });

            this.oCommentTableDialog = sap.ui.xmlfragment("ssg.lk.zintvacations.fragment.CommentTableDialog", this);
            this.getView().addDependent(this.oCommentTableDialog);
            this.oCommentTableDialog.setModel(mCommentTableDialog, "mCommentTableDialog");
            this.oCommentTableDialog.openBy(oSource);
        },

        onLiveChangeComment: function (oEvent) {
            const sValue = oEvent.getParameter('value');
            this.oCommentTableDialog.getModel('mCommentTableDialog').setProperty('/btnEnabled', sValue.length > 4);
        },

        onApproveRejectRequest: function (oEvent, sAction) {
            const oApproveTable = sap.ui.getCore().byId('idApproveTable');
            const iSelectedIndex = oApproveTable.getSelectedIndex();
            const oContext = oApproveTable.getContextByIndex(iSelectedIndex);
            const oObject = oContext.getObject();
            const sComment = this.oCommentTableDialog.getModel('mCommentTableDialog').getProperty('/comment');

            const oUpdateRequest = {
                pernr: oObject.pernr,
                id: oObject.id,
                startDate: oObject.startDate,
                endDate: oObject.endDate,
                leaveType: oObject.leaveType,
                statusID: sAction === 'approve' ? '03' : '02',
                comments: sComment,
                sicklist: oObject.sicklist,
            };

            // this.oApproveVacationDialog.setBusy(true);
            // this.mZintVacationsSrv.create("/requestSet", oUpdateRequest, {
                // success: () => {
                //     this.getEmployees()
                //         .then(() => {
                //             if (sAction === 'approve') {
                //                 MessageBox.success(this.oBundle.getText("SUCCESS_VACATION"));
                //             } else {
                //                 MessageBox.success(this.oBundle.getText("SUCCESS_REJECT_VACATION"));
                //             }

                //             this.getVacationRequests()
                //                 .then(() => {
                //                     this.oApproveVacationDialog.setBusy(false);
                //                 });
                //         });
                // },
                // error: oError => {
                //     if (oError.responseText.includes("0007")) {
                //         MessageBox.error(this.oBundle.getText("ERROR_INFOTYPE_0007"));
                //     } else if (oError.responseText.includes("0100")) {
                //         MessageBox.error(this.oBundle.getText("ERROR_0100"));
                //     } else {
                //         this.openMessage(oError.responseText[0] !== "<" ? JSON.parse(oError.responseText) : oError.responseText);
                //     }
                //     this.oApproveVacationDialog.setBusy(false);
                // }

                if (sAction === 'approve') {
                    MessageBox.success(this.oBundle.getText("SUCCESS_VACATION"));
                } else {
                    MessageBox.success(this.oBundle.getText("SUCCESS_REJECT_VACATION"));
                }
            // });
        },

        onCloseCommentDialog: function () {
            this.oCommentTableDialog.close();
            this.oCommentTableDialog.destroy();
            delete this.oCommentTableDialog;
        },

        onCloseNewVacationDialog: function () {
            this.oCreateNewVacationDialog.close();
            this.oCreateNewVacationDialog.destroy();
            delete this.oCreateNewVacationDialog;
        },

        onDocTypeChange: function(oEvent) {
            const iSelectIndex = oEvent.getParameter("selectedIndex");
            const oRadioButtonGroup = oEvent.getSource();

            const oSelectedButton = oRadioButtonGroup.getButtons()[iSelectIndex];
            const aSelectedType = oSelectedButton.getText();

            let sDocType;

            switch (aSelectedType) {
                case "Заявление на отпуск":
                    sDocType = "VACASTA";
                    break;
                case "Приказ на отпуск":
                    sDocType = "VACAORD";
                    break;
                default:
                    sDocType = "VACADIFF"; 
            }

            this.oUploadOrderDialog.getModel("mUploadOrderDialog").setProperty("/docType", sDocType);
        },

        onBeforeUploadOrderFile: function (oEvent) {
            const oSource = oEvent.getSource();
            const oItem = oEvent.getParameter('item');
            const oData = this.oUploadOrderDialog.getModel('mUploadOrderDialog').getData();
            const oSlug = {
                ID: oData.id.toString(),
                pernr: oData.pernr,
                slug: oItem.getProperty("fileName"),
                doctype: oData.docType
            };

            this.sPernr = oData.pernr;

            const aDocs = oData.docsSet.results;

            if (aDocs.length === 0) {
                const oSlugHeaderParameter = new sap.ui.core.Item({
                    key: "slug",
                    text: encodeURIComponent(JSON.stringify(oSlug))
                });
                oSource.addHeaderField(oSlugHeaderParameter);
                return;
            }

            const isDocTypeExists = aDocs.some(
                (oDoc => oDoc.doctype === "Заявление на отпуск" || oDoc.doctype === "Приказ на отпуск")
            );

            if (isDocTypeExists && oData.docType !== "VACADIFF") {
                this.oUploadOrderDialog.close();
                MessageBox.error("Подписанный документ уже присутствует!");
                return;
            }

            if (isDocTypeExists) {
                const oSlugHeaderParameter = new sap.ui.core.Item({
                    key: "slug",
                    text: encodeURIComponent(JSON.stringify(oSlug))
                });
                oSource.addHeaderField(oSlugHeaderParameter);
            } else {
                MessageBox.error("Не добавлен основной документ!");
            }
        },

        onAfterAddedOrderFile: function(){
            const oUploadSet = sap.ui.getCore().byId('idUploadOrder');
            const aIncompleteItems = oUploadSet.getIncompleteItems();
            oUploadSet.upload(aIncompleteItems[0]);

            this.oUploadOrderDialog.setBusy(true);
        },

        onBeforeAddedOrderFile: function(oEvent){
            const oSource = oEvent.getSource();
            const oTokenHeaderParameter = new sap.ui.core.Item({
                key: "x-csrf-token",
                text: this.getView().getModel().getSecurityToken(),
            })
            
            oSource.addHeaderField(oTokenHeaderParameter);
        },

        onFileTypesmathOrderFile: function(){
            const oUploadSet = sap.ui.getCore().byId('idUploadOrder');
            const aIncompleteItems = oUploadSet.getIncompleteItems();
            oUploadSet.removeIncompleteItem(aIncompleteItems[0]);
            MessageBox.error(this.oBundle.getText('UPLOAD_ORDER_FILE_TYPE_MISMATCH'));
            this.oUploadOrderDialog.setBusy(false)
        },

        onUploadCompleteOrderFile: function() {
            this.IdBtn = 'SEND';

            this.getVacationRequests(this.sPernr, true)
                .then(() => {
                    delete this.sPernr;
                    this.onCloseUploadOrderDialog();
                });
        },

        onCloseUploadOrderDialog: function() {
            this.oUploadOrderDialog.close();
            this.oUploadOrderDialog.destroy();
            delete this.oUploadOrderDialog;
        },

        onIconTabSelect: function(oEvent){
            const sSelectedKey = oEvent.getParameter("selectedKey");
            this.mActiveFilterModel.setProperty("/activeFilter", sSelectedKey);
        },


        onAddVacation: function () {
            const oModel = this.oCreateNewVacationDialog.getModel("mCreateNewVacationDialog");
            const oVacationData = oModel.getData();

            const oEmployee = this.mPersonal.getData();

            const startDate = new Date(oVacationData.startDate);
            const endDate = new Date(oVacationData.endDate);
            const oCreateDate = new Date(); 

            startDate.setHours(12, 0, 0);
            endDate.setHours(12, 0, 0);                              
            oCreateDate.setHours(12, 0, 0);

            const oNewVacation = {
                pernr: oEmployee.role !== 'HR' ? oEmployee.pernr : oVacationData.pernr,
                startDate: startDate,
                endDate: endDate,
                leaveType: oVacationData.type,
                statusID: oVacationData.statusID,
                createDate: oCreateDate
            };

            if (!oVacationData.type) {
                MessageBox.error(this.oBundle.getText("ERROR_VACATION_TYPE"));
                return;
            }

            if (!oVacationData.startDate || !oVacationData.endDate) {
                MessageBox.error(this.oBundle.getText("ERROR_DATE_SELECT"));
                return;
            }
        
            this.oBusyDialog.open();
            this.mZintVacationsSrv.create('/requestSet', oNewVacation, {
                success: (oData) => {
                    this.mCalendar.refresh(true);

                    this.onCloseNewVacationDialog();
                    this.oBusyDialog.close();
                    oEmployee.role === 'HR' ? 
                        MessageBox.success(this.oBundle.getText("SUCCESS_VACATION_CREATE_HR")) : 
                        MessageBox.success(this.oBundle.getText("SUCCESS_VACATION_CREATE_EMPLOYEE"));
                },
                error: (oError) => {
                    if (oError.responseText.includes("0007")) {
                        MessageBox.error(this.oBundle.getText("ERROR_INFOTYPE_0007"));
                    } else if (oError.responseText.includes("0100")) {
                        MessageBox.error(this.oBundle.getText("ERROR_0100"));
                    } else {
                        this.openMessage(oError.responseText[0] !== "<" ? JSON.parse(oError.responseText) : oError.responseText);
                    }
                    this.oBusyDialog.close();
                }
            });
        },

        onEditVacation: function () {
            const oVacationDataUpdate = this.oMessageTableDialog.getModel("mMessageTableDialog").getData();
            const oStartDate = new Date(oVacationDataUpdate.startDate);
            const oEndDate = new Date(oVacationDataUpdate.endDate);
            const oStartDateNew = new Date(oVacationDataUpdate.startDateNew);
            const oEndDateNew = new Date(oVacationDataUpdate.endDateNew);

            oStartDate.setHours(12, 0, 0);
            oStartDateNew.setHours(12, 0, 0);

            oEndDate.setHours(12, 0, 0);
            oEndDateNew.setHours(24, 0, 0);
            
            const oUpdatedVacation = {
                pernr: oVacationDataUpdate.pernr,
                startDate: oStartDate, 
                endDate: oEndDate,
                startDateNew: oStartDateNew,
                endDateNew: oEndDateNew,
                leaveType: oVacationDataUpdate.leaveType,
            };

            if(!oVacationDataUpdate.startDateNew || !oVacationDataUpdate.endDateNew){
                MessageBox.error(this.oBundle.getText("ERROR_DATE_SELECT"));
                return;
            }      
  
            this.oBusyDialog.open();          
            
            this.mZintVacationsSrv.create("/requestSet", oUpdatedVacation, {
              success: (oData) => {
                const oCalendar= this.getView().getModel("mCalendar");
                oCalendar.refresh(true);
                this.oBusyDialog.close();
                MessageBox.success(this.oBundle.getText("SUCCESS_EDIT_VACATION"));

                this.onCloseVacationDialog();
              },
              error: (oError) => {
                this.openMessage(oError.responseText[0] !== "<" ? JSON.parse(oError.responseText) : oError.responseText);
                this.oBusyDialog.close();
              }
            });
        }, 

        onSelectionDeleteChange: function(oEvent) {
            const oSelectedItem = oEvent.getSource();
            const oContext = oSelectedItem.getBindingContext("mMain");
            const oRequestSelected = oContext.getObject();
            const sPath = oContext.getPath();
            const aRequests = this.mMain.getProperty("/requests");
            const oButton = sap.ui.getCore().byId("DeleteButton");

            aRequests.results.forEach(oRequest => {
                oRequest.isSelected = false;
            });

            oRequestSelected.isSelected = true;
            this.mMain.setProperty(sPath + "/isSelected", true);
            this.mMain.setProperty('/selected', oRequestSelected);

            oButton.setEnabled(oRequestSelected.statusID === '01');
        },

        onDeleteVacation: function () {
            const oSelectedRequest = this.mMain.getProperty('/selected');

            if (!oSelectedRequest) {
                MessageBox.error(this.oBundle.getText("ERROR_SELECTION"));
                return;
            }

            if (oSelectedRequest.statusID === "01") {
                const oUpdateRequest = {
                    id: oSelectedRequest.id,
                    statusID: oSelectedRequest.statusID
                };
            
                this.oBusyDialog.open();
                this.mZintVacationsSrv.create("/requestSet", oUpdateRequest, {
                    success: () => {
                        this.getVacationRequests()
                            .then(() => {
                                this.mMain.setProperty('/selected', null);
                                MessageBox.success(this.oBundle.getText("SUCCESS_DELETE_APPLICATION_VACATION"));
                                this.oBusyDialog.close();
                            })
                    },
                    error: oError =>{
                        this.openMessage(oError.responseText[0] !== "<" ? JSON.parse(oError.responseText) : oError.responseText);
                        this.oBusyDialog.close();
                    }
                });
            } else {
                MessageBox.error(this.oBundle.getText("ERROR_SELECTION"));
                this.oBusyDialog.close();
            }
        },

        onSelectionChange: function(oEvent) {
            const oSelectedItem = oEvent.getSource();
            const oContext = oSelectedItem.getBindingContext("mMain");
            const oRequest = oContext.getObject();
            const sPath = oContext.getPath();
            const aRequests = this.mMain.getProperty("/requests");

            aRequests.forEach(oRequest => {
                oRequest.isSelected = false;
            });
            oRequest.isSelected = true;
            this.mMain.setProperty(sPath + "/isSelected", true);
    
            this._oSelectedRequest = oRequest;
        },
        
        collapseFilters: function(){
            const expandVac = this.byId('checkExpandVac');
            const oTableTree = this.byId('treeTableMobile');
            
            oTableTree.bindRows({
                    path: 'mCalendar>/rows',
                    templateShareable: false,
                    parameters: {
                        arrayNames: ['vacSet'],
                        numberOfExpandedLevels: 0
                    }
                });

            expandVac.setProperty("selected", false);
        },

        vacationsFilters: function(){
            const dispWithVac = this.byId('checkDispWithVac');
            dispWithVac.setProperty("selected", false);
        },

        applyFilters: function(){
            // this.getEmployees();
        },

        onSuggestionItemSelected: function(oEvent) {
            const oSelectedItem = oEvent.getParameter("selectedItem");
            const oEmployee = oSelectedItem.getBindingContext().getObject();

            const aSelectedPernrs = this.mFilters.getProperty("/filtersPernr") || [];
            if (!aSelectedPernrs.some(oPernr => oPernr.pernr === oEmployee.pernr)) {
                aSelectedPernrs.push({
                    pernr: oEmployee.pernr,
                    fullname: oEmployee.fullname
                });
                this.mFilters.setProperty("/filtersPernr", aSelectedPernrs);
            }
            this.applyFilters();
            
        },

        onTokenUpdate: function(oEvent) {
            const sType = oEvent.getParameter("type");
            if (sType === "removed") {
                const aRemovedTokens = oEvent.getParameter("removedTokens");

                const aRemoveSelect = [...this.mFilters.getProperty("/filtersPernr")];
                const aUpdateFilters = aRemoveSelect.filter(oItem =>{
                    return !aRemovedTokens.some(oToken => {
                        const oContext = oToken.getBindingContext("mFilters");
                        return oContext && oContext.getObject().pernr === oItem.pernr;
                    })
                })

                this.mFilters.setProperty("/filtersPernr", aUpdateFilters);   
                this.applyFilters();      
            }
        },

        onDepartmentItemSelected: function () {
            this.applyFilters();
        },

        onDefaultCalendarSettings: function () {
            const oCalendarSettings = this.getView().getModel("mCalendarSettings");
            oCalendarSettings.setProperty("/viewKey", 'M');
            oCalendarSettings.setProperty("/intervalDate", 30);

        },

        onDateTimeSelected: function () {    
            const oFilters = this.getView().getModel("mFilters");
            const oCalendarSettings = this.getView().getModel("mCalendarSettings");
            const oStartDate = oFilters.getProperty("/startDate");
            const oEndDate = oFilters.getProperty("/endDate");

            const iCountDays = Math.ceil((oEndDate - oStartDate) / (1000 * 60 * 60 * 24));
            const iYear = oStartDate.getFullYear();
            const iMonth = oStartDate.getMonth();
            const iDaysInMonth = new Date(iYear, iMonth + 1, 0).getDate();

            let iMonthDiff = (oEndDate.getFullYear() - oStartDate.getFullYear()) * 12 + 1;
            iMonthDiff += oEndDate.getMonth() - oStartDate.getMonth();

            if (oEndDate.getDate() < oStartDate.getDate()) {
                iMonthDiff -= 1;
            }

            const bIsShortRange = iCountDays <= iDaysInMonth;

            oCalendarSettings.setProperty("/viewKey", bIsShortRange ? 'M' : 'Y');
            oCalendarSettings.setProperty("/startDate", oStartDate);
            oCalendarSettings.setProperty("/intervalDate", bIsShortRange ? iCountDays : Math.max(1, iMonthDiff));

            this.applyFilters();
        },

        onDownloadEmptyDocument: function (oEvent) {
            const oSource = oEvent.getSource();
            const oContext = oSource.getBindingContext("mMain");
            const oFile = oContext.getObject();
            const sRequestId = oFile.id;
            const sPernr = oFile.pernr;

            const sKey = this.mZintVacationsSrv.createKey("/FileSet", {                    
                requestid: sRequestId.toString(),
                pernr: sPernr,
                docId: "",
                docStatus: "00"
            });

            window.open(
                "/sap/opu/odata/sap/ZINT_VACATIONS_SRV" + sKey + "/$value",
                "_blank"
            );                   
        },

        onDownloadSignedDocument: function (oEvent) {
            const oSource = oEvent.getSource();
            const oContext = oSource.getBindingContext('mMain');
            
            const oFile = oContext.getObject();
            const sRequestId = oFile.requestId;
            const sPernr = oFile.pernr;
            const sDocId = oFile.docid;        
            
            const sKey = this.mZintVacationsSrv.createKey("/FileSet", {
                requestid: sRequestId, 
                pernr: sPernr,
                docId: sDocId,
                docStatus: "01"
            });

            window.open(
                "/sap/opu/odata/sap/ZINT_VACATIONS_SRV" + sKey + "/$value",
                "_blank"
            );
        },

        onDeleteVacationDocDocuments: function(oEvent) {
            const oSource = oEvent.getSource();
            const oContext = oSource.getBindingContext("mMain");

            const oFile = oContext.getObject();
            const sDocId = oFile.docid;
            const sPernr = oFile.pernr;
            const sRequestId = oFile.requestId;
            const sDoctype = oFile.doctype;


            MessageBox.confirm(this.oBundle.getText('APPROVAL_VACATION_DOCS_DELETE_CONFIRM', [sDoctype]), {
                onClose: (sAction) => {
                    if (sAction === MessageBox.Action.OK) {
                        this.proceedWithDeletion(sDocId, sPernr, sRequestId);
                    }
                }
            });
        },

        proceedWithDeletion: function(sDocId, sPernr, sRequestId) {
            const sKey = this.mZintVacationsSrv.createKey("/docsSet", {
                docid: sDocId,
                pernr: sPernr,
                requestId: sRequestId
            });
        
            this.oBusyDialog.open();
            this.mZintVacationsSrv.remove(sKey, {
                success: oData => {
                    this.getVacationRequests()
                        .then(() => {
                            this.oBusyDialog.close();
                        });
                },
                error: (oError) => {
                    MessageBox.error(this.oBundle.getText("ERROR_APPROVE_VACATION") + oError.responseText);
                }
            });
        },

        onClearFilters: function(){
            this.mFilters.setProperty("/filtersPernr", []);
            this.mFilters.setProperty("/departments", []);
            this.mFilters.setProperty("/startDate", null);
            this.mFilters.setProperty("/endDate", null);
            
            this.onDefaultCalendarSettings();
            this.collapseFilters();
            this.vacationsFilters();
            this.applyFilters();
        }
	}));
});