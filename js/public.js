String.prototype.replaceAll = function(oldString, newString){
	var result = this.replace(new RegExp(oldString,"gm"), newString);
	return result;
};

Array.prototype.contains = function(value){
	for (var i = 0; i < this.length; i++) {
		if(value === this[i]){
			return true;
		}
	}
	return false;
};
String.prototype.contains = function(str){
	return this.indexOf(str) >= 0;
}
