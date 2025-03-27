import Action from '../../shape/action'

export default {

    _stage: null,
    _context: null,
    _preview: null,


    _startAgree: null,
    _startBound: null,
    _action: null,
    _acting: false,


    _previous: null,
    _group: null,

    name: null,
    type: null,
    zIndex: 0,
    fixed: null,
    actived: false,
    clicked: false,
    queue: true,
    _colorBound: null,


    blendMode: 'source-over',
    rotateRadius: 0,
    rotateAroundCenter: true,
    button_2_Text: "",
    reference: "view",


    stroke: true,
    fill: true,
    strokeStyle: "black",
    fillStyle: "transparent",
    fillRule: "nonzero",
    outline: false,


    canMove: true,
    canRotate: true,
    canScale: true,
    canUp: true,
    canRemove: true,
    canClick: true,
    canActive: true,
    canExport: true,
    canSort: true,
    canDo: false,
    canFlip: false,


    async init() {


        if (this._init) {
            await this._init();
        }


        if (this.canActive && !this._action) {

            this._action = new Action({
                shape: this
            });
        }


        this.emit("init", {type: 'init', stage: this._stage});
        this.render();
    },


    set(config) {

        this.each(config);

        this.render();
    },


    each(config) {

        for (let i in config) {
            this[i] = config[i];
        }
    },


    click(x, y, flag = false, coords = []) {


        if (this.canActive) {
            if (this.actived && coords.length < 2) {

                if (this._action.click(x, y)) {
                    this._acting = true;
                    return true;
                } else {
                    this._acting = false;
                }
            }
        }


        if (!this.canClick) {
            this.clicked = false;
            return false;
        }


        if (flag) {
            this.clicked = true;
            return true;
        }


        const context = this._context;
        context.save();

        this._draw();


        this.clicked = context.isPointInPath(x, y);
        context.restore();


        if (this.clicked) {

            this.emit("click", {type: 'click', x, y});
        }

        return this.clicked;

    }


}