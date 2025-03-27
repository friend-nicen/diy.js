function getLen(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

function dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
}

function getAngle$1(v1, v2) {
    let mr = getLen(v1) * getLen(v2);
    if (mr === 0) return 0;
    let r = dot(v1, v2) / mr;
    if (r > 1) r = 1;
    return Math.acos(r);
}

function cross(v1, v2) {
    return v1.x * v2.y - v2.x * v1.y;
}

function getRotateAngle(v1, v2) {
    let angle = getAngle$1(v1, v2);
    if (cross(v1, v2) > 0) {
        angle *= -1;
    }

    return angle * 180 / Math.PI;
}

function getUserAgent() {
    
    
    if (typeof global === 'undefined' || typeof window !== 'undefined') {
        if (/Android|webOS|iPhone|iPod|iPad|BlackBerry/i.test(navigator.userAgent) || (navigator.maxTouchPoints &&
            navigator.maxTouchPoints > 2)) {
            return 'Mobile'
        } else {
            return 'PC'
        }
    } else {
        if (global.__wcc_version__ || Object.keys(global).length === 0) {
            return 'Mini'
        }
    }
}

class Observer {
    constructor(el) {
        this._Observer = {};
        this.el = el;
    }

    register(type, func) {
        if (typeof func === 'function') {
            if (typeof this._Observer[type] === 'undefined') {
                this._Observer[type] = [func];
            } else {
                this._Observer[type].push(func);
            }
        }
    }

    dispatch(type, args) {

        if (this._Observer[type]) {
            let that = this;
            args.gesture = {
                event: Object.keys(this._Observer),
                on: function (type, func) {
                    that.register(type, func);
                },
                off: function (type) {
                    that.remove(type);
                },
                destroy: function () {
                    that._Observer = {};
                }
            };
            for (let i = 0, len = this._Observer[type].length; i < len; i++) {
                let handler = this._Observer[type][i];
                typeof handler === 'function' && handler.call(this.el, args);
            }
        }
    }

    remove(type) {
        if (this._Observer[type] instanceof Array) {
            for (let i = this._Observer[type].length - 1; i >= 0; i--) {
                this._Observer[type].splice(i, 1);
            }
        }
    }
}

class BetterGesture {
    constructor(el, option = {}) {
        this.element = typeof el == 'string' ? document.querySelector(el) : el;
        this.userAgent = getUserAgent();
        this.Observer = new Observer(this.element);
        if (this.userAgent === 'Mini') {
            
            this.element.start = this.start.bind(this);
            this.element.move = this.move.bind(this);
            this.element.end = this.end.bind(this);
            this.element.cancel = this.cancel.bind(this);
        } else {
            this.start = this.start.bind(this);
            this.move = this.move.bind(this);
            this.end = this.end.bind(this);
            this.cancel = this.cancel.bind(this);
            this.mouseOver = this.mouseOver.bind(this);
            this.mouseOut = this.mouseOut.bind(this);
        }
        if (this.userAgent === 'Mobile') {
            this.element.addEventListener("touchstart", this.start, false);
            this.element.addEventListener("touchmove", this.move, false);
            this.element.addEventListener("touchend", this.end, false);
            this.element.addEventListener("touchcancel", this.cancel, false);
        }
        if (this.userAgent === 'PC') {
            this.mouseLeave = this.mouseLeave.bind(this);
            this.element.addEventListener("mousedown", this.start, false);
            this.element.addEventListener("mousemove", this.move, false);
            this.element.addEventListener("mouseup", this.end, false);
            this.element.addEventListener("mouseover", this.mouseOver, false);
            this.element.addEventListener("mouseout", this.mouseOut, false);
            this.element.addEventListener("mouseleave", this.mouseLeave, false);
        }

        
        this.Observer.register('start', option.start);
        this.Observer.register('end', option.end);
        this.Observer.register('pressMove', option.pressMove);
        this.Observer.register('swipe', option.swipe);
        this.Observer.register('tap', option.tap);
        this.Observer.register('doubleTap', option.doubleTap);
        this.Observer.register('longTap', option.longTap);
        this.Observer.register('singleTap', option.singleTap);
        
        if (this.userAgent === 'Mobile' || this.userAgent === 'Mini') {
            this.Observer.register('touchStart', option.touchStart);
            this.Observer.register('touchMove', option.touchMove);
            this.Observer.register('touchEnd', option.touchEnd);
            this.Observer.register('touchCancel', option.touchCancel);
            this.Observer.register('moreFingerStart', option.moreFingerStart);
            this.Observer.register('multipointEnd', option.multipointEnd);
            this.Observer.register('pinch', option.pinch);
            this.Observer.register('twoFingerPressMove', option.twoFingerPressMove);
            this.Observer.register('rotate', option.rotate);
        } else {
            
            this.Observer.register("mouseDown", option.mouseDown);
            this.Observer.register("mouseMove", option.mouseMove);
            this.Observer.register("mouseUp", option.mouseUp);
            this.Observer.register('mouseOver', option.mouseOver);
            this.Observer.register('mouseOut', option.mouseOut);
        }


        this._cancelAllHandler = this.cancelAll.bind(this);

        typeof window !== 'undefined' && window.addEventListener('scroll', this._cancelAllHandler);

        this.preV = {x: null, y: null};
        this.pinchStartLen = null;
        this.zoom = 1;
        this.isDoubleTap = false;
        this.delta = null;
        this.last = null;
        this.now = null;
        this.tapTimeout = null;
        this.singleTapTimeout = null;
        this.longTapTimeout = null;
        this.swipeTimeout = null;
        this.lastTime = null;
        this.x1 = this.x2 = this.y1 = this.y2 = null;
        this.preTapPosition = {x: null, y: null};
        this.isPress = false;

    }

    start(evt) {
        this.now = Date.now();
        this.isPress = true;
        if (this.userAgent === 'Mobile' || this.userAgent === 'Mini') {
            this.x1 = evt.touches[0].pageX;
            this.y1 = evt.touches[0].pageY;
        } else {
            this.x1 = evt.pageX;
            this.y1 = evt.pageY;
        }

        this.delta = this.now - (this.last || this.now);
        this.Observer.dispatch('start', evt);
        this.Observer.dispatch(this.userAgent === 'Mobile' || this.userAgent === 'Mini' ? 'touchStart' : 'mouseDown', evt);
        if (this.preTapPosition.x !== null) {
            this.isDoubleTap = (this.delta > 0 && this.delta <= 250 && Math.abs(this.preTapPosition.x - this.x1) < 30 && Math.abs(this.preTapPosition.y - this.y1) < 30);
            if (this.isDoubleTap) clearTimeout(this.singleTapTimeout);
        }
        this.preTapPosition.x = this.x1;
        this.preTapPosition.y = this.y1;
        this.last = this.now;
        let preV = this.preV;
        if (evt.touches && evt.touches.length > 1) {
            this._cancelLongTap();
            this._cancelSingleTap();
            let v = {x: evt.touches[1].pageX - this.x1, y: evt.touches[1].pageY - this.y1};
            preV.x = v.x;
            preV.y = v.y;
            this.pinchStartLen = getLen(preV);
            this.Observer.dispatch('moreFingerStart', evt);
        }
        this._preventTap = false;
        this.longTapTimeout = setTimeout(function () {
            this.Observer.dispatch('longTap', evt);
            this._preventTap = true;
        }.bind(this), 750);
    }

    move(evt) {
        let preV = this.preV,
            currentX = 0,
            currentY = 0;
        if (this.userAgent === 'Mobile' || this.userAgent === 'Mini') {
            currentX = evt.touches[0].pageX;
            currentY = evt.touches[0].pageY;
        } else {
            currentX = evt.pageX;
            currentY = evt.pageY;
        }
        this.isDoubleTap = false;
        if (evt.touches && evt.touches.length > 1) {
            let sCurrentX = evt.touches[1].pageX,
                sCurrentY = evt.touches[1].pageY;
            let v = {x: evt.touches[1].pageX - currentX, y: evt.touches[1].pageY - currentY};

            if (preV.x !== null) {
                if (this.pinchStartLen > 0) {
                    evt.zoom = getLen(v) / this.pinchStartLen;
                    this.Observer.dispatch('pinch', evt);
                }

                evt.angle = getRotateAngle(v, preV);
                this.Observer.dispatch('rotate', evt);
            }
            preV.x = v.x;
            preV.y = v.y;

            if (this.x2 !== null && this.sx2 !== null) {
                evt.deltaX = (currentX - this.x2 + sCurrentX - this.sx2) / 2;
                evt.deltaY = (currentY - this.y2 + sCurrentY - this.sy2) / 2;
            } else {
                evt.deltaX = 0;
                evt.deltaY = 0;
            }
            this.Observer.dispatch('twoFingerPressMove', evt);
            this.sx2 = sCurrentX;
            this.sy2 = sCurrentY;
        } else {
            if (this.x2 !== null) {
                evt.deltaX = currentX - this.x2;
                evt.deltaY = currentY - this.y2;
                
                
                let movedX = Math.abs(this.x1 - this.x2),
                    movedY = Math.abs(this.y1 - this.y2);

                if (movedX > 10 || movedY > 10) {
                    this._preventTap = true;
                }

            } else {
                evt.deltaX = 0;
                evt.deltaY = 0;
            }
            if (this.lastTime !== null) {
                evt.deltaTime = Date.now() - this.lastTime;
            } else {
                evt.deltaTime = 0;
            }
            if (this.isPress) {
                this.Observer.dispatch('pressMove', evt);
            }
        }
        this.Observer.dispatch(this.userAgent === 'Mobile' || this.userAgent === 'Mini' ? 'touchMove' : 'mouseMove', evt);

        this._cancelLongTap();
        this.x2 = currentX;
        this.y2 = currentY;
        this.lastTime = Date.now();

        if (evt.preventDefault && evt.touches && evt.touches.length > 1) {
            evt.preventDefault();
        }

    }

