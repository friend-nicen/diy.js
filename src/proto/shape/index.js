import Action from './action'
import Event from './event'
import Meta from './meta'
import Render from './render'
import State from './state'
import Snap from './snap'

class Shape {
    
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
}


Object.assign(Shape.prototype, Meta, Action, Event, State, Render, Snap);

export default Shape

