import {percentToValue} from "../utils/math";
import {radToDegree, rotateVector} from "../utils/vector";


export default {

    
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
        }
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
        }, param)

        
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
        
        this.emit('loaded-json')

    },


    
    async loadJsonWithSnap(json, param = {}) {

        
        if (!json) return;

        
        this.emit('load-json-with-snap');


        
        const config = Object.assign({
            view: true,  
            model: true, 
            custom: true 
        }, param)


        
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
                }

                
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
                    }


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

            coord.x = center.x - (center.x - coord.x) / zoom
            coord.y = center.y - (center.y - coord.y) / zoom

        }

        return coords;
    },


    
    stop() {
        this._stop = true;
    },


    
    resume() {
        this._stop = false;
    }
}