    end(evt) {
        this._cancelLongTap();
        this.isPress = false;
        let self = this;
        if (evt.touches && evt.touches.length < 2) {
            this.Observer.dispatch('multipointEnd', evt);
            this.sx2 = this.sy2 = null;
        }

        if ((this.x2 && Math.abs(this.x1 - this.x2) > 30) ||
            (this.y2 && Math.abs(this.y1 - this.y2) > 30)) {
            evt.direction = this._swipeDirection(this.x1, this.x2, this.y1, this.y2);
            this.swipeTimeout = setTimeout(function () {
                self.Observer.dispatch('swipe', evt);

            }, 0);
        } else {
            this.tapTimeout = setTimeout(function () {
                if (!self._preventTap) {
                    self.Observer.dispatch('tap', evt);
                }
                
                if (self.isDoubleTap) {
                    self.Observer.dispatch('doubleTap', evt);
                    self.isDoubleTap = false;
                }
            }, 0);

            if (!self.isDoubleTap) {
                self.singleTapTimeout = setTimeout(function () {
                    self.Observer.dispatch('singleTap', evt);
                }, 250);
            }
        }
        this.Observer.dispatch('end', evt);
        this.Observer.dispatch(this.userAgent === 'Mobile' || this.userAgent === 'Mini' ? 'touchEnd' : 'mouseUp', evt);
        this.preV.x = 0;
        this.preV.y = 0;
        this.zoom = 1;
        this.pinchStartLen = null;
        this.x1 = this.x2 = this.y1 = this.y2 = this.lastTime = null;
    }

    mouseLeave(evt) {
        this.isPress = false;
        this.Observer.dispatch('mouseLeave', evt);
    }

    mouseOver(evt) {
        this.Observer.dispatch('mouseOver', evt);
    }

    mouseOut(evt) {
        this.Observer.dispatch('mouseOut', evt);
    }

    cancel(evt) {
        this.cancelAll();
        this.Observer.dispatch('touchCancel', evt);
    }

    cancelAll() {
        this._preventTap = true;
        clearTimeout(this.singleTapTimeout);
        clearTimeout(this.tapTimeout);
        clearTimeout(this.longTapTimeout);
        clearTimeout(this.swipeTimeout);
    }

    _cancelLongTap() {
        clearTimeout(this.longTapTimeout);
    }

    _cancelSingleTap() {
        clearTimeout(this.singleTapTimeout);
    }

    _swipeDirection(x1, x2, y1, y2) {
        return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
    }

    
    on(type, func) {
        this.Observer.register(type, func);
    }

    
    off(type, func) {
        this.Observer.remove(type, func);
    }

    destroy() {
        
        if (this.singleTapTimeout) clearTimeout(this.singleTapTimeout);
        if (this.tapTimeout) clearTimeout(this.tapTimeout);
        if (this.longTapTimeout) clearTimeout(this.longTapTimeout);
        if (this.swipeTimeout) clearTimeout(this.swipeTimeout);
        this.element.removeEventListener("touchstart", this.start);
        this.element.removeEventListener("touchmove", this.move);
        this.element.removeEventListener("touchend", this.end);
        this.element.removeEventListener("touchcancel", this.cancel);
        this.element.removeEventListener("mousedown", this.start);
        this.element.removeEventListener("mousemove", this.move);
        this.element.removeEventListener("mouseup", this.end);
        this.element.removeEventListener("mouseup", this.end);
        this.element.removeEventListener("mouseover", this.mouseOver);
        this.element.removeEventListener("mouseLeave", this.mouseLeave);
        this.Observer._Observer = {};
        
        this.preV = this.pinchStartLen = this.zoom = this.isDoubleTap = this.delta = this.last = this.now = this.tapTimeout = this.lastTime = this.singleTapTimeout = this.longTapTimeout = this.swipeTimeout = this.x1 = this.x2 = this.y1 = this.y2 = this.preTapPosition = null;
        typeof window !== 'undefined' && window.removeEventListener('scroll', this._cancelAllHandler);
        return null;
    }
}

function renameProperty(obj, oldProp, newProp) {
    
    if (obj.hasOwnProperty(oldProp)) {
        
        const prop = obj[oldProp];
        
        delete obj[oldProp];
        
        obj[newProp] = prop;
    }
}



function moveElem(arr, element, index) {

    
    if (arr.length === 0) {
        return false;
    }

    
    if (!arr.includes(element)) {
        return false;
    }

    const currentIndex = arr.indexOf(element);
    const maxIndex = arr.length - 1;

    index = Math.max(0, Math.min(index, maxIndex));

    
    if (currentIndex === index) {
        return false;
    }

    arr.splice(currentIndex, 1);
    arr.splice(index, 0, element);

    return arr;
}



function getPosOfEvent(ev) {
    
    if ("touches" in ev && ev.touches) {
        const posi = [];
        let src = null;

        for (let t = 0, len = ev.touches.length; t < len; t++) {
            src = ev.touches[t];
            posi.push({
                x: src.pageX,
                y: src.pageY
            });
        }
        return posi;
    } 
    else {
        return [{
            x: ev.x,
            y: ev.y
        }];
    }
}


function getEnd(ev) {
    
    if ("changedTouches" in ev && ev.changedTouches) {
        const posi = [];
        let src = null;

        for (let t = 0, len = ev.changedTouches.length; t < len; t++) {
            src = ev.changedTouches[t];
            posi.push({
                x: src.pageX,
                y: src.pageY
            });
        }
        return posi;
    } 
    else {
        return [{
            x: ev.x,
            y: ev.y
        }];
    }
}




function chooseFile() {
    return new Promise((resolve) => {

        
        if (!window.chooseFileInput) {
            window.chooseFileInput = document.createElement('input');
            window.chooseFileInput.type = 'file'; 
        }

        window.chooseFileInput.value = ""; 
        const input = window.chooseFileInput;


        input.accept = 'image/*';

        input.onchange = () => {
            const file = input.files[0];
            if (file) {
                resolve(file);
            } else {
                resolve(false);
            }
        };

        input.click();
    });
}



function loadImage(url, callback, error = null, cache = true) {

    
    if (!window.hasImage) {
        window.hasImage = Object.create(null);
    }

    
    if (cache && Object.keys(window.hasImage).indexOf(url) > -1) {
        callback(window.hasImage[url]);
        return;
    }

    
    const image = new window.Image();
    image.crossOrigin = 'anonymous'; 
    image.src = url; 
    image.style.display = "none";

    
    image.onload = () => {

        
        if (cache) {
            window.hasImage[url] = image;
        }

        if (callback) {
            callback(image);
        }

    };

    
    image.onerror = () => {
        console.warn(url + "图片加载失败！");
        if (error) {
            error();
        }
    };
}



function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}



function delay(callback, time) {
    let timer = setTimeout(() => {
        clearTimeout(timer);
        callback();
    }, time);
}



function throttle(cb, wait = 3000) {
    let previous = 0;
    return (...args) => {
        const now = +new Date();
        if (now - previous > wait) {
            previous = now;
            cb.apply(this, args);
        }
    }
}



function debounce(func, wait, immediate) {
    let timeout;
    return () => {
        const context = this;
        const args = arguments;
        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        if (callNow) {
            func.apply(context, args);
        } else {
            timeout = setTimeout(later, wait);
        }
    };
}




function cloneDeep(obj, config = {}) {

    const type = typeof obj; 

    
    if (obj === null || type !== 'object') {
        return obj;
    }

    const clonedObj = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
        
        if (typeof obj[key] !== 'function') {

            if (!!obj[key] && !!obj[key].props) {
                clonedObj[key] = obj[key].props(config);
            } else {
                clonedObj[key] = cloneDeep(obj[key]);
            }

        }
    }

    return clonedObj;

}

function toFixed(num, decimalPlaces) {
    
    let factor = Math.pow(10, decimalPlaces);
    
    return Math.floor(num * factor) / factor;
}



function percentToValue(percentage, total) {
    if (typeof percentage === 'string' && percentage.endsWith('%')) {
        const numericValue = parseFloat(percentage);
        return (numericValue / 100) * total;
    }

    return percentage;
}



function toFixedNumber(number, decimalPlaces) {
    return parseFloat(number.toFixed(decimalPlaces));
}

function getVector(p1, p2) {
    let x = toFixed(p1.x - p2.x, 5);
    let y = toFixed(p1.y - p2.y, 5);
    return {
        x,
        y
    };
}



function getVectorCenter(p1, p2) {
    const centerX = (p1.x + p2.x) / 2;
    const centerY = (p1.y + p2.y) / 2;
    return {x: centerX, y: centerY};
}



function getLength(v1) {
    return Math.sqrt(v1.x * v1.x + v1.y * v1.y);
}



function getAngle(v1, v2) {

    
    let direction = v1.x * v2.y - v2.x * v1.y > 0 ? 1 : -1;

    let len1 = getLength(v1);
    let len2 = getLength(v2);
    let mr = len1 * len2;
    let dot, r;

    if (mr === 0) return 0;

    
    // cos =(x1 *x2 +y1*y2)/(lal * Ib1);

    dot = v1.x * v2.x + v1.y * v2.y;
    r = dot / mr;

    if (r > 1) r = 1;
    if (r < -1) r = -1;

    
    // 180 / Math.PI
    return Math.acos(r) * direction;

}



function radToDegree(radians) {
    return radians * 180 / Math.PI;
}



function rotateVector(vector, angle, pivot) {

    
    const x1 = vector.x - pivot.x;
    const y1 = vector.y - pivot.y;

    
    const rad = angle * Math.PI / 180;

    
    const x2 = x1 * Math.cos(rad) - y1 * Math.sin(rad);
    const y2 = x1 * Math.sin(rad) + y1 * Math.cos(rad);

    
    return {x: toFixed(x2 + pivot.x, 3), y: toFixed(y2 + pivot.y, 3)};
}



function reverseRotatePoint(vector, angle, pivot) {
    
    const x1 = vector.x - pivot.x;
    const y1 = vector.y - pivot.y;

    
    const rad = -angle * Math.PI / 180;

    
    const x2 = x1 * Math.cos(rad) - y1 * Math.sin(rad);
    const y2 = x1 * Math.sin(rad) + y1 * Math.cos(rad);

    
    return {x: toFixed(x2 + pivot.x, 3), y: toFixed(y2 + pivot.y, 3)};
}



function getBoundingBox(rectangles) {

    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    let maxX = Number.MIN_VALUE;
    let maxY = Number.MIN_VALUE;

    rectangles.forEach(function (rectangle) {
        minX = Math.min(minX, rectangle.x);
        minY = Math.min(minY, rectangle.y);
        maxX = Math.max(maxX, rectangle.x + rectangle.w);
        maxY = Math.max(maxY, rectangle.y + rectangle.h);
    });

    return {
        x: minX,
        y: minY,
        w: (maxX - minX),
        h: (maxY - minY)
    }
}



