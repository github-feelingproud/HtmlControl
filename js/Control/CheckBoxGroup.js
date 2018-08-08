var CheckBoxGroup = function(config){
	this.config = config;
	this.controlId = config["id"];
	this.control = $("#" + config["id"]);
	this.href = config["href"];
	var shelf = this;
	
	if(shelf.href){
		$.ajax({
			url: shelf.href,
			async: false,
			dataType: "json"
		}).done(function(data){
			shelf.label = data["label"];
			shelf.min = data["min"];
			shelf.max = data["max"];
			shelf.items = data["items"];
			shelf.name = data["name"];
		});
	}
	this.label = shelf.label || config["label"];
	this.min = shelf.min || config["min"];
	this.max = shelf.max || config["max"];
	this.items = shelf.items || config["items"];
	this.name = shelf.name || config["name"];
	this.template = '<label><input type="checkbox" value="{value}"/><span><b>√</b></span>{text}</label>';

	
	var control = this.control;
	var label = this.label;
	control.addClass("form-group checkbox-group");
	for(var i = 0; i < this.items.length; i++){
		var item = this.items[i];
		var checkItem = this.template
			.replaceAll("{value}", item["Value"] || item["value"])
			.replaceAll("{text}", item["Text"] || item["text"]);
		checkItem = $(checkItem);
		checkItem.find("input[type=checkbox]").attr("name", this.name);
		this.control.append(checkItem);
	}
	
	var errorMessage = $('<span></span>');
	control.append(errorMessage);
    
	if(this.min){
		var minError = '<span class="errorMsg" errorType="minError">至少选择{n}个{label}</span>'
			.replaceAll("{label}", label)
			.replaceAll("{n}", shelf.min);
		minError = $(minError);
		minError.hide();
		errorMessage.append(minError);
	}
	if(this.max){
		var maxError = '<span class="errorMsg" errorType="maxError">最多只能选择{n}个{label}</span>'
			.replaceAll("{label}", label)
			.replaceAll("{n}", shelf.max);
		maxError = $(maxError);
		maxError.hide();
		errorMessage.append(maxError);
	}

	
	
	var findParentForm = function(ele){
		var parent = ele.parent();
		var target = parent[0].tagName.toLocaleLowerCase();
		if(target === "body" || target === "html"){
			return null;
		}
		if(target !== "form"){
			parent = findParentForm(parent);
		}
		return parent;
	};
	
	var parentForm = findParentForm(control);
	if(parentForm){
		parentForm.on("submit", function(e){
			if(!shelf.validate()){
				return false;
			}
		});
	}
	
	this.getValues = function(){
		var checkedValues = this.control.find("label > input[type=checkbox]:checked");
		var result = [];
		for (var i = 0; i < checkedValues.length; i++) {
			result.push(checkedValues[i].value);
		}
		return result;
	};
	
	
	this.setValues = function(values){
		var checkboxs = this.control.find("label > input[type=checkbox]");
		for (var i = 0; i < values.length; i++) {
			if(values.contains(checkboxs[i].value)){
				$(checkboxs[i]).attr("checked", true);
			}
		}
	};
	
	this.disable = function(){
		var checkbox = control.find("input[type=checkbox]:checked");
		checkbox.attr("checkedState", true);
		checkbox.prop("checked", false);
		control.find("input[type=checkbox]").attr("disabled", true);
		control.find("input[type=checkbox] + span").addClass("control-disabled");
	};
	
	this.enable = function(){
		control.find("input[type=checkbox]").removeAttr("disabled");
		control.find("input[type=checkbox] + span").removeClass("control-disabled");
		var checked = control.find("input[checkedState]");
		checked.prop("checked", true);
	};
	
	this.validate = function(){
		var values = this.getValues();
		if(this.min && this.min > values.length){
			errorMessage.find("span[errorType=minError]").show();
			return false;
		}else{
			errorMessage.find("span[errorType=minError]").hide();
		}
		if(this.max && this.max < values.length){
			errorMessage.find("span[errorType=maxError]").show();
			return false;
		}else{
			errorMessage.find("span[errorType=maxError]").hide();
		}
		var ctrls = control.find("input[type=checkbox]:checked");
		for (var i = 0; i < ctrls.length; i++) {
			
			ctrls[i].name = "{name}[{i}]".replaceAll("{name}", shelf.name).replaceAll("{i}", i);
		}
		return values;
	};
	
	this.resetName = function(){
		control.find("input[type=checkbox]").attr("name", this.name);
	};
};
