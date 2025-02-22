

import Shape from "../../proto/shape";
import getVectorCenter from "../../utils/vector";
import {percentToValue} from "../../utils/math";


export default class Text extends Shape {

    
    constructor(config = {}) {

        
        super(Object.assign({

            
            x: null, 
            y: null, 

            button_2_Text: "编辑",
            canDo: true, 
            canFlip: true, 

            
            _bound: {
                x: null, 
                y: null, 
                w: null, 
                h: null, 
            },

            
            flip: {
                x: 1,
                y: 1
            },

            
            maxWidth: 50,
            maxHeight: 50,

            text: "",
            fontSize: 16,
            fontFamily: "Arial",
            textColor: "rgba(54,54,54,0.9)",

            bold: false,
            italic: false,
            textDecoration: false,


            textBaseline: "middle",
            textAlign: "center",
            background: true,
            cornerRadius: 5,
            backgroundColor: "transparent",
            border: 0,
            borderColor: "#000000",
            padding: {
                top: 6,
                bottom: 6,
                left: 6,
                right: 6,
            },
            direction: "horizontal",
            maxLineWidth: null,
            letterSpacing: 0,
            lineSpacing: 0,
            spacingLeft: 1,
            spacingTop: 1,
            type: "Text" 
        }, config));


    }


    
    _init() {

        
        if (this._context) {

            const bound = this.getReference();

            
            if (this.x && (typeof this.x) === 'string') {
                this.x = percentToValue(this.x, bound._w) + bound._x;
            }

            if (this.y && (typeof this.y) === 'string') {
                this.y = percentToValue(this.y, bound._h) + bound._y;
            }

            if (this.fontSize && (typeof this.fontSize) === 'string') {
                this.fontSize = percentToValue(this.fontSize, bound._h);
            }

            
            this.x = this.x !== null ? this.x : (bound._w / 2 + bound._x);
            this.y = this.y !== null ? this.y : (bound._h / 2 + bound._y);

            
            if (this.fontFamily !== 'Arial') {
                
                this.stage().emit('use-font', {
                    type: 'use-font',
                    shape: this,
                    fontFamily: this.fontFamily
                })
            }

        }


        
        const that = this;

        
        this.input = (text) => {
            that.text = text;
            that.render();
        };

        
        this.append = (text) => {
            that.text += text;
            that.render();
        };

    }


    
    setFont(font) {
        this.fontFamily = font;
        this.render();
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
        const {x, y, w, h} = this._bound;

        
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


    
    _getFlipText() {

        
        const flip = this.getFlip();
        
        const {x, y} = this;

        
        if (flip === 0) {
            return {
                _x: x,
                _y: y
            }
        } else if (flip === 1) {
            return {
                _x: -x,
                _y: y
            }
        } else if (flip === 2) {
            return {
                _x: x,
                _y: -y
            }
        } else if (flip === 3) {
            return {
                _x: -x,
                _y: -y
            }
        }

    }


    
    _draw() {

        
        const context = this._context;

        let {
            x,
            y,
            w,
            h
        } = this._bound;

        context.beginPath();

        this._rotate(); 

        
        context.rect(x, y, w, h);
        context.closePath();
    }


    
    _rotate() {

        
        const context = this.getContext(); 

        let {
            x, y
        } = !!this._group ? this._group.getCenterPoint() : this.getCenterPoint();

        
        if (this.rotateRadius !== 0) {
            context.translate(x, y);
            context.rotate(this.rotateRadius); 
            context.translate(-x, -y);
        }

    }


    
    scale(zoom, coords) {


        
        if (!this._startBound) {

            
            const center = this.stage().getLimit() && coords.length > 1 ? getVectorCenter(coords[0], coords[1]) : (!!this._group ? this._group.getCenterPoint() : this.getCenterPoint())

            
            this._startBound = {
                x: this.x,
                y: this.y,
                centerX: center.x,
                centerY: center.y,
                fontSize: this.fontSize
            };
        }

        
        const {x, y, centerX, centerY, fontSize} = this._startBound;

        this.x = Math.floor(centerX - (centerX - x) * zoom);
        this.y = Math.floor(centerY - (centerY - y) * zoom);

        this.fontSize = fontSize * zoom;

        
        this.emit("scale", {type: 'scale', coords, zoom, shape: this});
        this.stage().emit("scale", {type: 'scale', coords, zoom, shape: this});

        
        this.render();
        return true;
    }


    
    updateBound() {
        
        this._bound = this._context.textBound(this);
    }


    
    draw(flag = true) {

        
        
        const context = this._context; 

        
        context.beginPath();

        
        context.save();

        
        if(context.setViewClip) context.setViewClip();

        
        context.globalCompositeOperation = this.blendMode;

        
        this._bound = context.textBound(this);

        this._rotate(); 
        this._flip(); 

        const {_x, _y} = this._getFlipText();

        
        context.drawText(Object.assign(this.getConfig(), {
            x: _x,
            y: _y
        }));


        
        if (this.textDecoration) {

            
            let {w, h} = this.bound();
            let {_x, _y} = this._getFlip();


            
            context.beginPath();
            context.strokeStyle = this.textColor;
            context.moveTo(_x + this.padding.left, _y + h - this.padding.bottom);
            context.lineTo(_x + w - this.padding.right, _y + h - this.padding.bottom);
            context.closePath();
            context.stroke();
        }


        
        if (this._group && this._group.actived) {

            
            context.beginPath();

            
            const config = this.stage().getConfig();

            
            let {w, h} = this.bound();
            let {_x, _y} = this._getFlip();


            
            context.strokeStyle = config.activeColor;
            context.setLineDash([2, 3]);
            context.lineWidth = 1;
            context.lineCap = "round";
            context.lineJoin = "round";

            
            const gap = 2;
            context.strokeRect(_x - gap, _y - gap, w + gap * 2, h + gap * 2);
            context.closePath();
        }


        

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

        const {
            x, y, w, h
        } = this._bound;

        const coords = [
            {x: x, y: y},
            {x: x + w, y: y},
            {x: x, y: y + h},
            {x: x + w, y: y + h},
            {x: x + (w / 2), y: y},
            {x: x + w, y: y + (h / 2)},
            {x: x, y: y + (h / 2)},
            {x: x + (w / 2), y: y + (h / 2)}
        ]

        if (corner === null) {
            return coords;
        } else {
            return coords[corner];
        }

    }


    
    bound() {
        return this._bound;
    }


    
    getText() {
        return this.text;
    }


    
    relative() {

        
        const bound = this.getReference();
        this.updateBound(); 

        return {
            x: (((this.x - bound._x) / bound._w) * 100).toFixed(2) + "%",
            y: (((this.y - bound._y) / bound._h) * 100).toFixed(2) + "%",
            maxWidth: ((this.maxWidth / bound._w) * 100).toFixed(2) + "%",
            maxHeight: ((this.maxHeight / bound._h) * 100).toFixed(2) + "%",
            fontSize: ((this.fontSize / bound._h) * 100).toFixed(2) + "%",
        }

    }


    
    getConfig() {

        
        const config = {
            text: "",
            fontSize: 16,
            bold: false,
            italic: false,
            textDecoration: false,
            fontFamily: "Arial",
            textColor: "#ffffff",
            textAlign: "center",
            background: true,
            cornerRadius: 5,
            backgroundColor: "transparent",
            border: 0,
            borderColor: "#000000",
            padding: {
                top: 6,
                bottom: 6,
                left: 6,
                right: 6,
            },
            direction: "horizontal",
            maxLineWidth: null,
            letterSpacing: 0,
            lineSpacing: 0,
            x: 0,
            y: 0,
            _bound: null,
            spacingLeft: 1,
            spacingTop: 1
        };

        
        for (let i in config) {
            if (!!this[i]) {
                config[i] = this[i];
            }
        }


        return config;
    }


}