function getCoordsBox(coords) {

    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    let maxX = Number.MIN_VALUE;
    let maxY = Number.MIN_VALUE;

    coords.forEach(function (coord) {
        minX = Math.min(minX, coord.x);
        minY = Math.min(minY, coord.y);
        maxX = Math.max(maxX, coord.x);
        maxY = Math.max(maxY, coord.y);
    });

    return {
        x: minX,
        y: minY,
        w: (maxX - minX),
        h: (maxY - minY)
    }
}



function scaleVector(v1, s) {
    return {
        x: v1.x * s,
        y: v1.y * s
    }
}



function getCoordsByBound(bound) {
    return [
        {
            x: bound.x,
            y: bound.y
        },
        {
            x: bound.x + bound.w,
            y: bound.y
        },
        {
            x: bound.x,
            y: bound.y + bound.h
        },
        {
            x: bound.x + bound.w,
            y: bound.y + bound.h
        }
    ];
}



function isOutBound(bound, coords) {

    
    const left = bound.x;
    
    const right = bound.x + bound.w;
    
    const top = bound.y;
    
    const bottom = bound.y + bound.h;

    
    for (let i = 0; i < coords.length; i++) {
        
        const point = coords[i];
        
        if (point.x < left || point.x > right || point.y < top || point.y > bottom) {
            
            return true;
        }
    }
}

function roundRect(context, x, y, w, h, r) {
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



function drawText(context, param) {

    
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
    }, param);

    
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
            context.lineWidth = config.border;
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
            context.textBaseline = "top";

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



function textBound(context, param) {


    
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
    }, param);

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

            
            width += _width;

            
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

                _width += textMetrics.width;

                
                if (i > 0) {
                    _width += config.spacingLeft;
                }
            }


            height += config.fontSize;

            
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

var Boot = {


    _init() {

        this._initBound();
        this._initStyle();
        this._initCanvas();
        this._initModel();
        this._initGesTure();
        this._initEvent();

        this.emit("init", {type: 'init'});


        if (this._mode === "auto") {
            this._global.requestAnimationFrame(() => this._render(true));
        }
    },


    _initStyle() {
        const bound = this.bound();
        const style = document.createElement('style');
        const styleText = `.diyjs {position: relative;} .diyjs canvas {position: absolute;transform: translateZ(0);width:${bound._w}px;height: ${bound._h}px;left: 0;top: 0; }`;
        style.appendChild(document.createTextNode(styleText));
        document.head.appendChild(style);
    },


    _initBound() {

        this._elem.classList.add("diyjs");

        const bound = this._elem.getBoundingClientRect();


        this._offset = {
            x: bound.x,
            y: bound.y
        };


        this.$offset = {
            x: bound.x,
            y: bound.y
        };


        this._bound = {
            x: 0,
            y: 0,
            w: Math.round(bound.width * this._dpr),
            h: Math.round(bound.height * this._dpr),
            _x: 0,
            _y: 0,

            _w: bound.width,
            _h: bound.height
        };
    },


    _initCanvas() {


        const bound = this.bound();


        const custom = this.createCanvas(bound.w, bound.h, true, {
            zIndex: 20
        });


        Object.assign(this._custom, {
            elem: custom.elem,
            context: custom.context
        });


        if (this._useBuffer) {

            const buffer = this.createCanvas(bound.w, bound.h);

            Object.assign(this._custom, {
                bufferElem: buffer.elem,
                bufferContext: buffer.context
            });

        }


    },


    _initModel() {


        const bound = this.bound();


        this._model = this.createCanvas(bound.w, bound.h, true, {
            zIndex: 10,
            backgroundColor: "#f6f6f6"
        });

        this._model.shapes = [];

    },


    _iniCanvasProxy(canvas, w = null, h = null) {


        const bound = this.bound();


        canvas.reset = () => {
            canvas.width = w ? w : bound.w;
            canvas.height = h ? h : bound.h;
        };


        canvas.size = (w, h) => {
            canvas.width = w;
            canvas.height = h;
        };

        canvas.reset();
    },


    _iniContextProxy(context) {


        const that = this;

        context._dpr = that._dpr;


        const save = context.save;


        context.enableImageSmoothingEnabled = function () {
            context.imageSmoothingEnabled = true;
            context.mozImageSmoothingEnabled = true;
            context.webkitImageSmoothingEnabled = true;
            context.msImageSmoothingEnabled = true;
        };


        context.disableImageSmoothingEnabled = function () {
            context.imageSmoothingEnabled = false;
            context.mozImageSmoothingEnabled = false;
            context.webkitImageSmoothingEnabled = false;
            context.msImageSmoothingEnabled = false;
        };


        context.save = function (flag = true) {


            save.apply(this);

            if (flag) {
                this.scale(this._dpr, this._dpr);
            }
        };


        context.copy = function (canvas) {
            this.drawImage(canvas, 0, 0);
        };


        context.clear = function () {
            this.beginPath();
            this.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.closePath();
        };


        context.dpr = function (dpr) {
            this._dpr = dpr;
        };


        context.resetDpr = function () {
            this._dpr = that._dpr;
        };


        context.roundCornerRect = function (x, y, w, h, r = 5) {
            return roundRect(this, x, y, w, h, r)
        };


        context.drawText = function (config) {
            return drawText(this, config)
        };


        context.textBound = function (config) {
            return textBound(this, config)
        };


    },


    _initGesTure() {

        const that = this;

        this._gesture = new BetterGesture(this._custom.elem, {

            start(evt) {

                that.emit("start", {type: 'start', coords: evt});


                const coords = that.filterCoords(getPosOfEvent(evt));

                that._startPoint = coords[0];
                that._eventTouch(coords);
            },

            end(evt) {


                const coords = that.filterCoords(getEnd(evt));


                if (that._startPoint && coords.length === 1) {

                    if (Math.abs(coords[0].x - that._startPoint.x) < 5 && Math.abs(coords[0].y - that._startPoint.y) < 5) {

                        that._eventTouch(coords, true);
                    }
                }


                that._eventUp(coords);
            },

            pressMove(evt) {
                that._eventMove(that.filterCoords(getPosOfEvent(evt)));
            },

            rotate(evt) {
                that._eventRotate(evt.angle, that.filterCoords(getPosOfEvent(evt)));
            },

            pinch(evt) {
                that._eventPinch(evt.zoom, that.filterCoords(getPosOfEvent(evt)));
            },

            doubleTap(evt) {
                that.emit("doubleTap", {type: 'doubleTap', coords: that.filterCoords(getPosOfEvent(evt))});
            }
        });
    },


    _initEvent() {

        const that = this;

        this._custom.elem.addEventListener('mouseleave', (evt) => {

            const coords = that.filterCoords(getEnd(evt));

            that._eventUp(coords);
        });

        this._global.addEventListener('resize', debounce(() => {
            that._initBound();
            this._gesture.destroy();
            that._initGesTure();
        }, 200));
    },


    _eventTouch(coords, isTap = false) {


        let changed = 0;
        this._clicked = null;

        const shapes = this.shapes();


        for (const p of coords) {


            let {x, y} = scaleVector(p, this._dpr);


            for (let k = shapes.length - 1; k >= 0; k--) {


                let i = shapes[k];


                let clicked = i.clicked;


                if (!this._clicked) {

                    if (i.click(x, y, false, coords)) {

                        changed++;
                        this._clicked = i;


                        if (isTap) {


                            if (i.tap({x, y})) {

                                if (this._actived !== i) {
                                    this._actived = i;
                                }
                            } else {

                                this._actived = null;
                            }

                        }
                    } else {

                        if (isTap && !this._multiActive) {
                            this._actived = null;
                            i.deactivate(false);
                        }
                    }
                } else {

                    i.click(x, y, false);

                    if (isTap && !this._multiActive) {
                        i.deactivate(false);
                    }
                }


                if (i.clicked !== clicked) {
                    changed++;
                }
            }


            if (this._clicked) {
                break;
            }

        }


        if (!this._clicked && !this._actived && !this._multiActive) {
            this.emit("click-blank", {type: 'click-blank'});
            this.emit("deactivate", {type: 'deactivate', shape: this.shapes()});
        }


        if (this._mode === 'event') {
            if (changed > 0) {
                this._loop = true;
                this._render();
            }
        }

    },


    _eventMove(coords) {


        if (coords.length > 2) return;


        const handler = this.getHandler();


        if (handler) {


            if (!handler.canMove) return;


            let {x, y} = coords[0];


            if (!this._isMoving) {


                this._startOffset = {
                    x: x - handler.x,
                    y: y - handler.y
                };


                this._isMoving = true;
            }


            handler.move([{x, y}], this._startOffset);

        }
    },


    _eventPinch(zoom, coords) {

        if (coords.length > 2) return;


        const handler = this.getHandler();


        if (handler) {

            if (!handler.canScale) return;

            handler.scale(zoom, coords);
        }
    },


    _eventRotate(rad, coords) {


        if (coords.length > 2) return;


        const handler = this.getHandler();


        if (handler) {

            if (!handler.canRotate) return;

            handler.rotate(rad, coords);
        }
    },


    _eventUp(coords) {


        this._isMoving = false;


        this.emit("end", {coords});


        const handler = this.getHandler();


        if (handler) {

            if (!handler.canUp) return;
            handler.up(coords);
        }


        if (this._mode === 'event') {
            this._loop = false;
        }

    },


    _render(flag = true) {


        if (this._stop) return;


        if (this._new || !flag) {


            this._new = false;


            this.getContext().clear();
            this.getContext().closePath();


            if (this._view.shape && this._view.shape.clip) {

                this._view.shape.stokeOutline();

                for (const i of this.shapes()) {
                    i.draw();
                }
            } else {

                for (const i of this.shapes().concat(this._view.shape ? [this._view.shape] : [])) {
                    i.draw();
                }
            }


            if (this.getQueue().length > 0) {

                for (const task of this.getQueue()) {
                    task();
                }

                this.clearQueue();
            }


            if (this._useBuffer) {

                this._custom.context.clear();

                this._custom.context.copy(this._custom.bufferElem);
            }


        }


        if (this._loop && flag) {
            this._global.requestAnimationFrame(() => this._render(flag));
        }
    },


    getHandler() {
        return this._limit ? this._clicked : this._actived;
    },


    getLimit() {
        return this._limit;
    }
};

