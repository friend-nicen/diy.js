



import Shape from "../../proto/shape";
import {percentToValue} from "../../utils/math";
import {loadImage} from "../../utils/common";




export default class Image extends Shape {

    
    constructor(config = {}) {

        
        super(Object.assign({
                x: null, 
                y: null, 
                w: null, 
                h: null, 
                url: null, 
                originWidth: null, 
                originHeight: null, 
                image: null, 
                type: "Image", 
                button_2_Text: "替换",
                canDo: true, 
                canFlip: true, 
                
                flip: {
                    x: 1,
                    y: 1
                }
            },
            config
        ))
        ;


        
        this._initImage(config);
    }

    
    _initImage(config) {

        
        if (config.image) {
            
            this.image = config.image;
            
            this.url = config.image.src;
            
            return;
        }


        
        if (config.url) {

            this.url = config.url; 

            loadImage(config.url, (image) => {
                
                this.image = image;

                
                this.originWidth = null;
                this.originHeight = null;

                
                this.emit("loaded", {type: 'loaded', shape: this});

            }, () => {
                this.destroy();
            })


        }
    }


    
    _initCoords() {

        
        let {
            width,
            height
        } = this.image;


        
        this.originWidth = width;
        this.originHeight = height;

        


        

        
        const bound = this.getReference();
        
        const config = this.stage().getConfig();


        
        let maxWidth = width < config.maxWidth ? width : config.maxWidth;
        let maxHeight = height < config.maxHeight ? height : config.maxHeight;


        
        if (this.w === null && this.h === null) {
            
            if (bound._w <= bound._h) {
                this.w = maxWidth;
                this.h = this.w * (height / width);
            } else {
                this.h = maxHeight;
                this.w = (this.h * (width / height));
            }
        }


        
        if (this.w === null && this.h) {
            this.w = (this.h * (width / height));
        }

        
        if (this.w && this.h === null) {
            this.h = this.w * (height / width);
        }


        
        this.x = this.x !== null ? this.x : ((bound._w - this.w) / 2 + bound._x);
        this.y = this.y !== null ? this.y : ((bound._h - this.h) / 2 + bound._y);


        
        if (!this._colorBound && this.outline) {
            this.initColorBound();
        }


    }


    
    _updateCoords() {

        
        let {
            width,
            height
        } = this.image;


        
        this.originWidth = width;
        this.originHeight = height;

        
        if (this.w > this.h) {
            this.h = this.w * (height / width);
        } else {
            this.w = this.h * (width / height);
        }


        
        if (this.outline) {
            this.initColorBound();
        }


    }

    
    _init() {

        const that = this;

        
        if (that._context) {
            
            const bound = that.getReference();
            
            if (that.x && (typeof this.x) === 'string') {
                that.x = percentToValue(this.x, bound._w) + bound._x;
            }
            if (that.y && (typeof this.y) === 'string') {
                that.y = percentToValue(this.y, bound._h) + bound._y;
            }
            if (that.w && (typeof this.w) === 'string') {
                that.w = percentToValue(this.w, bound._w);
            }
            if (that.h && (typeof this.h) === 'string') {
                that.h = percentToValue(this.h, bound._h);
            }
        }

        return new Promise(resolve => {


            
            
            if (this._context && that.image) {

                
                
                if (!that.originWidth || !that.originHeight) {
                    that._initCoords();
                }

                that.render(); 
                resolve(); 

            } else {
                
                that.on("loaded", () => {
                    that._init();
                    that.removeAlllistener("loaded");
                    resolve();
                }, true); 
            }
        })
    }


    
    getFlip() {
        if (!this.canFlip) {
            return 0;
        } else if (this.flip.x < 0 && this.flip.y > 0) {
            return 1;
        } else if (this.flip.x > 0 && this.flip.y < 0) {
            return 2;
        } else if (this.flip.x < 0 && this.flip.y < 0) {
            return 3;
        } else {
            return 0;
        }
    }


    
    _flip() {
        
        if (this._context && this.canFlip) {
            this._context.scale(this.flip.x, this.flip.y);
        }
        
        return this.getFlip();
    }


    
    _getFlip() {

        
        const flip = this.getFlip();
        const {x, y, w, h} = this.bound();

        
        if (flip === 0) {
            return {
                _x: x,
                _y: y
            }
        } else if (flip === 1) {
            return {
                _x: -x - w,
                _y: y
            }
        } else if (flip === 2) {
            return {
                _x: x,
                _y: -y - h
            }
        } else if (flip === 3) {
            return {
                _x: -x - w,
                _y: -y - h
            }
        }

    }


    
    _draw() {

        
        if (!this.image) return;

        
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


    
    _rotate(ctx = null) {

        let {
            x,
            y,
            w,
            h
        } = this;


        
        const context = ctx ? ctx : this.getContext(); 

        
        const rectCenterPoint = !!this._group ? this._group.getCenterPoint() : (this.rotateAroundCenter ? {
            x: x + w / 2,
            y: y + h / 2
        } : {x: this.x, y: this.y}); 

        
        if (this.rotateRadius !== 0) {
            context.translate(rectCenterPoint.x, rectCenterPoint.y);
            context.rotate(this.rotateRadius); 
            context.translate(-rectCenterPoint.x, -rectCenterPoint.y);
        }

    }

    
    update(config) {
        
        if (!this.canDo) return;

        
        this.on("loaded", () => {
            this._updateCoords();
            this.removeAlllistener("loaded");
            this.render(); 
        }, true); 

        
        this._initImage(config);
        
        this.render();
    }


    
    stokeOutline() {


        
        if (!this.outline) return;

        
        
        const context = this._context; 

        
        context.beginPath();
        
        context.save();

        
        if (context.setViewClip) context.setViewClip();


        
        this._rotate();
        this._flip(); 

        this._stokeOutline();

        
        context.closePath();
        
        context.restore();


    }

    
    _stokeOutline() {

        
        
        const context = this._context; 


        
        if (!this._colorBound) {
            this.initColorBound();
        }

        
        if (this.canShowOutline()) {
            
            context.globalCompositeOperation = "source-over";
            context.strokeStyle = this.stage().getConfig().themeColor;
            context.setLineDash([2, 3]);
            context.lineWidth = 1;
            context.lineCap = "round";
            context.lineJoin = "round";
            context.strokeRect(this._colorBound._x + 1, this._colorBound._y + 1, this._colorBound._w - 2, this._colorBound._h - 2);
        }
    }

    
    draw(flag = true) {

        
        if (!this.image) return;

        
        
        const context = this._context; 

        let {
            w,
            h
        } = this;

        
        context.beginPath();
        
        context.save();

        
        if (context.setViewClip) context.setViewClip();

        
        this._rotate();
        this._flip(); 

        
        context.globalCompositeOperation = this.blendMode;

        
        const {_x, _y} = this._getFlip();

        context.drawImage(this.image, _x, _y, w, h);

        
        if (this.outline && flag) {
            this._stokeOutline();
        }


        
        context.closePath();
        
        context.restore();


        
        
        
        
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
            w: ((this.w / bound._w) * 100).toFixed(2) + "%",
            h: null,
        }

    }


    
    initColorBound() {
        
        this._colorBound = this.ColorBound();
        return this._colorBound;
    }

}