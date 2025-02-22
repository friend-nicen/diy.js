
import iScale from './icon/scale.png';
import iRotate from './icon/rotate.png';
import iClear from './icon/clear.png';

import Clear from './clear'
import Rotate from './rotate'
import Scale from './scale'
import Do from "../../shape/action/do";
import {loadImage} from "../../utils/common";



export default class Action {

    
    constructor(config = {}) {
        
        Object.assign(this, {
            
            active: null,
            
            shape: null,
            
            action: [],
            
            gap: 3
        }, config);


        
        if (this.shape.canRemove) {
            loadImage(iClear, (clear) => {
                
                this.action.push(new Clear({
                    image: clear,
                    corner: 0,
                    shape: this.shape
                }));
                
                this.shape.render();
            });
        }


        
        if (this.shape.canRotate) {
            loadImage(iRotate, (rotate) => {
                
                this.action.push(new Rotate({
                    image: rotate,
                    corner: 5,
                    text: '替换',
                    shape: this.shape
                }));
                
                this.shape.render();
            });
        }


        
        if (this.shape.canScale) {
            loadImage(iScale, (scale) => {
                
                this.action.push(new Scale({
                    image: scale,
                    corner: 3,
                    shape: this.shape
                }));
                
                this.shape.render();
            });
        }


        
        if (this.shape.canDo) {
            
            this.action.push(new Do({
                corner: 1,
                shape: this.shape
            }));
            
            this.shape.render();
        }
    }


    
    draw() {

        
        if (!this.shape) return false;

        
        let {
            x,
            y,
            w,
            h
        } = this.shape.bound();


        
        const context = this.shape.getContext();
        
        const config = this.shape.stage().getConfig();


        
        context.beginPath();
        
        context.save(true);

        
        this.shape._rotate();

        
        context.strokeStyle = config.activeColor;
        context.lineWidth = 2;
        context.lineCap = "round";
        context.lineJoin = "round";

        
        const gap = this.gap;
        context.strokeRect(x - gap, y - gap, w + gap * 2, h + gap * 2);

        
        context.closePath();
        context.restore();

        
        for (const i of this.action ) {
            if (i) {
                i.draw();
            }
        }

    }


    
    click(x, y) {

        this.active = null; 

        
        for (const i of Object.values(this.action)) {
            
            if (!this.active) {
                if (i && i.click(x, y)) {
                    this.active = i; 
                    return true;
                }
            }
        }

        return false;
    }


    
    move(coords, offset) {
        this.active.move(coords, offset);
    }


    
    tap(coords) {
        this.active.tap(coords);
    }


    
    up(coords) {
        this.active.up(coords);
    }

}