var Getter = {
    
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
        };


        
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
                };
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

                
                for (const i of shapes ) {
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
                };
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
                };
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
                    resolve(blob);
                }, 'image/png');
            } else {
                resolve(screen.elem.toDataURL('image/png'));
            }
        })

    }
};

var Event$1 = {

    
    _listener: new Map(), 
    _pauseEvent: [], 

    
    pauseEvent(event) {
        
        if (this._pauseEvent.indexOf(event) === -1) {
            this._pauseEvent.push(event);
        }
    },


    
    withEventPause(event, callback) {
        this.pauseEvent(event);
        callback(); 
        this.resumeEvent(event);
    },


    
    resumeEvent(event) {
        
        const index = this._pauseEvent.indexOf(event);
        
        if (index > -1) {
            this._pauseEvent.splice(index, 1);
        }
    },


    
    on(event, listener, ignore = false) {

        if (typeof listener !== 'function') {
            throw new TypeError('listener must be a function');
        }

        const events = Array.isArray(event) ? event : [event];

        for (let i of events) {

            if (!this._listener.has(i)) {
                this._listener.set(i, []);
            }

            
            if (this._listener.get(i).length === 0 || !ignore) {
                this._listener.get(i).push(listener);
            }
        }
    },

    
    async emit(event, ...args) {

        
        if (this._pauseEvent.indexOf(event) > -1) {
            return;
        }

        if (this._listener.has(event)) {
            const listeners = this._listener.get(event);
            for (const listener of listeners) {
                try {
                    await listener.apply(null, args);
                } catch (error) {
                    console.error(error);
                }
            }
        }


    },

    
    off(event, listener) {

        const events = Array.isArray(event) ? event : [event];

        for (let i of events) {
            if (this._listener.has(i)) {
                const listeners = this._listener.get(i);
                const index = listeners.indexOf(listener);
                if (index !== -1) {
                    listeners.splice(index, 1);
                }
            }
        }

    },

    
    removeAlllistener(event) {
        this._listener.delete(event);
    }

};

var Action$2 = {

    
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
};

var Event = {

    
    _listener: null, 

    
    on(event, listener) {

        if (typeof listener !== 'function') {
            throw new TypeError('listener must be a function');
        }

        const events = Array.isArray(event) ? event : [event];

        for (let i of events) {

            if (!this._listener.has(i)) {
                this._listener.set(i, []);
            }

            this._listener.get(i).push(listener);
        }
    },

    
    async emit(event, ...args) {
        if (this._listener.has(event)) {
            const listeners = this._listener.get(event);
            for (const listener of listeners) {
                try {
                    await listener.apply(null, args);
                } catch (error) {
                    console.error(error);
                }
            }
        }


    },

    
    off(event, listener) {

        const events = Array.isArray(event) ? event : [event];

        for (let i of events) {
            if (this._listener.has(i)) {
                const listeners = this._listener.get(i);
                const index = listeners.indexOf(listener);
                if (index !== -1) {
                    listeners.splice(index, 1);
                }
            }
        }

    },

    
    removeAlllistener(event) {
        this._listener.delete(event);
    }

};

var iScale = "data:image/png;base64,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";

var iRotate = "data:image/png;base64,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";

