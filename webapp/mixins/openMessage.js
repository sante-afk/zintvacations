//скрипт отвечает за обработку ответа в запросах, производит вывод сообщений
sap.ui.define(
    [ 'sap/m/MessageBox' ],
    function (MessageBox) {
        "use strict";

        return {
            /**
             * Выполняет обработку ответа на запрос и формирование всплывающего сообщения соответствующего типа при необходимости
             * @param {Object} oResp Объект или строка внутри которого лежит объект сообщения
             * @param {boolean} isShow Флаг, который говорит выводить ли сообщение в сплывающем окне
             * @param {boolean} isTable Флаг, который говорит необходимо ли выводить несколько сообщений в одном всплывающем окне или в нескольких последовательно
             * @returns {string} Возвращает тип сообщения, если сообщений несколько и среди них есть хотя бы одна ошибка, то вернётся "E"
             */
            openMessage: function (oResp, isShow, isTable) {
                let sMessageType = "S";

                if (oResp) {
                    if (typeof oResp == "string") {
                        sMessageType = this.openMessageForString(oResp);
                    } else {
                        sMessageType = this.openMessageForAny(oResp, isShow, isTable, sMessageType);
                    }
                }

                return sMessageType;
            },

            /**
             * Выполняет обработку ответа если он пришёл в строком типе, по сути это будет происходить льков в случе возврата ошибки
             * @param {Object} oResp Объект или строка внутри которого лежит объект сообщения
             * @returns {string} Возвращает тип сообщения, если сообщений несколько и среди них есть хотя бы одна ошибка, то вернётся "E"
             */
            openMessageForString: function (oResp) {
                if (oResp.split('<message').length > 1) {
                    oResp = oResp.split('<message')[1].split('>')[1].split('</')[0];
                } else {
                    oResp = oResp.split('<h1')[1].split('>')[1].split('</')[0];
                }

                if (oResp) {
                    MessageBox.error(oResp);
                }

                return 'E';
            },

            /**
             * Выполняет обработку ответа если он пришёл в неопределённом типе
             * @param {Object} oResp Объект или строка внутри которого лежит объект сообщения
             * @param {boolean} isShow Флаг, который говорит выводить ли сообщение в сплывающем окне
             * @param {boolean} isTable Флаг, который говорит необходимо ли выводить несколько сообщений в одном всплывающем окне или в нескольких последовательно
             * @param {string} sMessageType Тип сообщения
             * @returns {string} Возвращает тип сообщения, если сообщений несколько и среди них есть хотя бы одна ошибка, то вернётся "E"
             */
            openMessageForAny: function (oResp, isShow, isTable, sMessageType) {
                const aMessage = [];

                if (oResp.data && !oResp.headers['sap-message']) {
                    if (oResp.data.__batchResponses) {
                        sMessageType = this.getMessageBatchResponses(oResp.data.__batchResponses, sMessageType, aMessage, isShow, isTable);
                    }
                } else if (oResp.headers) {
                    const hdrMessage = oResp.headers["sap-message"];

                    if (hdrMessage) {
                        sMessageType = this.getSuccessMessage(hdrMessage, sMessageType, aMessage, isShow, isTable);
                    }
                } else if (oResp.error) {
                    sMessageType = "E";

                    if (oResp.error.innererror.errordetails) {

                        oResp.error.innererror.errordetails.forEach(function(oMes) {
                            aMessage.push(this.getMessage(oMes, isShow, sMessageType));
                        }.bind(this));

                        sMessageType = this.showMessageDialog(aMessage, isTable, sMessageType);
                    } else if (oResp.error.message.value) {
                        if (isShow !== false) {
                            MessageBox.error(oResp.error.message.value);
                        }
                    }
                }

                return sMessageType;
            },

            /**
             * Выполняет получение сообщений из пакетного запроса, которое отправлено с помощью submitChange
             * @param {Object} oResp Объект или строка внутри которого лежит объект сообщения
             * @param {string} sMessageType Тип сообщения
             * @param {Array} aMessage Массив сообщений
             * @param {boolean} isShow Флаг, который говорит выводить ли сообщение в сплывающем окне
             * @param {boolean} isTable Флаг, который говорит необходимо ли выводить несколько сообщений в одном всплывающем окне или в нескольких последовательно
             * @returns {string} Возвращает тип сообщения, если сообщений несколько и среди них есть хотя бы одна ошибка, то вернётся "E"
             */
            getMessageBatchResponses: function(oResp, sMessageType, aMessage, isShow, isTable) {
                let hdrMessage;
                
                if (oResp[0].response) {
                    if (oResp[0].response.body) {
                        hdrMessage = oResp[0].response.body;
                    }
                } else if (oResp[0].__changeResponses.length > 0) {
                    if (oResp[0].__changeResponses[0].headers) {
                        hdrMessage = oResp[0].__changeResponses[0].headers["sap-message"];
                    }
                } else if (oResp[0].headers) {
                    if (oResp[0].headers['sap-message']) {
                        hdrMessage = oResp[0].headers['sap-message'];
                    }
                }

                if (hdrMessage) {
                    sMessageType = this.getSuccessMessage(hdrMessage, sMessageType, aMessage, isShow, isTable);
                }

                return sMessageType;
            },

            /**
             * Получаем список сообщений из hdrMessage для вывода
             * @param {string} hdrMessage JSON строка с сообщением
             * @param {string} sMessageType Тип сообщения
             * @param {Array} aMessage Массив сообщений
             * @param {boolean} isShow Флаг, который говорит выводить ли сообщение в сплывающем окне
             * @param {boolean} isTable Флаг, который говорит необходимо ли выводить несколько сообщений в одном всплывающем окне или в нескольких последовательно
             * @returns {string} Возвращает тип сообщения, если сообщений несколько и среди них есть хотя бы одна ошибка, то вернётся "E"
             */
            getSuccessMessage: function(hdrMessage, sMessageType, aMessage, isShow, isTable) {
                if (!hdrMessage) return sMessageType;

                const oMessage = JSON.parse(hdrMessage);
                if (oMessage.message) {    
                    if (oMessage.details) {
                        if (oMessage.details.length > 0) {
                            oMessage.details.forEach(function (oMes) {
                                aMessage.push(this.getMessage(oMes, isShow));
                            }.bind(this));
                        }
                    }
    
                    aMessage.push(this.getMessage(oMessage, isShow, sMessageType));
    
                    sMessageType = this.showMessageDialog(aMessage, isTable, sMessageType);
                } else if (oMessage.error) {
                    sMessageType = "E";

                    if (oMessage.error.innererror.errordetails) {

                        oMessage.error.innererror.errordetails.forEach(function(oMes) {
                            aMessage.push(this.getMessage(oMes, isShow, sMessageType));
                        }.bind(this));

                        sMessageType = this.showMessageDialog(aMessage, isTable, sMessageType);
                    } else if (oMessage.error.message.value) {
                        if (isShow !== false) {
                            MessageBox.error(oMessage.error.message.value);
                        }
                    }
                }

                return sMessageType;
            },

            /**
             * Выполняет получение сообщения
             * @param {Object} oMessage Объект сообщения
             * @param {boolean} isShow Флаг, который говорит выводить ли сообщение в сплывающем окне
             * @returns {string} Возвращает объект сообщения для локальной модели
             */
            getMessage: function (oMessage, isShow) {
                const lErrorText = oMessage.message;
                const hdrMessageObject = lErrorText;

                const sNewMessageType = oMessage.severity.charAt(0).toUpperCase();

                if (hdrMessageObject) {
                    if (isShow !== false) {
                        this.showMessage(sNewMessageType, hdrMessageObject);
                    }
                }

                return {
                    messageType: sNewMessageType,
                    message: hdrMessageObject
                };
            },

            /**
             * Производит открытие диалог окна с сообщениями, если сообщений больше 1
             * @param {Array} aMessage Массив сообщений
             * @param {boolean} isTable Флаг, который говорит необходимо ли выводить несколько сообщений в одном всплывающем окне или в нескольких последовательно
             * @param {string} sMessageType Тип сообщения
             * @returns {string} Возвращает тип сообщения, если сообщений несколько и среди них есть хотя бы одна ошибка, то вернётся "E"
             */
            showMessageDialog: function(aMessage, isTable, sMessageType) {
                if (isTable) {
                    if (aMessage.length > 1) {
                        if (!this.messageDialog) {
                            this.messageDialog = sap.ui.xmlfragment("ssg.lk.zintvacations.fragment.MessageTableDialog", this);
                            this.getView().addDependent(this.messageDialog);
                        }

                        const oMessageModel = new sap.ui.model.json.JSONModel(aMessage);

                        this.messageDialog.setModel(oMessageModel, "mMassages");

                        this.messageDialog.open();

                        const aMessageTypes = [];

                        aMessage.forEach(function(sType) {
                            aMessageTypes.push(sType);
                        });

                        sMessageType = aMessageTypes;
                    } else if (aMessage.length > 0) {
                        this.showMessage(aMessage[0].messageType, aMessage[0].message);

                        sMessageType = aMessage[0].messageType;
                    }
                }

                return sMessageType;
            },

            /**
             * Производит вывод одного сообщения
             * @param {string} sMessageType Тип сообщения
             * @param {string} sMessage Строка сообщения
             */
            showMessage: function (sMessageType, sMessage) {
                switch (sMessageType) {
                    case "S":
                        sap.m.MessageToast.show(sMessage, {
                            duration: 20000,
                            animationDuration: 6000
                        });
                        break;
                    case "W":
                        if(this.isCheck) {
                            MessageBox.warning(sMessage, {
                                icon: MessageBox.Icon.WARNING,
                                actions: [this.oBundle.getText('comfirm'), MessageBox.Action.CANCEL],
                                emphasizedAction: this.oBundle.getText('comfirm'),
                                onClose: sAction => {
                                    if (sAction === this.oBundle.getText('comfirm')) {
                                        this.pessMessageYes();
                                    } else {
                                        this.pessMessageNo();
                                    }
                                }
                            });
                        } else {
                            MessageBox.warning(sMessage);
                        }
                        break;
                    case "I":
                        MessageBox.information(sMessage);
                        break;
                    case "E":
                        MessageBox.error(sMessage);
                        break;
                    default:
                        break;
                }
            }
        };
    }
);