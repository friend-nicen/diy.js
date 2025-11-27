import Boot from './boot'
import Getter from './getter'
import Event from './event'
import Shape from './shape'
import Props from './props'
import Do from "./do";


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
            _dpr: window.devicePixelRatio < 1 ? 1 : window.devicePixelRatio, //屏幕的Dpr值


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


Object.assign(Stage.prototype, Boot, Getter, Event, Shape, Props, Do);


export default Stage