var iClear = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAAXNSR0IArs4c6QAAFzhJREFUeF7tnQm0FsWVx/9/OcqIkXg8M87kRNEkxBVDNCoSlUEN7ivuwX0BF5TVDcFdEdw33EEh4hgRFVTUqNEoKmpAjcaEaGKMTibxEGPMuCQ4d859p7/n9x7f0kt1d3X3rXO+8955r+rWrX/176vu6qpbhCVTwBRoqgBNG1PAFGiugAFiV4cp0EIBA8QuD1PAAPHjGhCR1QH0BtDoZ+1v6uzfAHwcfGq/d/4kqf+zlIECNoI4FllEegLYCMDGwc/6313W9iaAXwLQn52/k/zcZSVVt2WAJLgCRGQtANsC2LoOim8mMOmi6G/rwHkOwDMkl7kwXEUbBkiEXheRbwHYrg6KTSIUzzPrKwCeAqDAvEjy93k6U6S6DZAWvSUiOhpsD2BgMEoUBYh216AC84LCAuBpkjrqWGqggAHSTRQRWQPAXnWflUt+5fwTwLzah+RfS97eSM0zQAK5RGSPOij+PZKK5cn8pzpQHixPs+K3pNKAiMj366DQ2SZLXyqgM2MdIwtJfXapZKokICJyAICjAOxayV6P3ugFAGaQvCd60WKXqBQgIqJQ6EdnoixFV+CZAJQZ0YsWs0TpARGRrwRQKBibFbObvPN6iYISwPJ377xz6FBpARGR/wjAOBpAX4eamakvFXgLwPQAlP8pozClBERERgMYC2CdMnaah236A4ArSF7loW+JXCoVICIyNABjm0SqWOG4CiwMQJkb14Bv5UoBiIhsEYBxiG8CV9SfuwJQXi56+wsNSLBYUG+l9FP2N95Fu9b0Df0VASh/LprzNX8LC4iInBiAoQsILfmrwNsBJNP8dbG5Z4UDRETWDL6Zjiii4BX2+Q79QiP5lyJpUChARERf8Omwrc8cloqngD6TKCT6wrEQqTCAiMjxARyrFkJZc7KZAp8GkNxYBIm8B0REVgFwOYCRRRDUfAytwHUAxpH8R+gSOWT0GhAR0aUhCoduWrJUPgV+GkCiS1e8TN4CIiIHAbgGgO77tlReBXQKeDRJfXfiXfISEBE5FsAt3qllDqWpwHiSerfgVfIOkGAd1ZVeqWTOZKXA5STHZ1VZmHq8AkREJgK4IIzjlqe0CtxF8oe+tM4bQETkNgC6NN2SKfAUSS8mZrwARESeBWArcA2MegWWktwgb0lyB0REPgDwr3kLYfV7qcDHJDWWcW4pV0BERIMw65ZYS6ZAMwWWkcztCzQ3QERkKYBv23VhCoRQ4HmSGqIp85QLICLyM4ssknlfF73CmSQzX8GdOSAicjeAA4veW+Z/LgqcQ/L8LGvOFBAR0U39o7JsoNVVOgV0gaNuecgkZQaIiJwBYHImrbJKyq7ACJI3Z9HITAAREb13vD2LBlkdlVFgGMnZabc2dUBERE9f+olN56bdlZWzrxEdh5DUc05SS6kCEmx2UjgGpdYCM1xlBXQ2VCFJbdNV2oDoqlyNcmjJFEhLgatIjknLeGqAiMhhAGam5bjZNQXqFDic5Kw0FEkFEBHpB+AxAF9Lw2mzaQp0U+CPAHYi+bprZdICRI/v2t21s2bPFGihwEMk9Rg9p8k5ICKiG55045MlUyBrBS4kOcllpU4BEZG9Adzv0kGzZQpEVGAfkg9ELNM0uzNARERt6canXFZduhLE7BReAT1wdFuS4qIlLgGxpSQuesRsuFDgTJKXuDDkBBAR2SQYPdZw4ZTZMAUSKvDXYBR5I6EduAJE33foew9LpoAvCswieXhSZxIDEpw5/uOkjlh5UyAFBQ5MerZ7IkBEpGdwa2XHEaTQu2YysQJ63II+sH8e11JSQM4GcF7cyq2cKZCBAol2IcYGJIi8rtO6vTJopFVhCsRV4JNgFIkVQT4JINcD0HMCLZkCviswjeRJcZyMBYiIaMQ7JdJOe4qjupXJWgE91Wozkr+OWnFcQKYAOC1qZZbfFMhRgakkT49af2RAROTrwejxb1Ers/ymQI4KaIhbHUXej+JDHEDsiIIoCltenxSYRPLCKA5FAkREvhqMHt+IUonlNQU8UeB3wSjyUVh/ogKi+8vt9Kew6lo+HxUYQ1IDGIZKoQERkR4AFgP4TijLlskU8FOB1wBsTvKLMO5FAcSCMIRR1PIUQYHQQR6iAHIPgP2L0Hrz0RRoo8AckgeEUSkUICKiD+W/ArBKGKOWxxTwXAENNLchSX1ob5nCAqIR2UM/2LSr1P5vCnigwGiSV7fzIywgTwDYoZ0x+78pUCAFniS5Yzt/2wIiIt8DoOvqK5s+/PBDvPPOOx2fjz76CH379kWfPn06Pr6nxYsXY8GCBXj77bfx1ltvYaWVVsIGG2yA9dZbD4MHD8bAgQN9b0Ka/m1B8uetKggDiO730H0flUyzZ8/G5MmNjzUZMGAATj75ZPTv399LbaZPn45rr70Wy5cvb+rfYYcdhtNOq+yyuvNJnpMUEF21+10vr4CUnTr66KPx0ksvtaylZ8+eGDVqFPRC8ymNGzcOjz2m0V/bpyFDhuCKKzI7tKm9Q9nleIXkZrEBEZEhQYzd7Fz2pKY999yz45YqbDrxxBNxwgknhM2ear4ocNQc0dFmyy23TNUvT41rTF89oqNhanmLJSKXAxjracNSc+vKK6+EXjBR00knnYTjjz8+ajGn+ePAoQ7069cPt956K1ZbbTWn/hTA2JUkm17j7QBZWLVIifoQvu2228bu15EjR2LEiBGxyycpGBeOWp0TJ07EQQcdlMSFIpZdRFJPQYs2goiIHl3w30VscRKfX3vtNQwbNiyJCeQBSVI4tMEVfhZZh+R7jTq96QgiIvsAuC/RlVLAwvPnz8eECRMSe66zW8OHD09sJ4wBF3BoPb1798bChXrTULnU9EDQVoDo3KbG261Uuv3223H55frolTydcsopOO6445IbamHBFRxaxfrrr4977703VX89NX49yZFRRxA9PXSApw1Kza1nn33W6WyUTgEfe+yxqfjrEg518JBDDnEyeqbS2HSNNp3ubTiCiMiaAJal65Of1t99913svrvbw7HSgMQ1HNobl156KXbZZRc/OyZ9r9YiqfvWu6RmgOhRVvPT98nPGvQbf9GiRU6dGz16NI455hgnNtOAY9CgQbj+eg11Vtm0P8kV7i+bAaKvVVM7Wtf3Lnj11Vc7LubPP48d0rVhE11AkgYcPXr0wB133OHtkpmMrpdrSOqq9VAjiH59bpWRY15WM2vWLEydOtW5b2PGjIEuYYmT0oBD/dAVALoSoOLpRZIrPHM3G0H+BmD1iguGadOm4YYbbnAuw9ixY3HUUUdFsmtwRJIrTuaPSfZuO4IEgeEavjSJU2vRy+h9+Y033ui8GXrBH3nkkaHspgWHT+vHQgmRfqa1uweWW2EEERHdRPJ4+r4Up4brrrsON910k3OHx48fjyOOOKKlXYPDueytDP6ApG4O7EyNANEo2Ndl6lYBKksLklNPPRWHH974pDCDI/MLYyTJLlN5jQBROGKFis+8ORlXqJuPbr75Zue16oal7vtJDA7nMocxuMIb9UaA6O1V2726YWorY55rrrkGt9xyi/Om1UNicDiXN6zBJ0j+oN0tlj6gawR3S00UuPrqqzv2TrhOp59+OpYsWRJ6J2CU+u2BPJRa75NcuykgIqJTuzrFa6mNAmlBkobwBkckVXuT/LhWosstlojoy0G3aywi+VaszFdddRVuu+02r502OCJ3zwCSLzYDZDcAD0U2WeECPkNicMS6MHcn+XAzQHS/5X/FMlvhQnH3sKcpmcERW92DSd7dDBDd3eN+HjO2r8UpqGFzZsyY4YXDBkeibhhOsnOasvsziEZ3cLOdLpGPxSysOxF1R2KeyeBIrP44kp1BwroDci6AlpHmEldfcgOXXXZZx9LxPJLB4UT180gqBx2pOyCVjIPlRNY6I7ozb+bMma7NtrRncDiT+wqS45oBos8f6UYZcNYOvw3pXhLdU5JFMjicqnwLyc5wNN1HEJ3BqlzkMKfy1hnLAhKDw3nv3U3y4GYjiL4D0XchlhwpkCYkBoejTupq5mGSnVE7uo8gtlDRseZpLTxUN8855xzsv78dG+m4y7osWOwOyFwA+zqusLLm0oSjJuq5556L/fbbr7Iap9Dw+0gObXaLpfOTjXfvpOBJmU1mAUdNv/POOw9Dh3b2aZllzaJtM0l2bvPsPoLYZikHXZAlHDV3zz//fOy7rw3+Drqvy6ap7oBcDOBMB5VU1kQecNTEvuCCC7DPPhpz3FICBSaT7Ixe3h0QhUMhsRRDgTzhqLl74YUXYu+9947hvRUJFJhAsvNQyu6AWMCGmNeJD3AYJDE7r2uxLoEbugOiD+j5LCRy0rZ8jPgEh0GS+Bo4gmTnOqHugOhTnk71WgqpgI9w1Fy/6KKLsNdee4VsiWULFBhKsvPgqO6AWNC4CNeJz3DUmnHxxRdDT+y1FFqBLsHjugPyDQC/DW2qwhmLAEeteyZPnow99tATLSyFUOCbJH9Xy9coLtYnAFYNYaiyWdKCQ6Osf/DBB5gzZ45zbS+55BLnBwM5dzJ/g5+S7FXvRiNAfg5g8/x99dODNOGoHUGgy0fSOCtwypQp2G03W4va4spaTPJ77QD5EYBk5yD7eW0n9ioLOGpO6kLEuXPdz5cYJC0vgztJHtoOEH2LeFHiq6lkBrKEoybd2Wefjfvuc38Sty7B33XXXUvWQ06acxbJLi/KG91i2VRvN63zgKPmwqRJk3D//fc76f16IxU/sLOZnl2meDVTI0A2BPCm8x4pqME84ahJNnHiRDzwwAPOFdQAEzvvvLNzuwU2uBHJX7W8xdJ/isgXAFYqcEOduO4DHAaJk64MY+T/SPbonrHZGYWvA9gkjNWy5vEJjprGZ511FubNm+dcco1UP2DACudXOq/Hc4NvkOwXFhANERjuAD3PWx3HvenTp0PDibpOLk6TTQOS/v37dwTh7tmzp+smF8lel41SNcebjSAKhx9xNDOWePHixR1npC9fvtxpzS7gqDk0YcIEzJ8/36l/esKVHuJT4dQl5Gg7QPoC+E0VxdJlGbNnz3badJdw1Bw788wz8eCDDzrzc6211sITT3Q5v9KZ7YIYWuEBXf1uOILoP0RE16OsV5DGOXNzxIgReO6555zZSwOOmnNnnHEGHnrI3WkV+sWw6aabOmt7gQy9R3KdRv62AqSSzyGDBw/GsmXLnPRtmnDUHNRj2x5+uPM4i0R+tzpxN5Fh/wvfQ/LAqIBo+EX3h4N7LpYrQLKAwzUkeqzcDjvs4HkPpeLeWJINZ2VajSDfBbAkFXc8NuriFitLOGpS6gP2ggULYiu78sor4+mnn8bqq+sxlZVLXY5dq299U0Cq+hyS9CE9DzhqHaq3SI888kisq3vHHXeEHidXwdT0+UO1aAdI5YJZP//88xg+vDO4d6TrJU84ao6OHz8ejz76aCS/NbPOiK277rqRy5WgQNPnjzCAjARwbQlEiNSEOAGnfYAjLiQVj6d1MkkNmNgwtRtB+gDQxVuV22E4atQoPPnkk23B6tGjR8eIU9vs1LZARhnCHiyq0Rg1KmNF06cANiT5bixAgueQyt1m1cR6/PHHoXsyPv6481z5LjoOGjSoAw5dquFjWrJkCXTZzAsvvIDPPvus08VevXphq622wqGHHlr1NVhdzgJp1IctR5AAkB8CuNPHCyALn5YuXYqFCxdCl6C8/PLLHffpW2+9NTbeeGPstNNOWbiQuA6FQ2HRjy5K7NevX9XXXdU0HUay5bKJMIB8JbjN+nrinjIDpoA/Crwf3F79vZVLbQEJRpFpAE7wp23miSmQWIEbSJ7YzkpYQHYBEP8tVDsv7P+mQPYK7Eqy7UujUIAEo8hrACq5ki37vrMaU1bgFyS/E6aOKIBcCOCsMEYtjynguQIXkZwYxscogGwB4KUwRi2PKeC5AluSfDmMj6EBCW6z7AzDMKpaHp8VaLi1tpnDUQEZDOCnPrfefDMF2iiwPcmnwqoUCZBgFLkXgB2pGlZhy+eTAnNJRjozOw4gGkffbcQAnyQ0X8qswJ4kI23kjwxIMIroeupirLMoc3db26Io8BjJyGEk4wJyMIC7onhneU2BnBU4hKQuvI2UYgESjCILAXw/Um2W2RTIR4HnSG4Tp+okgBwL4JY4lVoZUyBjBY4jeWucOmMDYs8iceS2MjkoEOvZo+ZnUkDsVNwcetyqjKRAl1NrI5VsF7QhjDER0VAYo8LktTymQMYKXE1ydJI6E40gwW3W1wA8C+CbSRyxsqaAYwX0OPNtSf4xid3EgASQVDIKYxLhrWzqCowgeXPSWpwAEkCib9fttPqkPWLlXSjwIMk9XRhyCch2AH7mwimzYQokVGAQyWcS2ugo7gyQYBSZCuBUF46ZDVMgpgKXknR2EpBrQDQCyk8AbB2zcVbMFEiiwAsAhpBsGakkSgVOAQlGkUEBJKtEccTymgIJFfhHAIfT23zngASQ6Nyz+1MwEypoxUutwBiSzsPTpwJIAMlMAIeVukuscb4oMIvk4Wk4kyYg+gLxMQArnD2dRkPMZmUVeF33JiV9IdhMvdQACUaR3fXoicp2nTU8CwX2IOnuJNNuHqcKSACJxh+6IAulrI7KKTCJpMZrSy2lDkgAyRwAkTbLp9ZiM1wWBeaQPCDtxmQFSM8gtu/2aTfI7FdCgXkA9if5z7RbmwkgwSiyBoCnAYSKiZp2w81+YRXQiZ+hJP83ixZkBkgAic5safhSO2ski94tXx1vAtiG5IdZNS1TQAJIvgVAp+b+JatGWj2lUECXj/Ql+acsW5M5IAEk+m7kF1k21OoqvAJ9SP4h61bkAkgAyZYAXsy6wVZfIRXQkePtPDzPDZAAkv8EEDqQcB4CWZ25K7AdSd3SnUvKFZAAkvUB/DqX1lulviswkKQuYc8t5Q5IAMm6AH4DYOXclLCKfVLgCwCbk9Rj/3JNXgASQGLRUXK9FLyp/M9BNBL9wsw9eQNIAMmaAOYC0GcTS9VTQN9z6Mrc93xpuleABJDott3ZAJxEpfBFaPOjrQL6IL4PyWVtc2aYwTtAAkh0u65CYgscM7wYcqzqAQB6PMGnOfrQsGovAal5KiJTADiLUOGb+OZPhwJTSZ7uqxZeAxKMJgcBUFB0pstSeRT4PYDTSd7tc5O8BySA5NsBJPv6LKb5FlqB+wI4vJipauV1IQCpu+Wy3Ymhr0FvM6a+C9BlywsFSDCa6D73SywYhMvLIBNbuoL7jDT3j6fRisIBEkCiLxV1L/LRaYhiNp0rMB3AxLQijzj3ts5gIQGpu+XaR+9lLdRpmpdIItu6jmoKyfsTWcmxcKEBCUaTHgEkOh381Ry1tKq/VOAjnb4N4NB1VYVNhQekbjTRTVg6mhxa2N4oh+M/CsDQZ47Cp9IAUgfKgQEomxe+d4rVgMUBGD8ultutvS0dIMFt16oBJEcB6FOmDvOwLe8C0IdwfSPu3VKRpHqVEpC60URXBysk+tkkqVhWvosCbwCYoR+SfymrNqUGpA4UXfxYA2VAWTszo3YtqgNDz+QodaoEIPU9KCLDAlh2LHXPum/cE8Focad70/5arBwgdaPK3gB0IeReAFbzt4ty9UyjF2qYz7tJ6pL0yqXKAlIHytoBJArKzpW7Aho3+NEAjHk+7e7Lo28qD0i32y+NG6yg6EfjdlUpaUhYHS0UityDJfgivAHSpCdEZHAAyk4lngHTl3l6KrFCYfHJGlwLBkiIryoR2RjAwOCjR1wXdcr4FQB6CqxGtHyRpPf7MUJ0T6pZDJAY8orIOhqaJvhsB2DTGGayKKJA6Migx04sKuJq2ixEalWHAeKgB0SkFwAdZTYKPrXfNWpkFmkpAA2Z88vgZ8fvJD/JovIy12GApNi7IqIrjWuw6E99Yamnbemn2e/q0efBR1/ENfpd/6YQ1EAo9IrZFLsgsWkDJLGEZqDMChggZe5da1tiBf4fpxDmI+rCZy8AAAAASUVORK5CYII=";

