# Система учета отпусков #
## Описание
UI5 приложение
 
## Дополнительная информация о проекте
Для установки зависимостей:
```sh
npm install
```
Для генерации документации в html:
```sh
npm run build-docs
```

Для обновления readme.md:
```sh
npm run build-docsmd
```

# API

## Functions

<dl>
<dt><a href="#init">init()</a></dt>
<dd><p>The component is initialized by UI5 automatically during the startup of the app and calls the init method once.</p>
</dd>
<dt><a href="#constructor">constructor(oView, oTable, mParameters)</a></dt>
<dd><p>Представляет собой конструктор элемента управления, в котором производится инициализация элемента</p>
</dd>
<dt><a href="#_attachToTableRowsUpdated">_attachToTableRowsUpdated()</a></dt>
<dd><p>Прикрепляет функцию обработки события к событию _rowsUpdated</p>
</dd>
<dt><a href="#_toggleRowColor">_toggleRowColor(oRow, sClassName, bIsNeedSetClass)</a></dt>
<dd><p>Обрабатывает изменение цвета строки таблицы</p>
</dd>
<dt><a href="#_applyColorConfigurationToRow">_applyColorConfigurationToRow(oRow)</a></dt>
<dd><p>Обрабатывает конфигурацию цвета</p>
</dd>
<dt><a href="#refreshRowColors">refreshRowColors()</a></dt>
<dd><p>Выполняет пересчёт цвета строки</p>
</dd>
<dt><a href="#onInit">onInit()</a></dt>
<dd><p>Выполняется инициализация переменных при запуске приложения</p>
</dd>
<dt><a href="#getResourceBundle">getResourceBundle()</a> ⇒ <code>sap.ui.model.resource.ResourceModel</code></dt>
<dd><p>Выполняется получение ресурсной модели i18n.</p>
</dd>
<dt><a href="#getRouter">getRouter()</a> ⇒ <code>sap.ui.core.routing.Router</code></dt>
<dd><p>Выполняется получение объекта роутинга.</p>
</dd>
<dt><a href="#getModel">getModel()</a> ⇒ <code>sap.ui.model.Model</code></dt>
<dd><p>Выполняет получение объекта модели.</p>
</dd>
<dt><a href="#getComponentModel">getComponentModel(sName)</a> ⇒ <code>sap.ui.model.Model</code></dt>
<dd><p>Выполняет получение объекта модели по наименованию.</p>
</dd>
<dt><a href="#getFormatEditDateTime">getFormatEditDateTime(oDateTime)</a> ⇒ <code>Date</code> | <code>null</code></dt>
<dd><p>Выполняет форматирование даты, что бы при получении даты сервером, она не становилась +1 или -1 сутки.</p>
</dd>
<dt><a href="#onInit">onInit()</a></dt>
<dd><p>Выполняется инициализация переменных при запуске приложения.</p>
</dd>
<dt><a href="#openMessage">openMessage(oResp, isShow, isTable)</a> ⇒ <code>string</code></dt>
<dd><p>Выполняет обработку ответа на запрос и формирование всплывающего сообщения соответствующего типа при необходимости</p>
</dd>
<dt><a href="#openMessageForString">openMessageForString(oResp)</a> ⇒ <code>string</code></dt>
<dd><p>Выполняет обработку ответа если он пришёл в строком типе, по сути это будет происходить льков в случе возврата ошибки</p>
</dd>
<dt><a href="#openMessageForAny">openMessageForAny(oResp, isShow, isTable, sMessageType)</a> ⇒ <code>string</code></dt>
<dd><p>Выполняет обработку ответа если он пришёл в неопределённом типе</p>
</dd>
<dt><a href="#getMessageBatchResponses">getMessageBatchResponses(oResp, sMessageType, aMessage, isShow, isTable)</a> ⇒ <code>string</code></dt>
<dd><p>Выполняет получение сообщений из пакетного запроса, которое отправлено с помощью submitChange</p>
</dd>
<dt><a href="#getSuccessMessage">getSuccessMessage(hdrMessage, sMessageType, aMessage, isShow, isTable)</a> ⇒ <code>string</code></dt>
<dd><p>Получаем список сообщений из hdrMessage для вывода</p>
</dd>
<dt><a href="#getMessage">getMessage(oMessage, isShow)</a> ⇒ <code>string</code></dt>
<dd><p>Выполняет получение сообщения</p>
</dd>
<dt><a href="#showMessageDialog">showMessageDialog(aMessage, isTable, sMessageType)</a> ⇒ <code>string</code></dt>
<dd><p>Производит открытие диалог окна с сообщениями, если сообщений больше 1</p>
</dd>
<dt><a href="#showMessage">showMessage(sMessageType, sMessage)</a></dt>
<dd><p>Производит вывод одного сообщения</p>
</dd>
</dl>

