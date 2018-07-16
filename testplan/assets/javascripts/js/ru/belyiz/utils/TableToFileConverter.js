/** @namespace window.ru.belyiz.utils.TableToFileConverter */
(function (global, utils) {
    'use strict';
    utils.Package.declare('ru.belyiz.utils.TableToFileConverter', new TableToFileConverter());

    /**
     * @constructor
     */
    function TableToFileConverter() {
        global.nodes.body.append(utils.HtmlGenerator.generateDownloadLink() );
    }

    //noinspection XmlUnusedNamespaceDeclaration
    TableToFileConverter.prototype._templates = {
        'DOC': {
            uri: 'data:application/msword;base64,',
            html: utils.HtmlGenerator.generateWordDocument(),
        },
        'XLS': {
            uri: 'data:application/vnd.ms-excel;base64,',
            html: utils.HtmlGenerator.generateExcelDocument(),	
    }};

    TableToFileConverter.prototype.convert = function (table, filename, type) {
        const template = this._templates[type.toUpperCase()];
        if (!template)
            throw new TypeError(`Can't find parameters for type [${type}]`);
        document.getElementById("downloadLink").href = template.uri + this._base64(this._format(template.html, {table: $(table).html()}));
        document.getElementById("downloadLink").download = filename + '.' + type.toLowerCase();
        document.getElementById("downloadLink").click();
    };

    TableToFileConverter.prototype._base64 = function (s) {
        return global.btoa(unescape(encodeURIComponent(s)))
    };

    TableToFileConverter.prototype._format = function (s, c) {
        return s.replace(/{(\w+)}/g, function (m, p) {
            return c[p];
        })
    };

})(window, window.ru.belyiz.utils);