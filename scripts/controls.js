$.fn.IVInputNumeric = function(num) {
    var $this = this;
    var data = $this.data();
    if(!data.is_created) {
        var input = $('<input type="text" />');
        var btn_show_slider = $('<span/>').text("+");

        $this.append(input);
        $this.append(btn_show_slider);
        input.val("0");
        btn_show_slider.click(function() {
            return;
        });
        input.focusout(function() {
            if(data.changed) data.changed(data.get());
        });
        input.keydown(function(e) {
            if(e.which == 13) {
                if(data.changed) data.changed(data.get());
            }
        });
        data.get = function() {
            return parseFloat(input.val());
        };
        data.set = function(num) {
            input.val(num);
        };
        data.is_created = true;
    }
    var input = $this.children("input");
    if(num !== undefined) {
        if(typeof(num) == "function") {
            data.changed = num;
        } else {
            input.val(num);
        }
        return this;
    } else {
        var value = data.get();
        return value;
    }
};

// This control allows binding to specific data path.
$.fn.IVNumericValue = function(obj) {
    var $this = this;
    var data = $this.data();
    if(!data.is_created) {
        data.val_min = 0;
        data.val_max = 0;
        data.path = null;
        var onchanged = function() {
            if(data.current_mode == "plain") {
            } else {
                if(data.path === undefined || data.path == "")
                    data.btn_path.text("-[]-");
                else data.btn_path.text("-[" + data.path + "]-");
            }
            var obj = data.get();
            if(obj && data.changed) {
                data.changed(obj);
            }
        };
        data.num_min = $("<span/>").addClass("input-numeric").IVInputNumeric(function(val) {
            data.val_min = val;
            onchanged();
        });
        data.num_max = $("<span/>").addClass("input-numeric").IVInputNumeric(function(val) {
            data.val_max = val;
            onchanged();
        });
        data.btn_path = $("<span/>").addClass("path").text("-[]-").click(function() {
            data.path = IV.get("selected-path");
            onchanged();
        });
        data.btn_toggle = $("<span/>").addClass("toggle").text("T").click(function() {
            if(data.current_mode == "plain") data.mode_bind();
            else data.mode_plain();
            onchanged();
        });
        data.mode_plain = function() {
            $this.children().detach();
            $this.append(data.btn_toggle);
            $this.append(data.num_min);
            data.current_mode = "plain";
        };
        data.mode_bind = function() {
            $this.children().detach();
            $this.append(data.btn_toggle);
            $this.append(data.num_min);
            $this.append(data.btn_path);
            $this.append(data.num_max);
            data.current_mode = "bind";
        };
        data.is_created = true;
        data.get = function() {
            if(data.current_mode == "plain") {
                return new IV.objects.Number(data.val_min);
            } else {
                if(data.path)
                    return new IV.objects.NumberLinear(data.path, data.val_min, data.val_max);
            }
        };
        data.set = function(obj) {
            if(!obj) {
                data.path = null;
                data.val_min = 0;
                data.num_min.IVInputNumeric(0);
                data.val_max = 0;
                data.num_max.IVInputNumeric(0);
                data.mode_plain();
                return;
            }
            if(obj.type == "NumberLinear") {
                data.path = obj.path;
                data.val_min = obj.min;
                data.val_max = obj.max;
                data.btn_path.text(data.path);
                data.num_min.IVInputNumeric(data.val_min);
                data.num_max.IVInputNumeric(data.val_max);
                data.mode_bind();
            } else {
                data.num_min.IVInputNumeric(obj.obj);
                data.mode_plain();
            }
        };
        data.mode_plain();
    }
    console.log(obj);
    if(obj === undefined) return data.get();
    if(typeof(obj) == "function")
        data.changed = obj;
    else data.set(obj);
    return this;
};
