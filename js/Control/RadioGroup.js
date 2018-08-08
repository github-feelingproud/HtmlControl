var RadioGroup = function(config){
	this.config = config;
	this.controlId = config["id"];
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
	
	
	this.label = config["label"];
	this.control = $("#" + config["id"]);
	this.defaultValue = config["defaultValue"];
	this.items = config["items"];
	this.name = config["name"];
	
	this.template = '<label><input type="radio" value="{value}"/><span><i></i></span>{text}</label>';

	var control = this.control;
	var label = this.label;
	control.addClass("form-group radio-group");
	for(var i = 0; i < this.items.length; i++){
		var item = this.items[i];
		var value = item["Value"] || item["value"];
		var text = item["Text"] || item["text"];
		var checkItem = this.template
			.replaceAll("{value}", value)
			.replaceAll("{text}", text);
		checkItem = $(checkItem);
		var radio = checkItem.find("input[type=radio]");
		radio.attr("name", this.name);
		if(this.defaultValue === value || this.defaultValue === text){
			radio.prop("checked", true);
		}
		this.control.append(checkItem);
	}
	
	
	this.getValue = function(){
		var checkedValue = this.control.find("label > input[type=radio]:checked");
		return checkedValue.val();
	};
	
	this.setValue = function(value){
		var radios = this.control.find("label > input[type=radio]");
		for (var i = 0; i < radios.length; i++) {
			if(values === radios[i].value){
				$(radios[i]).attr("checked", true);
			}
		}
	};
	
	this.disable = function(){
		var checked = control.find("input[type=radio]:checked");
		checked.attr("checkedState", true);
		checked.prop("checked", false);
		control.find("input[type=radio] + span").addClass("control-disabled");
		control.find("input[type=radio]").attr("disabled", true);
	};
	
	this.enable = function(){
		control.find("input[type=radio]").removeAttr("disabled");
		control.find("input[type=radio] + span").removeClass("control-disabled");
		var checked = control.find("input[checkedState]");
		checked.prop("checked", true);
	};
};
