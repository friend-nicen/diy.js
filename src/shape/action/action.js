



export default class Action {


    
    constructor(config) {
        
        Object.assign(this, {
            image: null,
            corner: null,
            blendMode: 'source-over', 
            gap: 3,
            w: 24,
            h: 24,
            shape: null,
            strokeStyle: "#e3e3e3",
            canActive: false,
            canRemove: false,
            canRotate: false,
            canScale: false,
            canExport: false,
            canMove: false
        }, config);
    }


    
    _coords(coords) {

        if (this.corner === 0) {
            return {
                x: coords.x - this.gap,
                y: coords.y - this.gap,
            }
        } else if (this.corner === 1) {
            return {
                x: coords.x + this.gap,
                y: coords.y - this.gap,
            }
        } else if (this.corner === 2) {
            return {
                x: coords.x - this.gap,
                y: coords.y + this.gap,
            }
        } else if (this.corner === 3) {
            return {
                x: coords.x + this.gap,
                y: coords.y + this.gap,
            }
        } else if (this.corner === 4) {
            return {
                x: coords.x,
                y: coords.y - this.h - this.gap,
            }
        } else if (this.corner === 5) {
            return {
                x: coords.x + this.gap + this.w,
                y: coords.y,
            }
        } else if (this.corner === 6) {
            return {
                x: coords.x - this.w - this.gap,
                y: coords.y,
            }
        } else if (this.corner === 7) {
            return {
                x: coords.x + this.gap,
                y: coords.y + this.gap + this.h,
            }
        }
    }

    
    _draw() {

        
        if (!this.image) return;

        
        const context = this.shape.getContext(); 

        let coords = this.shape.coords(this.corner);

        let {
            x,
            y
        } = this._coords(coords); 

        context.beginPath();

        this.shape._rotate(); 

        
        context.rect(x - ((this.w + 10) / 2), y - ((this.h + 10) / 2), (this.w + 10), (this.h + 10));
        context.closePath();


    }


    
    draw() {


        
        
        const context = this.shape.getContext(); 

        let coords = this.shape.coords(this.corner);

        let {
            x,
            y
        } = this._coords(coords); 

        
        context.beginPath();

        
        context.save(true);

        
        this.shape._rotate();

        
        context.globalCompositeOperation = this.blendMode;

        const r = this.w / 2;

        
        context.drawImage(this.image, x - r, y - r, this.w, this.h);
        
        context.arc(x, y, r - 1, 0, 2 * Math.PI);
        
        context.strokeStyle = this.strokeStyle;
        
        context.lineWidth = 1;
        
        context.stroke();

        
        context.closePath();
        
        context.restore();
    }


    
    click(x, y) {

        
        const context = this.shape.getContext(); 

        
        
        context.save();

        
        if(context.setViewClip) context.setViewClip();

        this._draw(); 

        
        this.clicked = context.isPointInPath(x, y);

        context.restore();

        return this.clicked;

    }


    
    move(coords, offset) {

    }


    
    tap(coords) {

    }


    
    up(coords) {

    }


}