



export function renameProperty(obj, oldProp, newProp) {
    
    if (obj.hasOwnProperty(oldProp)) {
        
        const prop = obj[oldProp];
        
        delete obj[oldProp];
        
        obj[newProp] = prop;
    }
}



export function moveElem(arr, element, index) {

    
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



export function getPosOfEvent(ev) {
    
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


export function getEnd(ev) {
    
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




export function chooseFile() {
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



export function loadImage(url, callback, error = null, cache = true) {

    
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
    }
}



export function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}



export function delay(callback, time) {
    let timer = setTimeout(() => {
        clearTimeout(timer);
        callback();
    }, time);
}



export function throttle(cb, wait = 3000) {
    let previous = 0;
    return (...args) => {
        const now = +new Date();
        if (now - previous > wait) {
            previous = now;
            cb.apply(this, args);
        }
    }
}



export function debounce(func, wait, immediate) {
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




export function cloneDeep(obj, config = {}) {

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
