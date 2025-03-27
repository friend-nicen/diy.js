export default {

    render() {
        this._new = true;
    },


    bound() {
        return this._bound;
    },


    dpr() {
        return this._dpr;
    },


    shapes(flag = false, index = -1) {


        if (index === -1) {

            if (flag) {
                return this._shapes.map(item => {
                    return item;
                });
            } else {
                return this._shapes;
            }

        } else {
            if (typeof index === "number") {
                return this._shapes[index] ? this._shapes[index] : null;
            } else if (typeof index === 'string') {
                for (let i of this._shapes) {
                    if (i.name === index) {
                        return i;
                    }
                }
            }
        }

    },


    getActive() {
        return this._actived;
    },


    getViewBound() {
        return this._view.bound;
    },


    getView() {
        return this._view.shape;
    },


    getIndex(shape) {
        return this._shapes.indexOf(shape);
    },


    canMultiActive() {
        return this._multiActive;
    },


    getColorBound(screen, flag = false) {


        const context = screen.context;


        const drp = context._dpr;


        const width = Math.round(screen.elem.width / drp);
        const height = Math.round(screen.elem.height / drp);


        const calc = this.createCanvas(width, height);
        const calcContext = calc.context;
        calcContext.enableImageSmoothingEnabled();


        calcContext.clearRect(0, 0, width, height);


        calcContext.drawImage(screen.elem, 0, 0, width, height);


        const imageData = calcContext.getImageData(0, 0, width, height,);


        let minX = width;
        let minY = height;
        let maxX = 0;
        let maxY = 0;


        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {

                const index = (y * width + x) * 4;
                const alpha = imageData.data[index + 3];

                if (alpha > 0) {
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                }
            }
        }

        if (flag) {
            return {
                x: minX,
                y: minY,
                w: (maxX - minX),
                h: (maxY - minY),
                _x: Math.floor(minX * drp),
                _y: Math.floor(minY * drp),
                _w: Math.round((maxX - minX) * drp),
                _h: Math.round((maxY - minY) * drp)
            }
        } else {
            return {
                _x: minX,
                _y: minY,
                _w: (maxX - minX),
                _h: (maxY - minY),
                x: Math.floor(minX * drp),
                y: Math.floor(minY * drp),
                w: Math.round((maxX - minX) * drp),
                h: Math.round((maxY - minY) * drp)
            }
        }
    },


    createCanvas(w, h, append = false, styles = {}) {


        const screen = {};

        screen.elem = document.createElement('canvas');


        for (let i in styles) {
            screen.elem.style[i] = styles[i];
        }


        screen.context = screen.elem.getContext('2d', {
            willReadFrequently: true
        });


        this._iniCanvasProxy(screen.elem, w, h);
        this._iniContextProxy(screen.context);


        if (append) {
            this._elem.appendChild(screen.elem);
        }

        return screen;
    },


    async export(param = {}, stage = null) {


        const config = Object.assign({
            elem: ['model', 'custom', 'view'],
            view: true,
            clip: true,
            type: 'base64',
            filter: false,
            ratio: 3.5,
            size: null,
            frame: null
        }, param);


        stage = stage ? stage : {
            model: this._model.shapes,
            custom: this.shapes(),
            view: this._view.shape
        }


        const that = this;

        const bound = that.bound();


        const use_bound = {
            _x: 0,
            _y: 0,
            _w: Math.round(bound._w * config.ratio),
            _h: Math.round(bound._h * config.ratio)
        };


        const front = this.createCanvas(use_bound._w, use_bound._h);
        const frontContext = front.context;
        frontContext.enableImageSmoothingEnabled();
        frontContext.dpr(config.ratio);


        const screen = this.createCanvas(use_bound._w, use_bound._h);
        screen.context.enableImageSmoothingEnabled();
        screen.context.dpr(config.ratio);

        let clipBound = null;


        if (config.view) {


            const viewBound = stage.view.getColorBound();


            if (viewBound) {

                clipBound = {
                    _x: viewBound._x * config.ratio,
                    _y: viewBound._y * config.ratio,
                    _w: viewBound._w * config.ratio,
                    _h: viewBound._h * config.ratio
                }
            }
        }


        frontContext.beginPath();
        frontContext.clearRect(0, 0, use_bound._w, use_bound._h);


        if (config.elem.indexOf('custom') > -1) {


            for (const i of stage.custom.concat((stage.view && config.elem.indexOf('view') > -1) ? [stage.view] : [])) {


                if (i.canExport || !config.filter) {
                    i.bindContext(frontContext);
                    i.draw(false);
                    i.bindContext(this.getContext());
                }
            }
        }


        if (config.elem.indexOf('model') > -1) {


            if (stage.model.length > 0) {


                const context = screen.context;
                const shapes = stage.model;


                context.beginPath();
                context.clearRect(0, 0, use_bound._w, use_bound._h);


                for (const i of shapes) {
                    i.bindContext(context);
                    i.draw(false);
                    i.bindContext(this._model.context);
                }


                frontContext.save(false);
                frontContext.globalCompositeOperation = "destination-over";
                frontContext.drawImage(screen.elem, 0, 0, use_bound._w, use_bound._h);

                frontContext.restore();
            }


        }


        const {
            _x,
            _y,
            _w,
            _h,
        } = clipBound ? clipBound : (config.clip ? this.getColorBound(front, true) : use_bound);


        screen.elem.size(_w, _h);
        screen.context.beginPath();
        screen.context.clearRect(0, 0, _w, _h);
        screen.context.save(false);


        screen.context.putImageData(frontContext.getImageData(Math.floor(_x), Math.floor(_y), Math.round(_w), Math.round(_h)), 0, 0);
        screen.context.restore();


        if (config.size && Array.isArray(config.size)) {


            if (config.size.length === 1) {
                config.size[1] = config.size[0] / (_w / _h);
            }

            const image = new Image(config.size[0], config.size[1]);


            image.src = await new Promise(resolve => {
                screen.elem.toBlob(function (blob) {
                    resolve(URL.createObjectURL(blob));
                });
            });


            await new Promise(resolve => {
                image.onload = () => {
                    resolve();
                }
            });


            let n_w = config.size[0], n_h = config.size[1];


            screen.elem.size(n_w, n_h);
            screen.context.beginPath();
            screen.context.clearRect(0, 0, n_w, n_h);
            screen.context.save(false);


            screen.context.drawImage(image, 0, 0, n_w, n_h);
            screen.context.restore();


        } else if (config.frame) {


            const frame = Object.assign({
                height: 750,
                width: 750,
                fillColor: "#ffffff"
            }, config.frame);


            let width = _w, height = _h;
            const image = new Image(width, height);


            image.src = await new Promise(resolve => {
                screen.elem.toBlob(function (blob) {
                    resolve(URL.createObjectURL(blob));
                });
            });


            await new Promise(resolve => {
                image.onload = () => {
                    resolve();
                }
            });


            const ratio = width / height;


            if (frame.width < width) {
                width = frame.width - 60;
                height = width / ratio;
            }


            if (frame.height < height) {
                height = frame.height - 60;
                width = height * ratio;
            }


            screen.elem.size(frame.width, frame.height);
            screen.context.beginPath();
            screen.context.clearRect(0, 0, frame.width, frame.height);
            screen.context.save(false);


            screen.context.fillStyle = frame.fillColor;
            screen.context.fillRect(0, 0, frame.width, frame.height);


            screen.context.drawImage(image, (frame.width - width) / 2, (frame.height - height) / 2, width, height);
            screen.context.restore();


        }


        return new Promise(resolve => {

            if (config.type === "blob") {
                screen.elem.toBlob(function (blob) {
                    resolve(blob)
                }, 'image/png');
            } else {
                resolve(screen.elem.toDataURL('image/png'));
            }
        })

    }
}