/* eslint-disable */


let Action$1 = class Action {


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


        if (context.setViewClip) context.setViewClip();

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


};

class Clear extends Action$1 {

    
    tap() {
        
        this.shape.destroy(true);
    }

}

class Rotate extends Action$1 {

    constructor(config) {
        super(Object.assign(config, {
            startPoint: null
        }));
    }
    
    move(coords) {

        
        if (!this.startPoint) {
            this.startPoint = coords[0];
        }

        let {
            x,
            y,
            w,
            h
        } = this.shape.bound(); 


        const rectCenterPoint = {
            x: x + w / 2,
            y: y + h / 2
        }; 

        let angle = getAngle(getVector(rectCenterPoint, this.startPoint), getVector(rectCenterPoint, coords[0]));

        this.shape.rotate(angle, coords); 
    }


    
    up() {
        this.startPoint = null;
    }


}

class Scale extends Action$1 {

    constructor(config) {
        super(Object.assign(config, {
            startScale: null,//初始大小
            rectCenterPoint: null//中心点
        }));
    }

    move(coords) {


        if (!this.startScale) {

            let {
                x,
                y,
                w,
                h
            } = this.shape.bound();

            this.rectCenterPoint = {
                x: x + w / 2,
                y: y + h / 2
            };


            this.startScale = getLength(getVector(this.rectCenterPoint, coords[0]));
        }


        let current = getLength(getVector(this.rectCenterPoint, coords[0]));
        this.shape.scale(current / this.startScale, coords);
    }


    up() {
        this.startScale = null;
        this.rectCenterPoint = null;
    }


}

let Do$1 = class Do extends Action$1 {

    
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

};

class Action {

    
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
            
            this.action.push(new Do$1({
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

var Meta = {

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


};

var Render = {
    
    _draw: null, 
    _rotate: null, 
    _init: null, 
    draw: null, 
    
    render() {
        if (this._stage) {
            
            this._stage.render();
        }
    }
};

var State = {


    _active(status, flag = true) {


        if (status === this.actived) return;


        if (this.canActive && status) {
            this.emit('active', {type: 'active', shape: this});
            this.stage().emit("active", {type: 'active', shape: this});
            this.actived = status;
        } else {

            this.emit('deactivate', {type: 'deactivate', shape: this});

            if (flag) {
                this.stage().emit("deactivate", {type: 'deactivate', shape: this});
            }
            this.actived = false;
        }


        this.render();
    },


    active() {
        this._active(true);
    },


    deactivate(flag = true) {
        this._active(false, flag);
    },


    toggle() {
        this._active(!this.actived);
        return this.actived;
    },


    props(options = {}) {


        const config = Object.assign({
            element: true,
            private: true,
            relative: false,
            ignore: []
        }, options);


        const props = Object.create(null);


        for (let i in this) {


            if (config.ignore.indexOf('i') > -1) {
                continue;
            }


            if (typeof this[i] == "function") {
                continue;
            }


            if (!config.private && i.startsWith('_')) {
                continue;
            }

            const type = typeof this[i];


            if (this[i] !== null && (type === 'object')) {

                if (this[i].nodeType !== undefined && !config.element) {
                    continue;
                }
            }


            if (i.startsWith('_')) {
                props[i] = this[i];

            } else if (this[i] !== null && type === 'object' && this[i].nodeType !== undefined) {
                props[i] = this[i];
            } else {
                props[i] = cloneDeep(this[i], config);
            }


        }


        props.zIndex = this.getIndex();
        props.actived = false;
        props.outline = false;


        if (config.relative) {
            return Object.assign(props, this.relative());
        } else {
            return props;
        }


    },


    toJson(config) {


        const props = this.props(Object.assign({
            element: false,
            private: false
        }, config));


        if (this._stage) {
            props.zIndex = this._stage.getIndex(this);
        }


        return JSON.stringify(props);
    },


    bound() {
    },


    getRotateCoords() {


        const bound = this.bound();
        const coords = [];


        coords.push(rotateVector(
            {x: bound.x, y: bound.y},
            radToDegree(this.rotateRadius),
            this.getCenterPoint()
        ));

        coords.push(rotateVector(
            {x: bound.x + bound.w, y: bound.y},
            radToDegree(this.rotateRadius),
            this.getCenterPoint()
        ));

        coords.push(rotateVector(
            {x: bound.x + bound.w, y: bound.y + bound.h},
            radToDegree(this.rotateRadius),
            this.getCenterPoint()
        ));

        coords.push(rotateVector(
            {x: bound.x, y: bound.y + bound.h},
            radToDegree(this.rotateRadius),
            this.getCenterPoint()
        ));

        return coords;
    },


    getRotateBound() {


        if (this.rotateRadius === 0) {
            return this.bound();
        }

        return this.getReference(this.getRotateCoords());
    },


    stage() {
        return this._stage;
    }
    ,


    getContext() {
        return this._context;
    }
    ,


    getIndex() {

        const parent = this.stage();

        if (!parent) return -1;

        return this._group ? this._group.getShapeIndex(this) : parent.getIndex(this);
    }
    ,


    moveIndex(target, action = true, force = false) {


        if (!this.canSort && !force) return -1;


        const index = this.getIndex();


        if (index < 0) {
            return -1;
        }


        const shapes = this._group ? this._group.getShapes() : this.stage().shapes();


        if (target < 0 || target >= shapes.length) {
            return -1;
        }

        const shape = this;


        const direction = target === 0 ? 0 : (target > index ? 1 : -1);


        let currentIndex = target;


        if (!force) {


            do {


                const currentshape = shapes[currentIndex];

                if (currentshape.canSort) {
                    break;
                }

                currentIndex += direction;

            } while (currentIndex > 0 && currentIndex < shapes.length)
        }


        if (currentIndex < 0 || currentIndex >= shapes.length) {
            return -1;
        }


        if (currentIndex === index) {
            return -1;
        }


        if (!action) {
            return currentIndex;
        }


        this.emit('before-sort', {
            type: 'before-sort',
            shape,
            index: currentIndex
        });


        this.stage().emit('before-sort', {
            type: 'before-sort',
            index: currentIndex,
            shape
        });


        if (direction === 1) {
            for (let i = index; i < currentIndex; i++) {
                shapes[i] = shapes[i + 1];
            }
        } else {
            for (let i = index; i > currentIndex; i--) {
                shapes[i] = shapes[i - 1];
            }
        }


        shapes[currentIndex] = shape;


        this.emit('after-sort', {
            type: 'after-sort',
            shape,
            index: currentIndex
        });


        this.stage().emit('after-sort', {
            type: 'after-sort',
            shape,
            index: currentIndex
        });


        this.render();
        return currentIndex;

    }
    ,


    moveTop(action = true) {
        return this.moveIndex(this.stage().shapes().length - 1, action);
    }
    ,


    moveBottom(action = true) {
        return this.moveIndex(0, action);
    }
    ,


    forward(action = true) {
        return this.moveIndex(this.getIndex() + 1, action);
    }
    ,


    backward(action = true) {
        return this.moveIndex(this.getIndex() - 1, action);
    }
    ,


    destroy(flag = false) {


        if (this._stage) {

            (this._group ? this._group : this.stage()).remove(this, flag);
            this.render();
        }
    }
    ,


    bindContext(context) {
        this._context = context;
    }
    ,


    ColorBound() {


        const bound = this.stage().bound();
        const offScreen = this.stage().createCanvas(bound._w, bound._h);
        const offContext = offScreen.context;
        const context = this.getContext();


        offContext.dpr(1);
        offContext.clearRect(0, 0, bound._w, bound._h);


        const blendMode = this.blendMode;


        this.bindContext(offContext);
        this.blendMode = "source-over";
        this.draw(false);
        this.bindContext(context);


        this.blendMode = blendMode;


        const imageData = offContext.getImageData(0, 0, Math.round(bound._w), Math.round(bound._h));


        let minX = bound._w;
        let minY = bound._h;
        let maxX = 0;
        let maxY = 0;


        for (let y = 0; y < bound._h; y++) {
            for (let x = 0; x < bound._w; x++) {
                const index = (y * bound._w + x) * 4;
                const alpha = imageData.data[index + 3];
                if (alpha > 0) {
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                }
            }
        }


        const drp = toFixedNumber(this.stage().dpr(), 3);

        return {
            _x: toFixedNumber(minX, 3),
            _y: toFixedNumber(minY, 3),
            _w: toFixedNumber((maxX - minX), 3),
            _h: toFixedNumber((maxY - minY), 3),
            x: toFixedNumber((minX * drp), 3),
            y: toFixedNumber((minY * drp), 3),
            w: toFixedNumber(((maxX - minX) * drp), 3),
            h: toFixedNumber(((maxY - minY) * drp), 3)
        }

    }
    ,


    getColorBound(force = false) {


        if (force) {
            return this.ColorBound();
        }


        if (!this._colorBound) {
            this._colorBound = this.ColorBound();
        }

        return this._colorBound;
    }
    ,


    getReference() {

        const stage = this.stage();


        if (this._group) {

            const bound = this._group.bound();

            return {
                x: bound.x * stage.dpr(),
                y: bound.y * stage.dpr(),
                w: bound.w * stage.dpr(),
                h: bound.h * stage.dpr(),
                _x: bound.x,
                _y: bound.y,
                _w: bound.w,
                _h: bound.h
            }
        }

        const viewBound = stage.getViewBound();


        return viewBound && this.reference === 'view' ? viewBound : stage.bound();

    }
    ,


    canShowOutline() {
        return this.stage().canShowOutline();
    }
    ,


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
                relative: false
            });


            props.reference = 'stage';


            props.x += 10;
            props.y += 10;


            this.actived = false;


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
    ,


    adjustX(gap = 1) {


        if (!this._group) {
            this.emit("before-adjust", {type: 'before-adjust', shape: this, direction: 'x'});
        }

        this.x += gap;


        if (!this._group) {
            this.emit("after-adjust", {type: 'after-adjust', shape: this, direction: 'x'});
        }


        this.render();


    }
    ,


    adjustY(gap = 1) {


        if (!this._group) {
            this.emit("before-adjust", {type: 'before-adjust', shape: this, direction: 'y'});
        }


        this.y += gap;


        if (!this._group) {
            this.emit("after-adjust", {type: 'after-adjust', shape: this, direction: 'y'});
        }

        this.render();


    },


    flipX() {


        if (!this._group) {
            this.emit("before-flip", {type: 'before-flip', shape: this, direction: 'x'});
        }


        this.flip.x = this.flip.x * -1;


        if (!this._group) {
            this.emit("after-flip", {type: 'after-flip', shape: this, direction: 'x'});
        }


        this.render();
    }
    ,


    flipY() {


        if (!this._group) {
            this.emit("before-flip", {type: 'before-flip', shape: this, direction: 'y'});
        }


        this.flip.y = this.flip.y * -1;


        if (!this._group) {
            this.emit("after-flip", {type: 'after-flip', shape: this, direction: 'y'});
        }


        this.render();
    }
    ,


    group(group) {
        this._group = group;
    }
    ,


    ungroup(adjust = true) {


        this._group.remove(this, true, adjust);
        this._group = null;


        this.stage().pauseEvent('before-add');

        this.stage().add(this);

        this.stage().resumeEvent('before-add');
    }
    ,


    setAttr(attr, value) {
        this[attr] = value;
        this.render();
    }
    ,


    getCenterPoint() {
        let {x, y, w, h} = this.bound();
        return {x: x + w / 2, y: y + h / 2};
    }
    ,


    getReferCenterCoords(newCenter) {


        const center = this.getCenterPoint(true);

        return {
            x: this.x + (newCenter.x - center.x),
            y: this.y + (newCenter.y - center.y),
        }
    }

};

var Snap = {


    
    save() {
        return this.props();
    },

    
    restore(snap) {
        this.each(snap);
    },

};

let Shape$1 = class Shape {
    
    constructor(config) {
        
        
        Object.assign(this, config); 

        
        this._listener = new Map();

        
        this._previous = {
            x: null,
            y: null,
            zoom: null,
            rotate: null
        };
    }
};


Object.assign(Shape$1.prototype, Meta, Action$2, Event, State, Render, Snap);

let Image$1 = class Image extends Shape$1 {

    
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
            });


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
                });
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
        ];

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

};

