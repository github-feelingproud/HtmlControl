var Select = function (config) {
    this.config = config;
    this.controlId = config["id"];
    this.control = $("#" + config["id"]);
    this.href = config["href"];
    this.optionFormatter = config["optionFormatter"];
    this.width = config["width"];
    var shelf = this;

    this.template = '<select class="chosen-select form-control" {isMultiple} name="{name}" data-placeholder="{placeholder}"><option value=""></option></select>';

    if (shelf.href) {
        $.ajax({
            url: shelf.href,
            async: false,
            dataType: "json"
        }).done(function (data) {
            shelf.label = data["label"];
            shelf.require = data["require"];
            shelf.name = data["name"];
            shelf.defaultValue = data["defaultValue"];
            shelf.isMultiple = data["isMultiple"];
            shelf.items = data["items"];
        });
    }


    this.label = this.label || config["label"];
    this.name = this.name || config["name"];
    this.require = this.require || config["require"] || false;
    this.items = this.items || config["items"] || [];
    this.defaultValue = this.defaultValue || config["defaultValue"];
    this.isMultiple = this.isMultiple || config["isMultiple"];

    var content = this.template
		.replaceAll("{name}", shelf.name)
		.replaceAll("{isMultiple}", shelf.isMultiple ? "multiple" : "")
		.replaceAll("{placeholder}", "请选择{label}".replaceAll("{label}", shelf.label));
    this.control.addClass("form-group").css("width", shelf.width).append(content);
    var select = this.control.find("select");
    select.css("width", "100%");
    var option = '<option value="{value}" relText="{relText}">{text}</option>';
    for (var i = 0; i < shelf.items.length; i++) {
        var item = shelf.items[i];
        var relText = item["text"] || item["Text"];
        var value = item["value"] || item["Value"];
        var text = shelf.optionFormatter ? shelf.optionFormatter(relText, i) : relText;
        var html = option.replaceAll("{value}", value).replaceAll("{relText}", relText).replaceAll("{text}", text);
        var optionItem = $(html);
        if (!!shelf.defaultValue && !!value && !!relText) {
            if (shelf.defaultValue.toString().contains(value.toString()) || shelf.defaultValue.toString().contains(relText.toString())) {
                optionItem.prop("selected", true);
            }
        }
        select.append(optionItem);
    }

    select.chosen();

    var errorMessage = $("<span></span>");
    var rightMessage = $('<span class="successMsg">√</span>').hide();
    this.control.after(errorMessage);
    errorMessage.after(rightMessage);
    if (shelf.require) {
        select.attr("require", true);
        var nullError = '<span class="errorMsg" errorType="nullError">请选择{label}</span>'.replaceAll("{label}", shelf.label);
        nullError = $(nullError);
        nullError.hide();
        errorMessage.append(nullError);
    }

    var findParentForm = function (ele) {
        var parent = ele.parent();
        var target = parent[0].tagName.toLocaleLowerCase();
        if (target === "body" || target === "html") {
            return null;
        }
        if (target !== "form") {
            parent = findParentForm(parent);
        }
        return parent;
    };

    var parentForm = findParentForm(shelf.control);
    if (parentForm) {
        parentForm.on("submit", function (e) {
            shelf.control.find("input[name^={name}][hidden]".replaceAll("{name}", shelf.name)).remove();
            if (!shelf.validate()) {
                return false;
            }
            if (shelf.isMultiple) {
                select.removeAttr("name");
                var selectItems = shelf.control.find("div.chosen-container > ul.chosen-choices > li.search-choice > a");
                for (var i = 0; i < selectItems.length; i++) {
                    var item = $(selectItems[i]);
                    var value = item.attr("value");
                    var hidden = '<input hidden name="{name}[{i}]" value="{value}"/>'
						.replaceAll("{name}", shelf.name)
						.replaceAll("{i}", i)
						.replaceAll("{value}", value);
                    item.append(hidden);
                }
            } else {
                select.attr("name", shelf.name);
            }
        });
    }

    this.getTexts = function () {
        var result = [];
        if (shelf.isMultiple) {
            var selectItems = this.control.find("div.chosen-container > ul.chosen-choices > li.search-choice > a");
            for (var i = 0; i < selectItems.length; i++) {
                var item = $(selectItems[i]);
                var value = item.attr("relText");
                result.push(value);
            }
        } else {
            var ele = this.control.find("div.chosen-container > a.chosen-single > span");
            var value = ele.text();
            result = value;
        }
        if (shelf.require && (!result || result.length === 0)) {
            return false;
        }
        return result;
    };

    this.getValues = function () {
        var result = [];
        if (shelf.isMultiple) {
            var selectItems = this.control.find("div.chosen-container > ul.chosen-choices > li.search-choice > a");
            for (var i = 0; i < selectItems.length; i++) {
                var item = $(selectItems[i]);
                var value = item.attr("value");
                result.push(value);
            }
        } else {
            var value = select.val();
            result = value;
        }
        if (shelf.require && (!result || result.length === 0)) {
            return false;
        }
        return result;
    };

    this.validate = function () {
        var values = this.getValues();
        rightMessage.hide();
        if (shelf.require && !values) {
            errorMessage.find("span[errorType=nullError]").show();
            return false;
        } else {
            errorMessage.find("span[errorType=nullError]").hide();
        }
        rightMessage.show();
        return values;
    };
};
