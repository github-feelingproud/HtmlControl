var TextBox = function (config) {
    this.config = config;
    this.controlId = config["id"];
    this.control = $("#" + config["id"]);
    this.href = config["href"];
    this.width = config["width"] || 200;
    this.beginValidate = config["beginValidate"];
    this.endValidate = config["endValidate"];
    this.onInput = config["onInput"];
    this.css = config["css"];
    this.cls = config["cls"];
    this.validateFailMessage = config["validateFailMessage"];
    this.validateState = true;

    var shelf = this;

    if (shelf.href) {
        $.ajax({
            url: shelf.href,
            async: false,
            dataType: "json"
        }).done(function (data) {
            shelf.label = data["label"];
            shelf.name = data["name"];
            shelf.require = data["require"];
            shelf.pattern = data["pattern"];
            shelf.minLength = data["minLength"];
            shelf.maxLength = data["maxLength"];
            shelf.defaultValue = data["defaultValue"];
            shelf.placeholder = data["placeholder"];
        });
    }

    this.label = this.label || config["label"];
    this.name = this.name || config["name"];
    this.require = this.require || config["require"] || false;
    this.pattern = this.pattern || config["pattern"];
    this.minLength = this.minLength || config["minLength"];
    this.maxLength = this.maxLength || config["maxLength"];
    this.defaultValue = this.defaultValue || config["defaultValue"] || "";
    this.placeholder = this.placeholder || config["placeholder"] || "";

    this.template = '<input name="{name}" maxlength="{maxlength}" value="{value}" placeholder="{placeholder}">';

    var control = this.control;
    control.addClass("form-group");
    var label = this.label;
    var content = this.template
        .replaceAll("{value}", shelf.defaultValue)
		.replaceAll("{label}", label)
        .replaceAll("{placeholder}", shelf.placeholder)
		.replaceAll("{name}", shelf.name)
		.replaceAll("{maxlength}", shelf.maxLength);
    content = $(content).css("width", shelf.width);
    control.append(content);
    var errorMessage = $("<span></span>");
    var rightMessage = $('<span class="successMsg">√</span>').hide();
    control.append(errorMessage);
    errorMessage.append(rightMessage);
    var input = control.find("input");
    if (shelf.css) {
        input.css(shelf.css);
    }
    if (shelf.cls) {
        input.addClass(shelf.cls);
    }
    input.addClass("form-control");
    if (shelf.require) {
        input.attr("require", true);
        var nullError = '<span class="errorMsg" errorType="nullError">{label}不能为空</span>'.replaceAll("{label}", label);
        nullError = $(nullError);
        nullError.hide();
        errorMessage.append(nullError);
    }
    if (shelf.pattern) {
        var errorText = shelf.validateFailMessage || "中包含非法的字符";
        var illegal = '<span class="errorMsg" errorType="illegal">{label}{text}</span>'.replaceAll("{label}", label).replaceAll("{text}", errorText);
        illegal = $(illegal);
        illegal.hide();
        errorMessage.append(illegal);
    }
    if (shelf.minLength) {
        var minLength = '<span class="errorMsg" errorType="minLength">{label}的长度不能低于{minLength}个字符</span>'
			.replaceAll("{label}", label)
			.replaceAll("{minLength}", this.minLength);
        minLength = $(minLength);
        minLength.hide();
        errorMessage.append(minLength);
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

    var parentForm = findParentForm(control);
    if (parentForm) {
        parentForm.on("submit", function (e) {
            if (!shelf.validate()) {
                return false;
            }
        });
    }

    input.on("keydown", function (e) {
        if (e.keyCode === 13 || e.keyCode === 9) {
            return shelf.validate() || e.keyCode === 9;
        }
        control.removeClass("has-success");
        control.removeClass("has-error");
        errorMessage.find("span").hide();
        rightMessage.hide();
    });

    input.on("blur",
        function (e) {
            return shelf.validate();
        });

    input.on("input", shelf.onInput);

    this.getText = function () {
        return input.val();
    };

    this.setTest = function (text) {
        return input.val(text);
    };

    this.disable = function () {
        input.attr("disabled", true);
    };

    this.enable = function () {
        input.removeAttr("disabled");
    };

    this.validate = function () {
        if (this.beginValidate) {
            this.beginValidate(input);
        }
        control.removeClass("has-success");
        control.removeClass("has-error");
        var text = input.val();
        if (shelf.require && !text) {
            control.addClass("has-error");
            errorMessage.find("span[errorType=nullError]").show();
            input[0].focus();
            if (this.endValidate) {
                this.endValidate(input);
            }
            this.validateState = false;
            return false;
        } else {
            errorMessage.find("span[errorType=nullError]").hide();
            this.validateState = true;
        }
        if (shelf.pattern && text && !shelf.pattern.test(text)) {
            control.addClass("has-error");
            errorMessage.find("span[errorType=illegal]").show();
            input[0].focus();
            if (this.endValidate) {
                this.endValidate(input);
            }
            this.validateState = false;
            return false;
        } else {
            errorMessage.find("span[errorType=illegal]").hide();
            this.validateState = true;
        }
        if (shelf.minLength && text.length < shelf.minLength) {
            control.addClass("has-error");
            errorMessage.find("span[errorType=minLength]").show();
            input[0].focus();
            if (this.endValidate) {
                this.endValidate(input);
            }
            this.validateState = false;
            return false;
        } else {
            errorMessage.find("span[errorType=minLength]").hide();
            this.validateState = true;
        }
        control.addClass("has-success");
        rightMessage.show();
        if (this.endValidate) {
            this.endValidate(input);
        }
        if (!this.validateState) {
            return this.validateState;
        }
        this.validateState = true;
        return text;
    };
};