<a name="init"></a>

## init()
The component is initialized by UI5 automatically during the startup of the app and calls the init method once.

**Kind**: global function  
**Access**: public  
<a name="constructor"></a>

## constructor(oView, oTable, mParameters)
Представляет собой конструктор элемента управления, в котором производится инициализация элемента

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| oView | <code>Object</code> | Объект представления |
| oTable | <code>Object</code> | Таблица |
| mParameters | <code>Object</code> | Параметры |

<a name="_attachToTableRowsUpdated"></a>

## \_attachToTableRowsUpdated()
Прикрепляет функцию обработки события к событию _rowsUpdated

**Kind**: global function  
<a name="_toggleRowColor"></a>

## \_toggleRowColor(oRow, sClassName, bIsNeedSetClass)
Обрабатывает изменение цвета строки таблицы

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| oRow | <code>Object</code> | Элемент управления строки |
| sClassName | <code>string</code> | CSS класс |
| bIsNeedSetClass | <code>boolean</code> | Флаг |

<a name="_applyColorConfigurationToRow"></a>

## \_applyColorConfigurationToRow(oRow)
Обрабатывает конфигурацию цвета

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| oRow | <code>Object</code> | Элемент управления строки |

<a name="refreshRowColors"></a>

## refreshRowColors()
Выполняет пересчёт цвета строки

**Kind**: global function  
<a name="onInit"></a>

## onInit()
Выполняется инициализация переменных при запуске приложения

**Kind**: global function  
<a name="getResourceBundle"></a>

## getResourceBundle() ⇒ <code>sap.ui.model.resource.ResourceModel</code>
Выполняется получение ресурсной модели i18n.

**Kind**: global function  
**Returns**: <code>sap.ui.model.resource.ResourceModel</code> - Объект ресурсной модели i18n.  
<a name="getRouter"></a>

## getRouter() ⇒ <code>sap.ui.core.routing.Router</code>
Выполняется получение объекта роутинга.

**Kind**: global function  
**Returns**: <code>sap.ui.core.routing.Router</code> - Объект роутинга.  
<a name="getModel"></a>

## getModel() ⇒ <code>sap.ui.model.Model</code>
Выполняет получение объекта модели.

**Kind**: global function  
**Returns**: <code>sap.ui.model.Model</code> - Возвращает объект модели.  
<a name="getComponentModel"></a>

## getComponentModel(sName) ⇒ <code>sap.ui.model.Model</code>
Выполняет получение объекта модели по наименованию.

**Kind**: global function  
**Returns**: <code>sap.ui.model.Model</code> - Возвращает объект модели.  

| Param | Type | Description |
| --- | --- | --- |
| sName | <code>string</code> | Имя модели. |

<a name="getFormatEditDateTime"></a>

## getFormatEditDateTime(oDateTime) ⇒ <code>Date</code> \| <code>null</code>
Выполняет форматирование даты, что бы при получении даты сервером, она не становилась +1 или -1 сутки.

**Kind**: global function  
**Returns**: <code>Date</code> \| <code>null</code> - Объект даты.  

| Param | Type | Description |
| --- | --- | --- |
| oDateTime | <code>Object</code> | Объект даты. |

<a name="onInit"></a>

## onInit()
Выполняется инициализация переменных при запуске приложения.

**Kind**: global function  
<a name="openMessage"></a>

## openMessage(oResp, isShow, isTable) ⇒ <code>string</code>
Выполняет обработку ответа на запрос и формирование всплывающего сообщения соответствующего типа при необходимости

**Kind**: global function  
**Returns**: <code>string</code> - Возвращает тип сообщения, если сообщений несколько и среди них есть хотя бы одна ошибка, то вернётся "E"  

| Param | Type | Description |
| --- | --- | --- |
| oResp | <code>Object</code> | Объект или строка внутри которого лежит объект сообщения |
| isShow | <code>boolean</code> | Флаг, который говорит выводить ли сообщение в сплывающем окне |
| isTable | <code>boolean</code> | Флаг, который говорит необходимо ли выводить несколько сообщений в одном всплывающем окне или в нескольких последовательно |

<a name="openMessageForString"></a>

## openMessageForString(oResp) ⇒ <code>string</code>
Выполняет обработку ответа если он пришёл в строком типе, по сути это будет происходить льков в случе возврата ошибки

