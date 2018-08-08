var DateBox = function(config){
	this.config = config;
	this.controlId = config["id"];
	this.label = config["label"];
	this.control = $("#" + config["id"]);
	this.href = config["href"];
	var shelf = this;
	
	if(shelf.href){
		$.ajax({
			url: shelf.href,
			async: false,
			dataType: "json"
		}).done(function(data){
			shelf.require = data["require"];
			shelf.name = data["name"];
			shelf.defaultValue = data["defaultValue"];
			shelf.pattern = data["pattern"];
		});
	}
	
	this.require = this.require || config["require"] || false;
	this.name = this.name || config["name"];
	this.defaultValue = this.defaultValue || config["defaultValue"] || "";
	this.pattern = this.pattern || /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/;
	
	this.template = '<input class="form-control" value="{value}" name="{name}"/><div class="input-group-addon" style="cursor: pointer;"><span class="glyphicon glyphicon-th"></span></div>';
	
	var control = this.control;
	var label = this.label;
	
	var content = shelf.template.replaceAll("{value}", shelf.defaultValue).replaceAll("{name}", shelf.name).replaceAll("{label}", shelf.label);
	control.append(content);
	control.addClass("input-group date");
	control.datepicker({
    	language: 'zh-CN',
    	format: 'yyyy-mm-dd',
    	autoclose: true,
    	clearBtn: true,
    	calendarWeeks: true,
    	todayHighlight: true
	});
	
	var errorMessage = $("<span></span>");
	var rightMessage = $('<span class="successMsg">√</span>').hide();
	control.after(errorMessage);
	errorMessage.after(rightMessage);
	if(shelf.require){
		control.attr("require", true);
		var nullError = '<span class="errorMsg" errorType="nullError">{label}不能为空</span>'.replaceAll("{label}", label);
		nullError = $(nullError);
		nullError.hide();
		errorMessage.append(nullError);
	}
	if(shelf.pattern){
		var illegal = '<span class="errorMsg" errorType="illegal">{label}格式不正确</span>'.replaceAll("{label}", label);
		illegal = $(illegal);
		illegal.hide();
		errorMessage.append(illegal);
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
	
	this.disable = function(){
		control.find("input").attr("disabled", true);
	};
	
	this.enable = function(){
		control.find("input").removeAttr("disabled");
	};
	
	this.getDate = function(){
		return control.find("input").val();
	};
	
	this.setDate = function(date){
		return control.find("input").val(date);
	};
	
	this.validate = function(){
		var text = this.getDate();
		rightMessage.hide();
		if(shelf.require && !text){
			errorMessage.find("span[errorType=nullError]").show();
			control[0].focus();
			return false;
		}else{
			errorMessage.find("span[errorType=nullError]").hide();
		}
		if(shelf.pattern && !shelf.pattern.test(text)){
			errorMessage.find("span[errorType=illegal]").show();
			control[0].focus();
			return false;
		}else{
			errorMessage.find("span[errorType=illegal]").hide();
		}
		rightMessage.show();
		return text;
	};
	
};
