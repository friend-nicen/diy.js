export function roundRect(context, x, y, w, h, r) {
    context.moveTo(x + r, y);
    context.lineTo(x + w - r, y);
    context.arcTo(x + w, y, x + w, y + r, r);
    context.lineTo(x + w, y + h - r);
    context.arcTo(x + w, y + h, x + w - r, y + h, r);
    context.lineTo(x + r, y + h);
    context.arcTo(x, y + h, x, y + h - r, r);
    context.lineTo(x, y + r);
    context.arcTo(x, y, x + r, y, r);
}


export function drawText(context, param) {


    const config = Object.assign({
        text: "",
        x: 0,
        y: 0,
        fontSize: 16,
        fontFamily: "Arial",
        callback: true,
        bold: false,
        italic: false,
        textDecoration: false,

        cornerRadius: 5,
        textColor: "#ffffff",
        textBaseline: 'middle',
        textAlign: "center",
        background: true,
        backgroundColor: "#ffffff",
        _bound: null,
        border: 1,
        borderColor: "#000000",
        direction: 'horizontal',
        spacingLeft: 1,
        spacingTop: 1,
        padding: {
            top: 6,
            bottom: 6,
            left: 6,
            right: 6,
        }
    }, param)


    const bound = config._bound ? config._bound : textBound(context, param);


    if (config.background) {

        let {x, y, w, h} = bound;


        context.save(false);
        context.fillStyle = config.backgroundColor;
        context.beginPath();


        if (config.cornerRadius !== 0) {

            context.moveTo(x + config.cornerRadius, y);
            context.lineTo(x + w - config.cornerRadius, y);
            context.arcTo(x + w, y, x + w, y + config.cornerRadius, config.cornerRadius);
            context.lineTo(x + w, y + h - config.cornerRadius);
            context.arcTo(x + w, y + h, x + w - config.cornerRadius, y + h, config.cornerRadius);
            context.lineTo(x + config.cornerRadius, y + h);
            context.arcTo(x, y + h, x, y + h - config.cornerRadius, config.cornerRadius);
            context.lineTo(x, y + config.cornerRadius);
            context.arcTo(x, y, x + config.cornerRadius, y, config.cornerRadius);
            context.closePath();

        } else {

            context.rect(x, y, w, h);
        }


        context.fill();


        if (config.border > 0) {
            context.enableImageSmoothingEnabled();
            context.strokeStyle = config.borderColor;
            context.lineWidth = config.border
            context.stroke();
        }

        context.restore();
    }


    const fontFamily = !config.fontFamily ? 'Arial' : config.fontFamily;
    let font = `${config.fontSize}px ${fontFamily}`;


    if (config.bold) {
        font = "bold " + font;
    }


    if (config.italic) {
        font = "italic " + font;
    }


    context.save(false);
    context.font = font;
    context.textAlign = config.textAlign;
    context.textBaseline = config.textBaseline;
    context.fillStyle = config.textColor;


    const lines = !config.text ? [] : config.text.split("\n");


    if (config.direction === 'horizontal') {


        config.y = config.y - (bound.h - config.padding.top - config.padding.bottom) / 2 + (config.fontSize / 2);


        for (let line of lines) {

            let width = 0;
            let words = line.split("");


            for (let i = 0; i < words.length; i++) {

                let textMetrics = context.measureText(words[i]);
                width += textMetrics.width;

                if (i > 0) {
                    width += config.spacingLeft;
                }
            }


            context.textAlign = "left";


            let x;


            if (config.textAlign === "center") {
                x = config.x - (width / 2);
            } else if (config.textAlign === "left") {
                x = config.x - ((bound.w - config.padding.left - config.padding.right) / 2);
            } else if (config.textAlign === "right") {
                const _width = (bound.w - config.padding.left - config.padding.right);
                x = config.x - (_width / 2) + (_width - width);
            }


            for (let i = 0; i < words.length; i++) {


                if (i > 0) {
                    x += config.spacingLeft;
                }

                context.fillText(words[i], x, config.y);


                let textMetrics = context.measureText(words[i]);
                x += textMetrics.width;

            }


            config.y = config.y + config.fontSize + config.spacingTop;
        }

    } else {


        config.x = config.x - (bound.w - config.padding.left - config.padding.right) / 2;


        for (let line of lines) {

            let height = 0;
            let words = line.split("");


            for (let i = 0; i < words.length; i++) {
                height += config.fontSize;

                if (i > 0) {
                    height += config.spacingTop;
                }
            }


            context.textAlign = "left";
            context.textBaseline = "top"

            let y;


            if (config.textAlign === "center") {
                y = config.y - (height / 2);
            } else if (config.textAlign === "left") {
                y = config.y - ((bound.h - config.padding.top - config.padding.bottom) / 2);
            } else if (config.textAlign === "right") {
                const _height = (bound.h - config.padding.top - config.padding.bottom);
                y = config.y - (_height / 2) + (_height - height);
            }


            let maxWidth = 0;


            for (let i = 0; i < words.length; i++) {


                if (i > 0) {
                    y += config.spacingTop;
                }

                context.fillText(words[i], config.x, y);


                let textMetrics = context.measureText(words[i]);


                if (textMetrics.width > maxWidth) {
                    maxWidth = textMetrics.width;
                }

                y += config.fontSize;

            }


            config.x += maxWidth + config.spacingLeft;
        }

    }


    context.restore();

    return bound;
}


