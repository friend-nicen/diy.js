import shapes from "../shape";


export default {


    async add(shape, zIndex = -1) {


        this.emit('before-add', {
            type: 'before-add',
            shape
        });


        this._shapes.push(shape);


        const fixed = [];


        for (let i of this._shapes) {
            if (i.fixed) {
                fixed.push(i);
            }
        }


        shape.each({
            _stage: this,
            _context: this.getContext()
        });


        const length = this._shapes.length;


        for (let i of fixed) {

            i.moveIndex(i.fixed < 0 ? length + i.fixed : i.fixed - 1, true, true);
        }


        if (zIndex >= 0) {
            shape.moveIndex(zIndex);
        }

        await shape.init();


        if (shape.actived) {
            this.active(shape);
        }


        this.emit('after-add', {
            type: 'after-add',
            shape
        })


        this.render();
        return shape;
    },


    active(shape) {


        if (!this._multiActive) {
            for (let i of this.shapes()) {
                i.deactivate(false);
            }
        }


        shape.active();

        this._actived = shape;
    },


    get(name) {
        for (let shape of this._shapes) {
            if (shape.name === name) {
                return shape;
            }
        }
    },


    remove(shape, flag = false) {


        if (flag) {


            this.emit("before-delete", {type: 'before-delete', shape});

            const index = this._shapes.indexOf(shape);

            if (index > -1) {
                this._shapes.splice(index, 1);
            }

        } else {


            if (!shape) return false;
            if (!shape.canRemove) return false;


            this.emit("before-delete", {type: 'before-delete', shape});


            this._shapes = this._shapes.filter(function (elem) {


                if (!elem.canRemove) {
                    return true;
                }


                if (typeof shape == "string") {
                    return elem.name !== shape;
                } else {
                    return elem !== shape;
                }
            });
        }


        if (shape.actived) {


            this.emit('deactivate', {
                type: "deactivate",
                shape: shape
            });

            this._actived = null;
        }


        this.emit("after-delete", {type: 'after-delete', shape});


        this.render();
    },


    load(json, flag = true) {

        if (typeof json === "string") {
            json = JSON.parse(json);
        }


        if (!json.type) {
            console.warn("json缺少关键参数！")
            return false;
        }


        if (!shapes[json.type]) {
            console.warn(json.type + "图形不存在！")
            return false;
        }


        const shape = new shapes[json.type](json);

        if (flag) {

            this.add(shape, json.zIndex);

            this.render();
        }


        return shape;

    },


    clear() {


        this._shapes = this._shapes.filter(function (elem) {
            return !elem.canRemove;
        });


        if (this._actived) {
            this.emit('deactivate', {
                type: "deactivate",
                shape: this._actived
            });
            this._actived = null;
        }


        this.emit('clear', {
            type: "clear",
            shape: this._actived
        });


        this.render();
    },


    hiddenOutline() {
        this.config.showOutline = false;
    },


    showOutline() {
        this.config.showOutline = true;
    },


    canShowOutline() {
        return this.config.showOutline;
    }
}