class Text extends Shape$1 {

    
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
                });
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

            
            const center = this.stage().getLimit() && coords.length > 1 ? getVectorCenter(coords[0], coords[1]) : (!!this._group ? this._group.getCenterPoint() : this.getCenterPoint());

            
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
                });
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
        ];

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

class Group extends Shape$1 {

    
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
                this.h = this.w / this.ratio;
            }

            
            if (!this.w && this.h) {
                this.w = this.h * this.ratio;
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
                });
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
        ];

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

var shapes = {
    Image: Image$1,
    Text,
    Group
};

var Shape = {

    
    async add(shape, zIndex = -1) {


        
        this.emit('before-add', {
            type: 'before-add',
            shape
        });


        
        this._shapes.push(shape);

        
        const fixed = []; 

        
        for (let i of this._shapes) {
            if (i.fixed) {
                fixed.push(i);
            }
        }

        
        shape.each({
            _stage: this,
            _context: this.getContext()
        });

        
        const length = this._shapes.length;

        
        for (let i of fixed) {
            
            i.moveIndex(i.fixed < 0 ? length + i.fixed : i.fixed - 1, true, true);
        }

        
        if (zIndex >= 0) {
            shape.moveIndex(zIndex);
        }

        await shape.init(); 

        
        if (shape.actived) {
            this.active(shape); 
        }


        
        this.emit('after-add', {
            type: 'after-add',
            shape
        });


        this.render(); 
        return shape;
    },


    
    active(shape) {

        
        if (!this._multiActive) {
            for (let i of this.shapes()) {
                i.deactivate(false);
            }
        }

        
        shape.active();
        
        this._actived = shape;
    },


    
    get(name) {
        for (let shape of this._shapes) {
            if (shape.name === name) {
                return shape;
            }
        }
    },

    
    remove(shape, flag = false) {


        
        if (flag) {

            
            this.emit("before-delete", {type: 'before-delete', shape});

            const index = this._shapes.indexOf(shape);

            if (index > -1) {
                this._shapes.splice(index, 1);
            }

        } else {

            
            if (!shape) return false;
            if (!shape.canRemove) return false;

            
            this.emit("before-delete", {type: 'before-delete', shape});

            
            this._shapes = this._shapes.filter(function (elem) {

                
                if (!elem.canRemove) {
                    return true;
                }

                
                if (typeof shape == "string") {
                    return elem.name !== shape;
                } else {
                    return elem !== shape;
                }
            });
        }

        
        if (shape.actived) {

            
            this.emit('deactivate', {
                type: "deactivate",
                shape: shape
            });

            this._actived = null; 
        }

        
        this.emit("after-delete", {type: 'after-delete', shape});

        
        this.render(); 
    },


    
    load(json, flag = true) {

        if (typeof json === "string") {
            json = JSON.parse(json);
        }

        
        if (!json.type) {
            console.warn("json缺少关键参数！");
            return false;
        }

        
        if (!shapes[json.type]) {
            console.warn(json.type + "图形不存在！");
            return false;
        }

        
        const shape = new shapes[json.type](json); 

        if (flag) {
            
            this.add(shape, json.zIndex);
            
            this.render(); 
        }


        return shape;

    },


    
    clear() {

        
        this._shapes = this._shapes.filter(function (elem) {
            return !elem.canRemove;
        });


        
        if (this._actived) {
            this.emit('deactivate', {
                type: "deactivate",
                shape: this._actived
            });
            this._actived = null; 
        }

        
        this.emit('clear', {
            type: "clear",
            shape: this._actived
        });

        
        this.render(); 
    },


    
    hiddenOutline() {
        this.config.showOutline = false;
    },


    
    showOutline() {
        this.config.showOutline = true;
    },


    
    canShowOutline() {
        return this.config.showOutline;
    }
};

