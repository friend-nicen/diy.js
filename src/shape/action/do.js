import Action from "./action";

export default class Do extends Action {


    _draw() {


        const context = this.shape.getContext();
        context.beginPath();
        this.shape._rotate();

        context.rect(this.x, this.y, this.w, this.h);
        context.closePath();
    }


    draw() {


        const context = this.shape.getContext();

        let coords = this.shape.coords(this.corner);

        let {
            x,
            y
        } = this._coords(coords);


        context.save(true);


        context.beginPath();


        this.shape._rotate();


        context.globalCompositeOperation = this.blendMode;


        Object.assign(this, context.drawText({
            x: x,
            y: y,
            border: 1,
            borderColor: "#e3e3e3",
            textColor: '#000000',
            fontSize: 10,
            cornerRadius: 8,
            padding: {
                top: 5,
                bottom: 5,
                left: 8,
                right: 8
            },
            callback: false,
            text: this.shape.button_2_Text
        }));


        context.closePath();

        context.restore();
    }


    tap() {

        this.shape.stage().emit('to-do', {type: 'to-do', shape: this.shape});
    }

}