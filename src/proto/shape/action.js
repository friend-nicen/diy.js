import getVectorCenter from "../../utils/vector";
import {toFixed} from "../../utils/math";


export default {

    
    move(coords, offset) {


        
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


        
        this.x = x - offset.x;
        this.y = y - offset.y;


        
        this.render();
        return true;
    },


    
    scale(zoom, coords) {


        
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
    },


    
    rotate(rad, coords) {

        
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
    },


    
    tap(coords) {

        
        this.emit("tap", {type: 'tap', coords, shape: this});
        this.stage().emit("tap", {type: 'tap', coords, shape: this});


        
        if (this.actived && this._action && this._acting) {
            
            this._action.tap(coords);
            
            this.render();
            
            return this.actived;
        }

        
        this.toggle();
        
        this.render();
        
        return this.actived;
    },

    
    up(coords) {

        this._startAgree = null; 
        this._startBound = null; 

        
        if (this.actived && this._action && this._acting) {
            
            this._action.up(coords);
            
            this.render();
        }


        
        if (!!this._group) return; 
        this.emit("up", {type: 'up', coords, shape: this});
        this.stage().emit("up", {type: 'up', coords, shape: this});
    },


    
    export(param = {}) {
        return this.stage().export(Object.assign({
            elem: ['custom'],
            view: false
        }, param), {
            custom: [this]
        })

    }
}