var Props = {

    
    enableMultiActive() {
        this._multiActive = true;
    },


    
    disableMultiActive() {

        
        this._actived = null;
        this._multiActive = false;

        
        for (let i of this.shapes()) {
            i.deactivate();
        }

        
        this._render(false); 

    },


    
    getConfig() {

        const config = this.config;
        const viewBound = this.getViewBound();
        const bound = viewBound ? viewBound : this.bound();


        return {
            
            maxWidth: bound._w * config.maxWidth,
            maxHeight: bound._h * config.maxHeight,
            sensitivity: config.sensitivity, 
            minRotatable: config.minRotatable, 
            themeColor: config.themeColor, 
            activeColor: config.activeColor
        }

    },


    
    setConfig(key, value) {
        this.config[key] = value;
    },


    
    getContext() {
        return this._useBuffer ? this._custom.bufferContext : this._custom.context;
    },


    
    getElement() {
        return this._elem;
    },


    
    setElementStyle(style) {
        
        const elem = this.getElement();
        
        for (let i in style) {
            elem.style[i] = style[i];
        }
        
        this._initBound();
    },


    
    setOffset(offset) {

        
        if (offset.x === null || offset.y === null) {
            return;
        }

        
        offset.y = percentToValue(offset.y, this.bound()._h);
        offset.x = percentToValue(offset.x, this.bound()._w);


        
        const elem = this.getElement();
        elem.setAttribute('style', `transform:translateX(${offset.x}px) translateY(${offset.y}px);`);
        this._scale = 1; 

        
        offset.y += this.$offset.y;
        offset.x += this.$offset.x;

        this._offset = offset; 


    },


    
    resetOffset() {
        
        this.setOffset({
            x: 0,
            y: 0
        });
    },

    
    scale(zoom) {
        
        const elem = this.getElement();
        elem.setAttribute('style', `transform:scale(${zoom})`);
        this._scale = zoom; 
    },

    
    getScale() {
        return this._scale;
    },

    
    getQueue() {
        return this._queue;
    },

    
    clearQueue() {
        this._queue = [];
    },

    
    addQueueTask(task) {
        this._queue.push(task);
    },

    
    getModel() {
        return this._model;
    },

    
    renderModel() {

        const model = this.getModel();
        const context = model.context;
        const shapes = model.shapes;

        context.beginPath();
        context.clearRect(0, 0, this._bound.w, this._bound.h);

        for (const i of shapes ) {
            i.draw(); 
        }
    },


    
    addModel(shape) {
        
        const that = this;
        
        const model = this.getModel();
        
        model.shapes.push(shape);
        
        shape.set({
            _stage: this,
            _context: model.context,
            render: () => {
                that.renderModel();
            }
        });
        
        shape.init();
        
        this.renderModel();
    },


    
    getModelShapes(flag = false, index = -1) {

        
        const model = this.getModel();

        
        if (index === -1) {
            if (flag) {
                return model.shapes.map(item => {
                    return item;
                });
            } else {
                return this._shapes;
            }
        } else {
            if (typeof index === "number") {
                return model.shapes[index] ? model.shapes[index] : null;
            } else if (typeof index === 'string') {
                for (let i of model.shapes) {
                    if (i.name === index) {
                        return i;
                    }
                }
            }
        }

    },


    
    setModel(shape) {
        
        const model = this.getModel();
        model.shapes = []; 
        this.addModel(shape); 
    },

    
    clearModel() {
        
        const model = this.getModel();
        
        model.shapes = [];
        
        this.renderModel();
    },


    
    reset() {
        this.clear();
        this.clearView();
        this.clearModel();
        this.emit('reset');
    },

    
    clearView() {
        this._view.shape = null;
    },


    
    async setView(shape) {

        const that = this;


        
        shape.set({
            _stage: this,
            _context: this._custom.context,
        });

        
        await shape.init();

        that._view.shape = shape;
        that._view.bound = shape.getColorBound();

        
        
        this.getContext().setViewClip = () => {
            const {_x, _y, _w, _h} = this._view.bound;
            this.getContext().rect(_x, _y, _w, _h);
            this.getContext().clip();
        };
    },


    
    toJson() {

        const json = {
            model: [],
            custom: [],
            view: null
        }; 


        const model = this.getModel(); 

        
        if (model.shapes && model.shapes.length > 0) {
            
            for (let i of model.shapes) {
                json.model.push(i.props({
                    element: false, 
                    private: false, 
                    relative: true 
                }));
            }
        }

        
        for (let i of this._shapes) {
            json.custom.push(i.props({
                element: false, 
                private: false, 
                relative: true 
            }));
        }


        
        if (this._view.shape) {
            
            json.view = this._view.shape.props({
                element: false, 
                private: false, 
                relative: true 
            });
        }

        
        return JSON.stringify(json);

    },


    
    async loadJson(json, param = {}) {


        
        this.emit('load-json');

        
        const config = Object.assign({
            view: true,  
            model: true, 
            custom: true 
        }, param);

        
        if (typeof json === "string") {
            try {
                json = JSON.parse(json);
            } catch (e) {
                console.warn(e.message);
                return;
            }
        }


        
        if (config.model && !!json.model && Array.isArray(json.model)) {


            
            const model = this.getModel();
            model.shapes = [];


            
            for (let shape of json.model) {
                this.addModel(this.load(shape, false));
            }

            this.renderModel(); 

        }


        
        if (config.view && !!json.view) {
            this.clearView(); 
            const view = this.load(json.view, false);
            await this.setView(view); 
        }


        
        if (config.custom && !!json.custom && Array.isArray(json.custom)) {

            this._shapes = []; 

            
            for (let shape of json.custom) {
                this.load(shape);
            }

            this.render(); 
        }


        
        this.clearSnap();
        
        this.emit('loaded-json');

    },


    
    async loadJsonWithSnap(json, param = {}) {

        
        if (!json) return;

        
        this.emit('load-json-with-snap');


        
        const config = Object.assign({
            view: true,  
            model: true, 
            custom: true 
        }, param);


        
        if (typeof json === "string") {
            try {
                json = JSON.parse(json);
            } catch (e) {
                console.warn(e.message);
                return;
            }
        }


        
        const snapshot = {
            model: [],
            custom: [],
            view: null
        };

        
        if (config.model && !!json.model && Array.isArray(json.model)) {

            
            const model = this.getModel();


            
            for (let item of json.model) {

                const shape = this.load(item, false);

                
                shape.each({
                    _stage: this,
                    _context: model.context
                });

                
                await shape.init();

                snapshot.model.push(shape);

            }
        }

        let viewBound = null; 

        
        if (config.view && !!json.view) {

            
            const view = this.load(json.view, false);

            
            view.set({
                _stage: this,
                _context: this._custom.context,
            });

            
            await view.init();

            snapshot.view = view;
            viewBound = view.getColorBound();

        }


        
        if (config.custom && !!json.custom && Array.isArray(json.custom)) {

            
            for (let item of json.custom) {

                
                const shape = this.load(item, false);

                
                snapshot.custom.push(shape);


                
                shape.each({
                    _stage: this,
                    _context: this.getContext()
                });

                
                const methods = {
                    getReference: shape.getReference
                };

                
                shape.getReference = function () {
                    return viewBound && this.reference === 'view' ? viewBound : this.bound();
                };

                
                if (shape.type === 'Group') {

                    
                    methods.unbind = shape.unbind;

                    
                    shape.unbind = function () {

                        
                        const center = this.getCenterPoint();

                        
                        for (let i of this.getShapes(true)) {


                            
                            if (i.type === 'Text') {
                                i.updateBound();
                            }


                            
                            const coords = rotateVector(
                                i.getCenterPoint(),
                                radToDegree(i.rotateRadius),
                                center
                            );


                            
                            const newCoords = i.getReferCenterCoords(coords);

                            
                            i.adjustX(newCoords.x - i.x);
                            i.adjustY(newCoords.y - i.y);


                            
                            i._group.remove(this, true, false);
                            i._group = null; 
                            snapshot.custom.push(i);

                        }

                        
                        const index = snapshot.custom.indexOf(this);

                        if (index > -1) {
                            snapshot.custom.splice(index, 1);
                        }
                    };


                }


                
                await shape.init();


                
                for (let i in methods) {
                    shape[i] = methods[i];
                }

            }

        }


        
        this.emit('loaded-jso-with-snap');
        return snapshot;
    }
    ,


    
    getCenterPoint() {
        const bound = this.bound();
        return {
            x: this._offset.x + bound._w / 2,
            y: this._offset.y + bound._h / 2
        }
    }
    ,

    
    filterCoords(coords) {

        
        const zoom = this.getScale();
        const center = this.getCenterPoint();


        
        for (let coord of coords) {

            coord.x -= this._offset.x;
            coord.y -= this._offset.y;

            coord.x = center.x - (center.x - coord.x) / zoom;
            coord.y = center.y - (center.y - coord.y) / zoom;

        }

        return coords;
    },


    
    stop() {
        this._stop = true;
    },


    
    resume() {
        this._stop = false;
    }
};

class Stack {


    constructor(maxLength) {
        this.maxLength = maxLength;
        this.queue = [];
    }

    get length() {
        return this.queue.length;
    }

    push(item) {
        if (this.queue.length >= this.maxLength) {
            this.queue.shift();
        }
        this.queue.push(item);
    }

    pop() {
        return this.queue.pop();
    }

    clear() {
        this.queue = [];
    }
}

var Do = {
    
    z: new Stack(30),
    
    y: new Stack(30),
    
    n: 30,
    
    r(snapshot = null) {
        if (!this._stack) return;
        this.z.push(snapshot ? snapshot : this.snap());
        this.y.clear(); 
        this.snapTest();
    },
    
    async alter(snapshot, flag = false) {

        
        if (flag) {

            
            await this.setView(snapshot.view);
            this.getModel().shapes = snapshot.model;
            this._shapes = snapshot.custom;

            
            this.render();
            this.renderModel();


        } else {

            
            const shapes = []; 

            for (let i of snapshot) {
                const shape = i.shape;
                shape.restore(i.snap);
                shapes.push(shape);
            }

            this._shapes = shapes;
            this.snapTest();
            this.render();
        }

    },
    
    undo() {
        
        if (this.z.length === 0) return;
        
        this.y.push(this.snap()); 
        
        const snapshot = this.z.pop();
        
        this.alter(snapshot);
        
        this.emit('undo', {type: 'undo'});
        
        this.emit('deactivate', {type: 'deactivate'});
    },
    
    redo() {
        
        if (this.y.length === 0) return;
        
        this.z.push(this.snap()); 
        
        const snapshot = this.y.pop();
        
        this.alter(snapshot);
        
        this.emit('redo', {type: 'redo'});
        
        this.emit('deactivate', {type: 'deactivate'});
    },
    
    snap(flag = false) {

        
        if (flag) {

            
            const snapshot = {
                model: [],
                custom: [],
                view: null
            };

            
            snapshot.view = this._view.shape;
            snapshot.model = this.getModel().shapes;
            snapshot.custom = this.shapes();

            return snapshot;

        } else {

            
            const snapshot = [];

            
            for (let i of this.shapes()) {
                snapshot.push({
                    shape: i,
                    snap: i.save()
                });
            }

            return snapshot;

        }


    },
    
    clearSnap() {
        this.z.clear();
        this.y.clear();
        this.snapTest();
    },
    
    snapTest() {
        
        this.emit('snap-change', {
            type: 'snap-change',
            z: this.z.length,
            y: this.y.length
        });
    }
};

class Stage {

    
    constructor(drawer) {

        
        Object.assign(this, {
            _elem: drawer, 
            _custom: {}, 
            _model: {}, 
            _shapes: [], 
            _global: window, 
            _event: Object.create(null), 
            _gesture: null,
            _queue: [], 
            
            _view: {
                bound: null, 
                shape: null  
            },
            
            _offset: {
                x: 0, 
                y: 0  
            },
            
            $offset: {
                x: 0, 
                y: 0  
            },
            
            _scale: 1,
            
            _bound: {
                x: 0,     
                y: 0,     
                w: null,  
                h: null,  
                
                _w: null, 
                _h: null  
            },
            _loop: true, 
            _mode: 'auto', 
            _limit: false, 
            _stop: false, 
            _clicked: null, 
            _actived: null, 
            _isMoving: false, 
            _dpr: window.devicePixelRatio, 

            
            _startOffset: null, 
            _startPoint: null,  //触摸/点击的初始坐标
            _new: true, 
            _multiActive: false, 
            _useBuffer: false, 
            _stack: true, 


            
            config: {
                maxWidth: 0.80,
                maxHeight: 0.80,
                sensitivity: 50, 
                minRotatable: 0.15, 
                themeColor: "#528ffa", 
                activeColor: "#FFFFFF95", 
                showOutline: true 
            }
        }); 

        
        this._init();

    }
}


Object.assign(Stage.prototype, Boot, Getter, Event$1, Shape, Props, Do);

var index = {
    Stage,
    Image: Image$1,
    Text,
    Group
};

export { chooseFile, cloneDeep, debounce, index as default, delay, downloadBlob, getAngle, getBoundingBox, getCoordsBox, getCoordsByBound, getEnd, getLength, getPosOfEvent, getVector, isOutBound, loadImage, moveElem, radToDegree, renameProperty, reverseRotatePoint, rotateVector, scaleVector, throttle };
