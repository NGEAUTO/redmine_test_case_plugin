/** @namespace window.ru.belyiz.utils.InputsUtils */

(function (global, utils) {
    'use strict';
    utils.Package.declare('ru.belyiz.utils.InputsUtils', new InputsUtils());

    /**
     * @constructor
     */
    function InputsUtils() {
    }
	
	/**
	*	generating test case name from requirement following this model : 
	*	NGE_[Protocol]_[RequirementReference]_[TestCaseNumber]_[Version]
	*	allRequirements : existing requirements with TestCases created.
	*/
	InputsUtils.prototype.getTestCaseName = function(requirement, allRequirements, allTestCases){
		var tcn = requirement.replace(requirement.slice(0,requirement.indexOf('-')),'NGE');
		tcn = tcn.replace('.','_');
		while (tcn.indexOf('-')>-1)
			tcn = tcn.replace('-','_');
		var number = 1;
		for (var i=0;i<allRequirements.length;i++)
			if (requirement == allRequirements[i]) number ++;
		var version = 'A';
		tcn+= '_'+number+'_'+version;
		return tcn;
	}
	
	/**
	* Converting image src to base64String using blob-util.js
	* returns an object containing the String and the data type
	*/
	InputsUtils.prototype.srcTo64String =   function (type, data, callback) {
		return new Promise(function (resolve, reject){
		
		var src = data.file || data.screenshot;
        blobUtil.imgSrcToBlob(src).then(function (blob) {
			blobUtil.blobToBase64String(blob).then(function (base64String) {
				if (data.name != undefined)
					data.file = data.name + '_image';
				else if (data.screenshot != undefined)
					data.screenshot = (data.screenshot+'_image');
				else
					data.file = data.logfileId;
				resolve (callback(type, data , data.file, base64String, blob.type));
			}).catch(function (err) {
				 console.log(err);
			});	
		}).catch(function (err) {
			console.log(err);
		});
	});
    };

	InputsUtils.prototype.file_to_64String =   function (type, data, callback) {
		return new Promise(function (resolve, reject){
			
		var fileReader = new FileReader();
		
            fileReader.onloadend = function (e) {
            var arrayBuffer = e.target.result;
            var fileType = "image/png"; // to be seen
            blobUtil.arrayBufferToBlob(arrayBuffer, undefined).then(function (blob) {
			
			blobUtil.blobToBase64String(blob).then(function (base64String) {
				if (data.name != undefined)
					data.file = data.name + '_image';
				else if (data.screenshot != undefined)
					data.screenshot = (data.screenshot+'_image');
				else
					data.file = data.logfileId;
				resolve (callback(type, data , data.file, base64String, blob.type));
			}).catch(function (err) {
				 console.log(err);
			});	
			
			
            //console.log(blob);
            //console.log('its size is', blob.size);
            //console.log('its type is', blob.type);
            }).catch(console.log.bind(console));
            };
			//console.log(data);
			//console.log(data.file_object);
			if (data.file_object !== undefined)
            fileReader.readAsArrayBuffer(data.file_object);
			
		
		});	
		 };
    /**
     * Calculate textarea height by included content
     * @param textarea textarea DOM-element
     */
    InputsUtils.prototype.resizeTextArea = function (textarea) {
        this._calculateTextAreaHeight(textarea);
        textarea.blur();
        textarea.focus();
    };

    /**
     * Calculate text areas height by included content
     */
    InputsUtils.prototype.resizeTextAreas = function () {
        $('textarea').each((i, textarea) => this._calculateTextAreaHeight(textarea));
    };

    InputsUtils.prototype.selectRange = function (element, start, end) {
        if (end === undefined)
            end = start;
        if ('selectionStart' in element) {
            element.selectionStart = start;
            element.selectionEnd = end;
        } else if (element.setSelectionRange) 
            element.setSelectionRange(start, end);
        else if (element.createTextRange) {
            const range = element.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    };

    InputsUtils.prototype._calculateTextAreaHeight = function (textarea) {
        textarea.style.height = '5px';
        textarea.style.height = (textarea.scrollHeight) + 'px';
    };


    /**
    *	Returning the current date as : dd/mm/yyyy
    */
    InputsUtils.prototype.getToday = function() {
		var today = new Date();
		var seconds = today.getSeconds();
		var minutes = today.getMinutes();
		var hours = today.getHours();
		var day = today.getDate();
		var month = today.getMonth()+1;
		var year = today.getFullYear();
		//console.log(day,month,year);
		return (day+'/'+month+'/'+year+' '+hours+':'+minutes+':'+seconds);
	};

    /**
    *	Reading the Parameter : name from the url if it exists
    */
    InputsUtils.prototype.getUrlParameter =  function (name) {
	    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
	    var results = regex.exec(location.search);
	    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	};

})(window, window.ru.belyiz.utils);