
import Shape from "../../proto/shape";
import getVectorCenter, {getBoundingBox, radToDegree, reverseRotatePoint, rotateVector} from "../../utils/vector";
import {percentToValue, toFixed} from "../../utils/math";



export default class Group extends Shape {

    
    constructor(config = {}) {

        
        super(Object.assign({
            x: null, 
            y: null, 
            w: null, 
            h: null, 
            shapes: [], 
            type: "Group", 
            canFlip: true, 
            ratio: 1, 
            button_2_Text: "解除",
            canDo: true, 
            fit: false, 
            rule: "bind", 
            _activeChild: null, 
            
            flip: {
                x: 1,
                y: 1
            },
            _inited: false,
            _initedBound: false, 
        }, config));

    }


    
    each(config) {
        
        for (let i in config) {
            
            if (i === 'shapes') {
                for (let k = 0; k < config[i].length; k++) {
                    this.shapes[k].each(config[i][k]);
                }
            } else {
                this[i] = config[i];
            }
        }
    }


    
    async _init() {

        
        if (this._context) {

            
            if (this.shapes.length === 0) {
                this.destroy(true);
            }


            
            this.shapes = this.shapes.filter(shape => {
                return shape.type !== "Group";
            });

            const that = this; 
            const bound = that.getReference();

            
            if (that.x) {
                that.x = percentToValue(this.x, bound._w) + bound._x;
            }
            if (that.y) {
                that.y = percentToValue(this.y, bound._h) + bound._y;
            }
            if (that.w) {
                that.w = percentToValue(this.w, bound._w);
            }
            if (that.h) {
                that.h = percentToValue(this.h, bound._h);
            }


            
            if (this.w && !this.h) {
                this.h = this.w / this.ratio
            }

            
            if (!this.w && this.h) {
                this.w = this.h * this.ratio
            }

            
            if (this.w && this.h && this.fit) {

                
                if (this.w > bound._w) {
                    this.w = bound._w;
                    this.h = this.w / this.ratio;
                }

                
                if (this.h > bound._h) {
                    this.h = bound._h;
                    this.w = this.h * this.ratio;
                }

                
                this.x = (bound._w - this.w) / 2 + bound._x;
                this.y = (bound._h - this.h) / 2 + bound._y;
            }


            const shapes = []; 
            const task = [];  

            
            let is_shape = false; 


            
            
            
            for (let shape of this.shapes) {

                
                if (!shape.constructor || shape.constructor.name === 'Object') {


                    shape = this.stage().load(shape, false);

                    
                    shape.each({
                        _stage: this.stage(),
                        _context: this.getContext(),
                        _group: this,
                        actived: false, 
                        clicked: false, 
                    });

                    
                    task.push(shape.init());

                } else {


                    
                    shape.destroy(true);

                    
                    shape.each({
                        _stage: this.stage(),
                        _context: this.getContext(),
                        actived: false, 
                        clicked: false, 
                    });

                    
                    shape.group(this);

                    
                    is_shape = true;
                }

                shapes.push(shape);
            }

            
            if (task.length > 0) {
                await Promise.all(task);
            }


            
            this.shapes = shapes;

            
            if (is_shape) {

                
                this._adjust();

                
                const center = this.getCenterPoint();

                
                for (let i of this.getShapes(true)) {

                    
                    const coords = reverseRotatePoint(
                        i.getCenterPoint(),
                        radToDegree(i.rotateRadius),
                        center
                    );

                    
                    const newCoords = i.getReferCenterCoords(coords);

                    
                    i.adjustX(newCoords.x - i.x);
                    i.adjustY(newCoords.y - i.y);

                    
                    if (i.type === 'Text') {
                        i.updateBound();
                    }

                }

            }


            
            this._inited = true;
            this.fit = false; 

            
            this.ratio = toFixed(this.w / this.h, 4);

            
            if (this.rule === 'unbind') {
                this.unbind();
            }


            
            this.emit('loaded', {
                shape: this,
                type: 'loaded'
            });


            this.render(); 
        }


    }


    
    clickText(x, y, flag = false, coords = []) {

        
        for (const i of this.shapes ) {

            
            if (i.type !== 'Text') {
                continue;
            }

            if (i) {
                
                if (i.click(x, y, flag, coords)) {

                    
                    this.stage().emit("click-group-text", {
                        type: 'click-group-text',
                        group: this,
                        shape: i
                    });


                    
                    this._activeChild = i;

                    return true;
                }
            }
        }


        
        this._activeChild = null;
    }


    
    _draw() {

        
        if (!this._inited) return;

        
        const context = this._context;

        let {
            x,
            y,
            w,
            h
        } = this.bound(); 

        context.beginPath();
        this._rotate(); 

        context.rect(x, y, w, h);
        context.closePath();
    }


    
    getCenterPoint() {
        let {x, y, w, h} = (this._group ? this._group : this).bound();
        return {x: x + w / 2, y: y + h / 2};
    }


    
    _rotate(ctx = null) {

        
        const context = ctx ? ctx : this.getContext(); 

        
        const rectCenterPoint = this.rotateAroundCenter ? this.getCenterPoint() : {x: this.x, y: this.y}; 

        
        if (this.rotateRadius !== 0) {
            context.translate(rectCenterPoint.x, rectCenterPoint.y);
            context.rotate(this.rotateRadius); 
            context.translate(-rectCenterPoint.x, -rectCenterPoint.y);
        }

    }


    
    draw(flag = true) {

        
        if (!this.shapes.length || !this._inited) return false;

        
        for (const i of this.shapes ) {
            if (i) {
                i.bindContext(this._context);
                i.draw();
            }
        }


        
        
        
        
        if (flag && this.actived) {
            const that = this; 
            
            if (this.queue) {
                this.stage().addQueueTask(() => {
                    that._action.draw(); 
                })
            } else {
                that._action.draw(); 
            }
        }


    }


    
    move(coords, offset) {


        
        if (!this._inited) return;

        
        if (coords.length > 1) {
            return false;
        }

        
        const {
            x,
            y
        } = coords[0];


        
        if (x === this._previous.x && y === this._previous.y) {
            return false;
        }


        
        this._previous.x = x;
        this._previous.y = y;

        
        if (this.actived && this._action && this._acting) {
            
            this._action.move(coords, offset);
            
            this.render();
            return true;
        }


        
        this.emit("move", {type: 'move', coords, offset, shape: this});
        this.stage().emit("move", {type: 'move', coords, offset, shape: this});

        
        let _x = x - offset.x;
        let _y = y - offset.y;

        
        let translateX = _x - this.x;
        let translateY = _y - this.y;


        
        for (const i of this.shapes ) {
            if (i) {
                i.adjustX(translateX);
                i.adjustY(translateY);
            }
        }


        
        this.x = _x;
        this.y = _y;


        
        this.render();
        return true;
    }


    
    scale(zoom, coords) {

        
        if (!this._inited) return;


        
        for (const i of this.shapes ) {
            if (i) {
                i.scale(zoom, coords);
            }
        }


        
        if (!this._startBound) {

            
            const center = this.stage().getLimit() && coords.length > 1 ? getVectorCenter(coords[0], coords[1]) : (!!this._group ? this._group.getCenterPoint() : {
                x: this.x + this.w / 2,
                y: this.y + this.h / 2
            });

            
            this._startBound = {
                w: this.w,
                h: this.h,
                x: this.x,
                y: this.y,
                centerX: center.x,
                centerY: center.y
            };
        }


        
        zoom = toFixed(zoom, 2);

        
        const {x, y, w, h, centerX, centerY} = this._startBound;

        this.x = centerX - (centerX - x) * zoom;
        this.y = centerY - (centerY - y) * zoom;

        this.w = w * zoom;
        this.h = h * zoom;

        
        this.emit("scale", {type: 'scale', coords, zoom, shape: this});
        this.stage().emit("scale", {type: 'scale', coords, zoom, shape: this});


        
        this.render();
        return true;
    }


    
    rotate(rad, coords) {

        
        if (!this._inited) return;


        
        for (const i of this.shapes ) {
            if (i) {
                i.rotate(rad, coords);
            }
        }


        
        if (coords.length === 1) {

            
            if (!this._startAgree) {
                this._startAgree = this.rotateRadius;
            }

            this.rotateRadius = (this._startAgree + rad);

        } else {

            
            const config = this.stage().getConfig();

            
            if (Math.abs(rad - this.rotateRadius) > config.minRotatable) {
                this.rotateRadius += rad / (100 - config.sensitivity); 
            }
        }


        
        this.emit("rotate", {type: 'rotate', coords, rad, shape: this});
        this.stage().emit("rotate", {type: 'rotate', coords, rad, shape: this});

        
        this.render();
        return true;
    }


    
    tap(coords) {

        
        if (!this._inited) return;

        
        this.emit("tap", {type: 'tap', coords, shape: this});
        this.stage().emit("tap", {type: 'tap', coords, shape: this});


        
        if (this.actived && this._action && this._acting) {
            
            this._action.tap(coords);
            
            this.render();
            
            return this.actived;
        }

        
        if (this.actived) {
            if (this.clickText(coords.x, coords.y, false, [coords])) {
                
                return this.actived;
            }
        }


        
        this.toggle();
        
        this.render();
        
        return this.actived;
    }

    
    up(coords) {

        
        if (!this._inited) return;

        
        for (const i of this.shapes ) {
            if (i) {
                i.up(coords);
            }
        }


        this._startAgree = null; 
        this._startBound = null; 

        
        if (this.actived && this._action && this._acting) {
            
            this._action.up(coords);
            
            this.render();
        }


        
        if (!!this._group) return; 

        this.emit("up", {type: 'up', coords, shape: this});
        this.stage().emit("up", {type: 'up', coords, shape: this});
    }


    
    flipX() {


        
        if (!this._group) {
            this.emit("before-flip", {type: 'before-flip', shape: this, direction: 'x'});
        }

        this.flip.x = this.flip.x * -1;

        
        for (const i of this.shapes ) {
            if (i) {
                i.flipX();
            }
        }


        
        if (!this._group) {
            this.emit("after-flip", {type: 'after-flip', shape: this, direction: 'x'});
        }


        this.render();
    }


    
    flipY() {

        
        if (!this._group) {
            this.emit("before-flip", {type: 'before-flip', shape: this, direction: 'y'});
        }


        this.flip.y = this.flip.y * -1;

        
        for (const i of this.shapes ) {
            if (i) {
                i.flipY();
            }
        }


        
        if (!this._group) {
            this.emit("after-flip", {type: 'after-flip', shape: this, direction: 'y'});
        }


        this.render();
    }


    
    coords(corner = null) {

        const coords = [
            {x: this.x, y: this.y},
            {x: this.x + this.w, y: this.y},
            {x: this.x, y: this.y + this.h},
            {x: this.x + this.w, y: this.y + this.h},
            {x: this.x + (this.w / 2), y: this.y},
            {x: this.x + this.w, y: this.y + (this.h / 2)},
            {x: this.x, y: this.y + (this.h / 2)},
            {x: this.x + (this.w / 2), y: this.y + (this.h / 2)}
        ]

        if (corner === null) {
            return coords;
        } else {
            return coords[corner];
        }

    }


    
    bound() {
        return {
            x: this.x,
            y: this.y,
            w: this.w,
            h: this.h
        }
    }


    
    relative() {

        
        const bound = this.getReference();

        return {
            x: (((this.x - bound._x) / bound._w) * 100).toFixed(2) + "%",
            y: (((this.y - bound._y) / bound._h) * 100).toFixed(2) + "%",
            w: null,
            h: ((this.h / bound._h) * 100).toFixed(2) + "%"
        }

    }


    
    adjustX(gap = 1) {

        
        if (!this._group) {
            this.emit("before-adjust", {type: 'before-adjust', shape: this, direction: 'x'});
        }

        
        for (const i of this.shapes ) {
            if (i) {
                i.x += gap;
            }
        }

        this.x += gap;

        
        if (!this._group) {
            this.emit("after-adjust", {type: 'after-adjust', shape: this, direction: 'x'});
        }

        this.render();
    }


    
    adjustY(gap = 1) {

        
        if (!this._group) {
            this.emit("before-adjust", {type: 'before-adjust', shape: this, direction: 'y'});
        }


        
        for (const i of this.shapes ) {
            if (i) {
                i.y += gap;
            }
        }

        this.y += gap;


        
        if (!this._group) {
            this.emit("after-adjust", {type: 'after-adjust', shape: this, direction: 'y'});
        }


        this.render();
    }


    
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
                relative: false,
                ignore: ['shapes']
            });


            
            props.shapes = this.shapes.map(item => {

                
                const props = item.props(
                    {
                        element: true, 
                        private: false, 
                        relative: false
                    }
                );

                
                props.x += 10;
                props.y += 10;

                return props;
            });

            
            props.reference = 'stage';

            
            props.x += 10;
            props.y += 10;

            
            this.actived = false;
            props.fit = false;

            
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


    
    _adjust() {
        
        Object.assign(this, getBoundingBox(this.shapes.map(shape => {
            return shape.bound();
        })));
    }


    
    unbind() {


        
        this.stage().emit('before-unbind', {
            type: 'before-unbind',
            shape: this
        });


        
        const center = this.getCenterPoint();

        
        for (let i of this.getShapes(true)) {


            
            if (i.type === 'Text') {
                i.updateBound();
            }

            
            i.ungroup(false);


            
            const coords = rotateVector(
                i.getCenterPoint(),
                radToDegree(i.rotateRadius),
                center
            );


            
            const newCoords = i.getReferCenterCoords(coords);

            
            i.adjustX(newCoords.x - i.x);
            i.adjustY(newCoords.y - i.y);

        }

        
        this.destroy(true);


        
        this.stage().emit('after-unbind', {
            type: 'after-unbind',
            shape: this
        });
    }


    
    getShapes(flag = false, index = -1) {

        
        if (index === -1) {

            if (flag) {
                return this.shapes.map(item => {
                    return item;
                });
            } else {
                return this.shapes;
            }

        } else {
            if (typeof index === "number") {
                return this.shapes[index] ? this.shapes[index] : null;
            } else if (typeof index === 'string') {
                for (let i of this.shapes) {
                    if (i.name === index) {
                        return i;
                    }
                }
            }
        }

    }


    
    getShapeIndex(shape) {
        return this.shapes.indexOf(shape);
    }


    
    remove(shape, flag = false, adjust = false) {

        
        if (flag) {

            const index = this.shapes.indexOf(shape);

            if (index > -1) {
                this.shapes.splice(index, 1);
            }

            
            if (adjust) this._adjust();
            return true;
        }

        
        if (!shape) return false;
        if (!shape.canRemove) return false;


        
        this.stage().emit("before-delete", {type: 'before-delete', shape});

        
        this.shapes = this.shapes.filter(function (elem) {

            
            if (!elem.canRemove) {
                return true;
            }

            
            if (typeof shape == "string") {
                return elem.name !== shape;
            } else {
                return elem !== shape;
            }
        });


        
        this.stage().emit("after-delete", {type: 'after-delete', shape});

        
        if (adjust) this._adjust();

        
        this.render(); 
    }


    
    save() {
        return {
            props: this.props(),
            shapes: this.getShapes(true)
        }
    }

    
    restore(snap) {
        this.shapes = snap.shapes;
        this.each(snap.props);
    }


    
    getActive() {
        return this._activeChild;
    }


    
    group(group) {
        this._group = group;
    }


    
    ungroup(adjust = true) {

        
        this._group.remove(this, true, adjust);
        this._group = null;

        
        this.stage().pauseEvent('before-add');
        
        this.stage().add(this);
        
        this.stage().pauseEvent('before-add');
    }


}