**Kind**: global function  
**Returns**: <code>string</code> - Возвращает тип сообщения, если сообщений несколько и среди них есть хотя бы одна ошибка, то вернётся "E"  

| Param | Type | Description |
| --- | --- | --- |
| oResp | <code>Object</code> | Объект или строка внутри которого лежит объект сообщения |

<a name="openMessageForAny"></a>

## openMessageForAny(oResp, isShow, isTable, sMessageType) ⇒ <code>string</code>
Выполняет обработку ответа если он пришёл в неопределённом типе

**Kind**: global function  
**Returns**: <code>string</code> - Возвращает тип сообщения, если сообщений несколько и среди них есть хотя бы одна ошибка, то вернётся "E"  

| Param | Type | Description |
| --- | --- | --- |
| oResp | <code>Object</code> | Объект или строка внутри которого лежит объект сообщения |
| isShow | <code>boolean</code> | Флаг, который говорит выводить ли сообщение в сплывающем окне |
| isTable | <code>boolean</code> | Флаг, который говорит необходимо ли выводить несколько сообщений в одном всплывающем окне или в нескольких последовательно |
| sMessageType | <code>string</code> | Тип сообщения |

<a name="getMessageBatchResponses"></a>

## getMessageBatchResponses(oResp, sMessageType, aMessage, isShow, isTable) ⇒ <code>string</code>
Выполняет получение сообщений из пакетного запроса, которое отправлено с помощью submitChange

**Kind**: global function  
**Returns**: <code>string</code> - Возвращает тип сообщения, если сообщений несколько и среди них есть хотя бы одна ошибка, то вернётся "E"  

| Param | Type | Description |
| --- | --- | --- |
| oResp | <code>Object</code> | Объект или строка внутри которого лежит объект сообщения |
| sMessageType | <code>string</code> | Тип сообщения |
| aMessage | <code>Array</code> | Массив сообщений |
| isShow | <code>boolean</code> | Флаг, который говорит выводить ли сообщение в сплывающем окне |
| isTable | <code>boolean</code> | Флаг, который говорит необходимо ли выводить несколько сообщений в одном всплывающем окне или в нескольких последовательно |

<a name="getSuccessMessage"></a>

## getSuccessMessage(hdrMessage, sMessageType, aMessage, isShow, isTable) ⇒ <code>string</code>
Получаем список сообщений из hdrMessage для вывода

**Kind**: global function  
**Returns**: <code>string</code> - Возвращает тип сообщения, если сообщений несколько и среди них есть хотя бы одна ошибка, то вернётся "E"  

| Param | Type | Description |
| --- | --- | --- |
| hdrMessage | <code>string</code> | JSON строка с сообщением |
| sMessageType | <code>string</code> | Тип сообщения |
| aMessage | <code>Array</code> | Массив сообщений |
| isShow | <code>boolean</code> | Флаг, который говорит выводить ли сообщение в сплывающем окне |
| isTable | <code>boolean</code> | Флаг, который говорит необходимо ли выводить несколько сообщений в одном всплывающем окне или в нескольких последовательно |

<a name="getMessage"></a>

## getMessage(oMessage, isShow) ⇒ <code>string</code>
Выполняет получение сообщения

**Kind**: global function  
**Returns**: <code>string</code> - Возвращает объект сообщения для локальной модели  

| Param | Type | Description |
| --- | --- | --- |
| oMessage | <code>Object</code> | Объект сообщения |
| isShow | <code>boolean</code> | Флаг, который говорит выводить ли сообщение в сплывающем окне |

<a name="showMessageDialog"></a>

## showMessageDialog(aMessage, isTable, sMessageType) ⇒ <code>string</code>
Производит открытие диалог окна с сообщениями, если сообщений больше 1

**Kind**: global function  
**Returns**: <code>string</code> - Возвращает тип сообщения, если сообщений несколько и среди них есть хотя бы одна ошибка, то вернётся "E"  

| Param | Type | Description |
| --- | --- | --- |
| aMessage | <code>Array</code> | Массив сообщений |
| isTable | <code>boolean</code> | Флаг, который говорит необходимо ли выводить несколько сообщений в одном всплывающем окне или в нескольких последовательно |
| sMessageType | <code>string</code> | Тип сообщения |

<a name="showMessage"></a>

## showMessage(sMessageType, sMessage)
Производит вывод одного сообщения

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| sMessageType | <code>string</code> | Тип сообщения |
| sMessage | <code>string</code> | Строка сообщения |

