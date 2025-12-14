import {toFixedNumber} from "../../utils/math";
import {cloneDeep} from "../../utils/common";
import {radToDegree, rotateVector} from "../../utils/vector";

export default {


    _active(status, flag = true) {


        if (status === this.actived) return;


        if (this.canActive && status) {
            this.emit('active', {type: 'active', shape: this});
            this.stage().emit("active", {type: 'active', shape: this});
            this.actived = status;
        } else {

            this.emit('deactivate', {type: 'deactivate', shape: this});

            if (flag) {
                this.stage().emit("deactivate", {type: 'deactivate', shape: this});
            }
            this.actived = false;
        }


        this.render();
    },


    active() {
        this._active(true);
    },


    deactivate(flag = true) {
        this._active(false, flag);
    },


    toggle() {
        this._active(!this.actived);
        return this.actived;
    },


    props(options = {}) {


        const config = Object.assign({
            element: true,
            private: true,
            relative: false,
            ignore: []
        }, options)


        const props = Object.create(null);


        for (let i in this) {


            if (config.ignore.indexOf('i') > -1) {
                continue;
            }


            if (typeof this[i] == "function") {
                continue;
            }


            if (!config.private && i.startsWith('_')) {
                continue;
            }

            const type = typeof this[i];


            if (this[i] !== null && (type === 'object')) {

                if (this[i].nodeType !== undefined && !config.element) {
                    continue;
                }
            }


            if (i.startsWith('_')) {
                props[i] = this[i];

            } else if (this[i] !== null && type === 'object' && this[i].nodeType !== undefined) {
                props[i] = this[i];
            } else {
                props[i] = cloneDeep(this[i], config)
            }


        }


        props.zIndex = this.getIndex();
        props.actived = false;
        props.outline = false;


        if (config.relative) {
            return Object.assign(props, this.relative());
        } else {
            return props;
        }


    },


    toJson(config) {


        const props = this.props(Object.assign({
            element: false,
            private: false
        }, config));


        if (this._stage) {
            props.zIndex = this._stage.getIndex(this);
        }


        return JSON.stringify(props);
    },


    bound() {
    },


    getRotateCoords() {


        const bound = this.bound();
        const coords = [];


        coords.push(rotateVector(
            {x: bound.x, y: bound.y},
            radToDegree(this.rotateRadius),
            this.getCenterPoint()
        ));

        coords.push(rotateVector(
            {x: bound.x + bound.w, y: bound.y},
            radToDegree(this.rotateRadius),
            this.getCenterPoint()
        ));

        coords.push(rotateVector(
            {x: bound.x + bound.w, y: bound.y + bound.h},
            radToDegree(this.rotateRadius),
            this.getCenterPoint()
        ));

        coords.push(rotateVector(
            {x: bound.x, y: bound.y + bound.h},
            radToDegree(this.rotateRadius),
            this.getCenterPoint()
        ));

        return coords;
    },


    getRotateBound() {


        if (this.rotateRadius === 0) {
            return this.bound();
        }

        return this.getReference(this.getRotateCoords());
    },


    stage() {
        return this._stage;
    }
    ,


    getContext() {
        return this._context;
    }
    ,


    getIndex() {

        const parent = this.stage();

        if (!parent) return -1;

        return this._group ? this._group.getShapeIndex(this) : parent.getIndex(this);
    }
    ,


    moveIndex(target, action = true, force = false) {


        if (!this.canSort && !force) return -1;


        const index = this.getIndex();


        if (index < 0) {
            return -1;
        }


        const shapes = this._group ? this._group.getShapes() : this.stage().shapes();


        if (target < 0 || target >= shapes.length) {
            return -1;
        }

        const shape = this;


        const direction = target === 0 ? 0 : (target > index ? 1 : -1);


        let currentIndex = target;


        if (!force) {


            do {


                const currentshape = shapes[currentIndex];

                if (currentshape.canSort) {
                    break;
                }

                currentIndex += direction;

            } while (currentIndex > 0 && currentIndex < shapes.length)
        }


        if (currentIndex < 0 || currentIndex >= shapes.length) {
            return -1;
        }


        if (currentIndex === index) {
            return -1;
        }


        if (!action) {
            return currentIndex;
        }


        this.emit('before-sort', {
            type: 'before-sort',
            shape,
            index: currentIndex
        })


        this.stage().emit('before-sort', {
            type: 'before-sort',
            index: currentIndex,
            shape
        })


        if (direction === 1) {
            for (let i = index; i < currentIndex; i++) {
                shapes[i] = shapes[i + 1];
            }
        } else {
            for (let i = index; i > currentIndex; i--) {
                shapes[i] = shapes[i - 1];
            }
        }


        shapes[currentIndex] = shape;


        this.emit('after-sort', {
            type: 'after-sort',
            shape,
            index: currentIndex
        })


        this.stage().emit('after-sort', {
            type: 'after-sort',
            shape,
            index: currentIndex
        });


        this.render();
        return currentIndex;

    }
    ,


    moveTop(action = true) {
        return this.moveIndex(this.stage().shapes().length - 1, action);
    }
    ,


    moveBottom(action = true) {
        return this.moveIndex(0, action);
    }
    ,


    forward(action = true) {
        return this.moveIndex(this.getIndex() + 1, action);
    }
    ,


    backward(action = true) {
        return this.moveIndex(this.getIndex() - 1, action);
    }
    ,


    destroy(flag = false) {


        if (this._stage) {

            (this._group ? this._group : this.stage()).remove(this, flag);
            this.render();
        }
    }
    ,


    bindContext(context) {
        this._context = context
    }
    ,


    ColorBound() {


        const bound = this.stage().bound();
        const offScreen = this.stage().createCanvas(bound._w, bound._h);
        const offContext = offScreen.context;
        const context = this.getContext();


        offContext.dpr(1);
        offContext.clearRect(0, 0, bound._w, bound._h);


        const blendMode = this.blendMode;


        this.bindContext(offContext);
        this.blendMode = "source-over";
        this.draw(false);
        this.bindContext(context);

        this.blendMode = blendMode;

        const imageData = offContext.getImageData(0, 0, Math.round(bound._w), Math.round(bound._h));


        let minX = bound._w;
        let minY = bound._h;
        let maxX = 0;
        let maxY = 0;


        for (let y = 0; y < bound._h; y++) {
            for (let x = 0; x < bound._w; x++) {
                const index = Math.floor((y * bound._w + x) * 4);
                const alpha = imageData.data[index + 3];
                if (alpha > 0) {
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                }
            }
        }


        const drp = toFixedNumber(this.stage().dpr(), 3);

        return {
            _x: toFixedNumber(minX, 3),
            _y: toFixedNumber(minY, 3),
            _w: toFixedNumber((maxX - minX + 1), 3),
            _h: toFixedNumber((maxY - minY + 1), 3),
            x: toFixedNumber((minX * drp), 3),
            y: toFixedNumber((minY * drp), 3),
            w: toFixedNumber(((maxX - minX + 1) * drp), 3),
            h: toFixedNumber(((maxY - minY + 1) * drp), 3)
        }

    }
    ,


    getColorBound(force = false) {


        if (force) {
            return this.ColorBound();
        }


        if (!this._colorBound) {
            this._colorBound = this.ColorBound();
        }

        return this._colorBound;
    }
    ,


    getReference() {

        const stage = this.stage();


        if (this._group) {

            const bound = this._group.bound();

            return {
                x: bound.x * stage.dpr(),
                y: bound.y * stage.dpr(),
                w: bound.w * stage.dpr(),
                h: bound.h * stage.dpr(),
                _x: bound.x,
                _y: bound.y,
                _w: bound.w,
                _h: bound.h
            }
        }

        const viewBound = stage.getViewBound();


        return viewBound && this.reference === 'view' ? viewBound : stage.bound();

    }
    ,


    canShowOutline() {
        return this.stage().canShowOutline();
    }
    ,


    async copy() {

        const stage = this.stage();


        if (stage) {


            stage.emit('before-copy', {
                type: 'before-copy',
                shape: this
            });


            const props = this.props({
                element: true,
                private: false,
                relative: false
            });


            props.reference = 'stage';


            props.x += 10;
            props.y += 10;


            this.actived = false;


            const shape = stage.load(props, false);


            await stage.add(shape);
            shape.reference = 'view';
            stage.active(shape);


            stage.emit('after-copy', {
                type: 'after-copy',
                shape: this
            });


        } else {
            return false;
        }

    }
    ,


    adjustX(gap = 1) {


        if (!this._group) {
            this.emit("before-adjust", {type: 'before-adjust', shape: this, direction: 'x'});
        }

        this.x += gap;


        if (!this._group) {
            this.emit("after-adjust", {type: 'after-adjust', shape: this, direction: 'x'});
        }


        this.render();


    }
    ,


    adjustY(gap = 1) {


        if (!this._group) {
            this.emit("before-adjust", {type: 'before-adjust', shape: this, direction: 'y'});
        }


        this.y += gap;


        if (!this._group) {
            this.emit("after-adjust", {type: 'after-adjust', shape: this, direction: 'y'});
        }

        this.render();


    },


    flipX() {


        if (!this._group) {
            this.emit("before-flip", {type: 'before-flip', shape: this, direction: 'x'});
        }


        this.flip.x = this.flip.x * -1;


        if (!this._group) {
            this.emit("after-flip", {type: 'after-flip', shape: this, direction: 'x'});
        }


        this.render();
    }
    ,


    flipY() {


        if (!this._group) {
            this.emit("before-flip", {type: 'before-flip', shape: this, direction: 'y'});
        }


        this.flip.y = this.flip.y * -1;


        if (!this._group) {
            this.emit("after-flip", {type: 'after-flip', shape: this, direction: 'y'});
        }


        this.render();
    }
    ,


    group(group) {
        this._group = group;
    }
    ,


    ungroup(adjust = true) {


        this._group.remove(this, true, adjust);
        this._group = null;


        this.stage().pauseEvent('before-add');

        this.stage().add(this);

        this.stage().resumeEvent('before-add');
    }
    ,


    setAttr(attr, value) {
        this[attr] = value;
        this.render();
    }
    ,


    getCenterPoint() {
        let {x, y, w, h} = this.bound();
        return {x: x + w / 2, y: y + h / 2};
    }
    ,


    getReferCenterCoords(newCenter) {


        const center = this.getCenterPoint(true);

        return {
            x: this.x + (newCenter.x - center.x),
            y: this.y + (newCenter.y - center.y),
        }
    }

}