export function textBound(context, param) {


    const config = Object.assign({
        text: "",
        x: 0,
        y: 0,
        fontSize: 16,
        fontFamily: "Arial",

        bold: false,
        italic: false,
        textDecoration: false,

        cornerRadius: 5,
        textColor: "#ffffff",
        textBaseline: 'middle',
        textAlign: "center",
        background: true,
        backgroundColor: "#ffffff",
        bound: null,
        border: 1,
        borderColor: "#000000",
        direction: 'horizontal',
        spacingLeft: 1,
        spacingTop: 1,
        padding: {
            top: 6,
            bottom: 6,
            left: 6,
            right: 6,
        }
    }, param)

    const fontFamily = !config.fontFamily ? 'Arial' : config.fontFamily;
    let font = `${config.fontSize}px ${fontFamily}`;


    if (config.bold) {
        font = "bold " + font;
    }


    if (config.italic) {
        font = "italic " + font;
    }


    context.save(false);
    context.font = font;
    context.textAlign = config.textAlign;
    context.textBaseline = config.textBaseline;
    context.fillStyle = config.textColor;


    const lines = config.text.split("\n");
    const bound = {x: null, y: null, w: null, h: null};


    let width = 0;
    let height = 0;


    if (config.direction === 'vertical') {


        for (let i = 0; i < lines.length; i++) {

            let line = lines[i];

            let words = line.split("");
            let _width = 0;
            let _height = 0;


            for (let i = 0; i < words.length; i++) {


                let textMetrics = context.measureText(words[i]);


                if (textMetrics.width > _width) {
                    _width = textMetrics.width;
                }

                _height += config.fontSize;


                if (i > 0) {
                    _height += config.spacingTop;
                }
            }


            width += _width


            if (i > 0) {
                width += config.spacingLeft;
            }


            if (_height > height) {
                height = _height;
            }
        }


    } else {


        for (let i = 0; i < lines.length; i++) {

            let line = lines[i];

            let words = line.split("");
            let _width = 0;


            for (let i = 0; i < words.length; i++) {


                let textMetrics = context.measureText(words[i]);

                _width += textMetrics.width


                if (i > 0) {
                    _width += config.spacingLeft;
                }
            }


            height += config.fontSize


            if (i > 0) {
                height += config.spacingTop;
            }


            if (_width > width) {
                width = _width;
            }
        }

    }


    bound.y = config.y - (height / 2) - config.padding.top;
    bound.h = height + config.padding.top + config.padding.bottom;
    bound.x = config.x - (width / 2) - config.padding.left;
    bound.w = width + config.padding.left + config.padding.right;

    context.restore();

    return bound;
}
