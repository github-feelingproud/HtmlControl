var ComboTree = function(config){
	this.config = config;
	this.controlId = config["id"];
	this.control = $("#" + config["id"]);
	this.href = config["href"];
	this.optionFormatter = config["optionFormatter"];
	this.width = config["width"];
	
	if(this.href){
		$.ajax({
			url: shelf.href,
			async: false,
			dataType: "json"
		}).done(function(data){
			shelf.require = data["require"];
			shelf.name = data["name"];
			shelf.defaultValue = data["defaultValue"];
			shelf.items = data["items"];
			shelf.label = data["label"];
		});
	}
	
	
	this.items = this.items || config["items"];
	this.label = this.label || config["label"];
	this.name = this.name || config["name"];
	this.require = this.require || config["require"];
	this.defaultValue = this.defaultValue || config["defaultValue"];
	this.isMultiple = config["isMultiple"];
	this.optionFormatter = config["optionFormatter"];
	var shelf = this;
	var items = shelf.items;
	
	var template = '<input hidden name="{name}"/><button class="btn btn-default dropdown-toggle" type="button"><label>请选择{label}</label><i class="caret"></i></button><div><div class="combo-tree-search"><div><input class="combo-tree-search-input"/><i class="glyphicon glyphicon-search"></i></div></div><table class="table table-condensed"><tbody class="container"></tbody></table></div>';
	
	var content = template.replaceAll("{name}", shelf.name).replaceAll("{label}", shelf.label);
	content = $(content);
	var treeTable = content.find("table");
	this.treeTable = treeTable;
	var appendNode = function (node, parentNode) {
        var tbody = treeTable.find("tbody");
        var parentValue = parentNode ? parentNode["value"] || parentNode["Value"] : 0;
        var value = node["value"] || node["Value"];
        var text = node["text"] || node["Text"];
        var tr =
            '<tr id="node-{id}" data-id="{id}" data-toggle="context" data-text="{text}" class="treegrid-{id} {hasParent}" data-parentid="{parentId}"></tr>'
                .replaceAll("{text}", text)
                .replaceAll("{id}", value)
                .replaceAll("{parentId}", parentNode ? parentValue : 0)
                .replaceAll("{hasParent}", parentNode ? "treegrid-parent-" + parentValue : "");
        tr = $(tr);
        var tdText = $('<td class="combo-tree-node-td"></td>');
        if (!!text) {
            tdText.html('<span class="combo-tree-node-text">{text}</span>'.replaceAll("{text}", text));
        } else {
            tdText.html('<span class="margin-left-20">名称已丢失</span>')
                .addClass("font-color-danger");
        }
        tr.append(tdText);
        tbody.append(tr);
    };
	
	var adapter = function (node, parentNode) {
        appendNode(node, parentNode);
        var childNodes = node["childNodes"] || node["ChildNodes"];
        if (childNodes && childNodes.length > 0) {
            for (var i = 0; i < childNodes.length; i++) {
                adapter(childNodes[i], node);
            }
        }
    };

    this.expand = function(node, tagClass) {
        var cls = node.attr("class");
        var parentClass = cls.split(" ")[1];
        if (parentClass.contains("treegrid-parent-")) {
            parentClass = parentClass.replaceAll("parent-", "");
            var parentNode = shelf.treeTable.find("." + parentClass);
            if (parentClass && parentNode.length > 0) {
            	if(tagClass){
		            parentNode.addClass(tagClass);
		        }
                shelf.expand(parentNode);
            }
        }
        if(tagClass){
            node.addClass(tagClass);
        }
        node.treegrid("expand");
    };
	
	this.expandAll = function() {
        shelf.treeTable.treegrid('expandAll');
    };

    this.closeAll = function() {
        shelf.treeTable.treegrid('collapseAll');
    };
	
	this.reload = function(){
		this.control.find("input").val('');
		this.control.find("button > label").text(shelf.label);
		var tbody = treeTable.find("tbody");
		tbody.html('');
		if(this.items){	
			for (var i = 0; i < items.length; i++) {
	            adapter(items[i], null);
	        }
			treeTable.treegrid({
	            expanderExpandedClass: 'glyphicon glyphicon-triangle-bottom',
	            expanderCollapsedClass: 'glyphicon glyphicon-triangle-right'
	        });
	        treeTable.treegrid("collapseAll");
		}
	};
	
	this.reload();
	
	this.control.addClass("combo-tree form-inline form-group").append(content);
	var treeList = this.control.find("div");
	treeList.hide();
	
	this.control.on("click", function(e){
		treeTable.treegrid("collapseAll");
		treeList.toggle(200);
	});
	
	var expander = this.control.find("span.treegrid-expander, div.combo-tree-search");
	expander.on("click", function(e){
		return false;
	});
	
	var itemLabel = this.control.find("button > label");
	var hiddenInput = this.control.find("input[hidden][name={name}]".replaceAll("{name}", shelf.name));
	var searchInput = this.control.find("input.combo-tree-search-input");
	var trs = this.control.find("tr");
	trs.on("click", function(e){
		var tr = $(this);
		var text = tr.data("text");
		var id = tr.data("id");
		searchInput.val('');
		var tagClass = "combo-tree-node-expand";
		shelf.control.find(".redHighlight").removeClass("redHighlight");
		shelf.control.find("tr").removeClass(tagClass).show();
		itemLabel.text(text);
		hiddenInput.val(id);
	});
	
	var rows = [];
	
	for (var i = 0; i < trs.length; i++) {
		rows.push(trs[i]);
	}
	if(this.defaultValue){
		var result = _.filter(rows, function(row){
			return $(row).data("id").toString() === shelf.defaultValue.toString();
		});
		if(result.length > 0){
			var tr = $(result[0]);
			var text = tr.data("text");
			var id = tr.data("id");
			itemLabel.text(text);
			hiddenInput.val(id);
		}
	}
	
	
	
	searchInput.on("keydown", function(e){
		if(e.keyCode === 9){
			var text = searchInput.val();
			var results = _.filter(rows, function(row){
				return $(row).data("text").contains(text);
			});
			if(results.length > 0){
				var result = $(results[0]);
				shelf.setValue(result.data("id"));
			}
		}
	});
	
	searchInput.on("input", function(e){
		var text = searchInput.val();
		var tagClass = "combo-tree-node-expand";
		shelf.control.find(".redHighlight").removeClass("redHighlight");
		shelf.control.find("tr").removeClass(tagClass).show();
		if(text){
			var results = _.filter(rows, function(row){
				var relText = $(row).data("text").toString();
				return relText.contains(text);
			});
			for(var i = 0; i < results.length; i++){
				var item = $(results[i]);
				item.addClass(tagClass);
				item.find(".combo-tree-node-text").addClass("redHighlight");
				var parentId = item.data("parentid");
				var parent = shelf.control.find("#node-{parentid}".replaceAll("{parentid}", parentId));
				if(parent.length > 0){
					shelf.expand(parent, tagClass);
				}
			}
			shelf.control.find("tr:not(.{tagClass})".replaceAll("{tagClass}", tagClass)).hide();
		}else{
			shelf.treeTable.treegrid("collapseAll");
		}
	});
	
	var errorMessage = $("<span></span>");
	var rightMessage = $('<span class="successMsg">√</span>').hide();
	shelf.control.after(errorMessage);
	errorMessage.after(rightMessage);
	if(shelf.require){
		shelf.control.attr("require", true);
		var nullError = '<span class="errorMsg" errorType="nullError">请选择{label}</span>'.replaceAll("{label}", shelf.label);
		nullError = $(nullError);
		nullError.hide();
		errorMessage.append(nullError);
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
	
	var parentForm = findParentForm(shelf.control);
	if(parentForm){
		parentForm.on("submit", function(e){
			if(!shelf.validate()){
				return false;
			}
		});
	}
	
	this.getValue = function(){
		var value = hiddenInput.val();
		if(shelf.require && !value){
			return false;
		}
		return value;
	};
	
	
	this.getText = function(){
		var value = hiddenInput.val();
		if(!value){
			return "";
		}else{
			var label = shelf.control.find("button > label");
			return label.text();
		}
	};
	
	this.setValue = function(value){
		var tr = shelf.control.find("#node-{id}".replaceAll("{id}", value));
		if(tr.length === 0){
			tr = shelf.control.find("tr[data-text={text}]".replaceAll("{text}", value));
			if(tr.length === 0){
				return false;
			}
		}
		var text = tr.data("text");
		var id = tr.data("id");
		itemLabel.text(text);
		hiddenInput.val(id);
		shelf.control.trigger("click");
		return true;
	};
	
	this.validate = function(){
		var text = this.getValue();
		rightMessage.hide();
		if(shelf.require && !text){
			errorMessage.find("span[errorType=nullError]").show();
			return false;
		}else{
			errorMessage.find("span[errorType=nullError]").hide();
		}
		rightMessage.show();
		return text;
	};
};
