import BetterGesture from "../utils/gesture";
import {debounce, getEnd, getPosOfEvent} from "../utils/common";
import {scaleVector} from "../utils/vector";
import {drawText, roundRect, textBound} from "../utils/draw";


export default {


    _init() {

        this._initBound();
        this._initStyle();
        this._initCanvas();
        this._initModel();
        this._initGesTure();
        this._initEvent();

        this.emit("init", {type: 'init'});


        if (this._mode === "auto") {
            this._global.requestAnimationFrame(() => this._render(true));
        }
    },


    _initStyle() {
        const bound = this.bound();
        const style = document.createElement('style');
        const styleText = `.diyjs canvas {position: absolute;transform: translateZ(0);width:${bound._w}px;height: ${bound._h}px;left: 0;top: 0; }`;
        style.appendChild(document.createTextNode(styleText));
        document.head.appendChild(style);
    },


    _initBound() {

        this._elem.classList.add("diyjs");
        
        const bound = this._elem.getBoundingClientRect();


        this._offset = {
            x: bound.x,
            y: bound.y
        }


        this.$offset = {
            x: bound.x,
            y: bound.y
        }


        this._bound = {
            x: 0,
            y: 0,
            w: Math.round(bound.width * this._dpr),
            h: Math.round(bound.height * this._dpr),
            _x: 0,
            _y: 0,

            _w: bound.width,
            _h: bound.height
        }
    },


    _initCanvas() {


        const bound = this.bound()


        const custom = this.createCanvas(bound.w, bound.h, true, {
            zIndex: 20
        });


        Object.assign(this._custom, {
            elem: custom.elem,
            context: custom.context
        })


        if (this._useBuffer) {

            const buffer = this.createCanvas(bound.w, bound.h);

            Object.assign(this._custom, {
                bufferElem: buffer.elem,
                bufferContext: buffer.context
            })

        }


    },


    _initModel() {


        const bound = this.bound()


        this._model = this.createCanvas(bound.w, bound.h, true, {
            zIndex: 10,
            backgroundColor: "#f6f6f6"
        });

        this._model.shapes = [];

    },


    _iniCanvasProxy(canvas, w = null, h = null) {


        const bound = this.bound();


        canvas.reset = () => {
            canvas.width = w ? w : bound.w;
            canvas.height = h ? h : bound.h;
        }


        canvas.size = (w, h) => {
            canvas.width = w;
            canvas.height = h;
        }

        canvas.reset();
    },


    _iniContextProxy(context) {


        const that = this;

        context._dpr = that._dpr;


        const save = context.save;


        context.enableImageSmoothingEnabled = function () {
            context.imageSmoothingEnabled = true;
            context.mozImageSmoothingEnabled = true;
            context.webkitImageSmoothingEnabled = true;
            context.msImageSmoothingEnabled = true;
        }


        context.disableImageSmoothingEnabled = function () {
            context.imageSmoothingEnabled = false;
            context.mozImageSmoothingEnabled = false;
            context.webkitImageSmoothingEnabled = false;
            context.msImageSmoothingEnabled = false;
        }


        context.save = function (flag = true) {


            save.apply(this);

            if (flag) {
                this.scale(this._dpr, this._dpr);
            }
        };


        context.copy = function (canvas) {
            this.drawImage(canvas, 0, 0);
        }


        context.clear = function () {
            this.beginPath();
            this.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.closePath();
        }


        context.dpr = function (dpr) {
            this._dpr = dpr;
        };


        context.resetDpr = function () {
            this._dpr = that._dpr;
        };


        context.roundCornerRect = function (x, y, w, h, r = 5) {
            return roundRect(this, x, y, w, h, r)
        }


        context.drawText = function (config) {
            return drawText(this, config)
        }


        context.textBound = function (config) {
            return textBound(this, config)
        }


    },


    _initGesTure() {

        const that = this;

        this._gesture = new BetterGesture(this._custom.elem, {

            start(evt) {

                that.emit("start", {type: 'start', coords: evt});


                const coords = that.filterCoords(getPosOfEvent(evt));

                that._startPoint = coords[0];
                that._eventTouch(coords);
            },

            end(evt) {


                const coords = that.filterCoords(getEnd(evt));


                if (that._startPoint && coords.length === 1) {

                    if (Math.abs(coords[0].x - that._startPoint.x) < 5 && Math.abs(coords[0].y - that._startPoint.y) < 5) {

                        that._eventTouch(coords, true);
                    }
                }


                that._eventUp(coords);
            },

            pressMove(evt) {
                that._eventMove(that.filterCoords(getPosOfEvent(evt)));
            },

            rotate(evt) {
                that._eventRotate(evt.angle, that.filterCoords(getPosOfEvent(evt)));
            },

            pinch(evt) {
                that._eventPinch(evt.zoom, that.filterCoords(getPosOfEvent(evt)));
            },

            doubleTap(evt) {
                that.emit("doubleTap", {type: 'doubleTap', coords: that.filterCoords(getPosOfEvent(evt))})
            }
        });
    },


    _initEvent() {

        const that = this;

        this._custom.elem.addEventListener('mouseleave', (evt) => {

            const coords = that.filterCoords(getEnd(evt));

            that._eventUp(coords);
        });

        this._global.addEventListener('resize', debounce(() => {
            that._initBound();
            this._gesture.destroy();
            that._initGesTure();
        }, 200));
    },


    _eventTouch(coords, isTap = false) {


        let changed = 0;
        this._clicked = null;

        const shapes = this.shapes();


        for (const p of coords) {


            let {x, y} = scaleVector(p, this._dpr);


            for (let k = shapes.length - 1; k >= 0; k--) {


                let i = shapes[k];


                let clicked = i.clicked;


                if (!this._clicked) {

                    if (i.click(x, y, false, coords)) {

                        changed++;
                        this._clicked = i;


                        if (isTap) {


                            if (i.tap({x, y})) {

                                if (this._actived !== i) {
                                    this._actived = i;
                                }
                            } else {

                                this._actived = null;
                            }

                        }
                    } else {

                        if (isTap && !this._multiActive) {
                            this._actived = null;
                            i.deactivate(false);
                        }
                    }
                } else {

                    i.click(x, y, false);

                    if (isTap && !this._multiActive) {
                        i.deactivate(false);
                    }
                }


                if (i.clicked !== clicked) {
                    changed++;
                }
            }


            if (this._clicked) {
                break;
            }

        }


        if (!this._clicked && !this._actived && !this._multiActive) {
            this.emit("click-blank", {type: 'click-blank'});
            this.emit("deactivate", {type: 'deactivate', shape: this.shapes()});
        }


        if (this._mode === 'event') {
            if (changed > 0) {
                this._loop = true;
                this._render();
            }
        }

    },


    _eventMove(coords) {


        if (coords.length > 2) return;


        const handler = this.getHandler();


        if (handler) {


            if (!handler.canMove) return;


            let {x, y} = coords[0];


            if (!this._isMoving) {


                this._startOffset = {
                    x: x - handler.x,
                    y: y - handler.y
                };


                this._isMoving = true;
            }


            handler.move([{x, y}], this._startOffset);

        }
    },


    _eventPinch(zoom, coords) {

        if (coords.length > 2) return;


        const handler = this.getHandler();


        if (handler) {

            if (!handler.canScale) return;

            handler.scale(zoom, coords);
        }
    },


    _eventRotate(rad, coords) {


        if (coords.length > 2) return;


        const handler = this.getHandler();


        if (handler) {

            if (!handler.canRotate) return;

            handler.rotate(rad, coords);
        }
    },


    _eventUp(coords) {


        this._isMoving = false;


        this.emit("end", {coords});


        const handler = this.getHandler();


        if (handler) {

            if (!handler.canUp) return;
            handler.up(coords);
        }


        if (this._mode === 'event') {
            this._loop = false;
        }

    },


    _render(flag = true) {


        if (this._stop) return;


        if (this._new || !flag) {


            this._new = false;


            this.getContext().clear();
            this.getContext().closePath();


            if (this._view.shape && this._view.shape.clip) {

                this._view.shape.stokeOutline();

                for (const i of this.shapes()) {
                    i.draw();
                }
            } else {

                for (const i of this.shapes().concat(this._view.shape ? [this._view.shape] : [])) {
                    i.draw();
                }
            }


            if (this.getQueue().length > 0) {

                for (const task of this.getQueue()) {
                    task();
                }

                this.clearQueue();
            }


            if (this._useBuffer) {

                this._custom.context.clear();

                this._custom.context.copy(this._custom.bufferElem);
            }


        }


        if (this._loop && flag) {
            this._global.requestAnimationFrame(() => this._render(flag));
        }
    },


    getHandler() {
        return this._limit ? this._clicked : this._actived;
    },


    getLimit() {
        return this._limit;
    }
}