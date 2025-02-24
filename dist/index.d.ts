declare class Shape {

    constructor(config: object);


    x: number | null;

    y: number | null;

    name: string | null;

    type: string;

    zIndex: number;

    fixed: boolean | null;


    actived: boolean;

    clicked: boolean;

    queue: boolean;

    _acting: boolean;


    rotateRadius: number;

    rotateAroundCenter: boolean;

    blendMode: string;

    stroke: boolean;

    fill: boolean;

    strokeStyle: string;

    fillStyle: string;

    fillRule: string;

    outline: boolean;


    canMove: boolean;

    canRotate: boolean;

    canScale: boolean;

    canUp: boolean;

    canRemove: boolean;

    canClick: boolean;

    canActive: boolean;

    canExport: boolean;

    canSort: boolean;

    canDo: boolean;

    canFlip: boolean;


    _stage: any;

    _context: any;

    _preview: any | null;

    _startAgree: any | null;

    _startBound: any | null;

    _action: any | null;

    _colorBound: any | null;

    _group: any | null;


    // @ts-ignore
    _listener: Map<string, Function[]>;

    _previous: {
        x: number | null;
        y: number | null;
        zoom: number | null;
        rotate: number | null;
    };


    button_2_Text: string;

    reference: string;


    init(): Promise<void>;


    set(config: object): void;


    render(): void;


    save(): object;


    restore(snap: object): void;


    emit(event: string, data: any): Promise<void>;


    on(event: string | string[], listener: Function): void;


    off(event: string | string[], listener: Function): void;


    removeAlllistener(event: string): void;


    move(coords: Array<{ x: number, y: number }>, offset: { x: number, y: number }): boolean;


    scale(zoom: number, coords: Array<{ x: number, y: number }>): void;


    tap(coords: Array<{ x: number, y: number }>): boolean;


    rotate(rad: number, coords: Array<{ x: number, y: number }>): boolean;


    up(coords: Array<{ x: number, y: number }>): void;


    export(param?: object): Promise<Blob | string>;


    _active(status: boolean, flag?: boolean): void;


    getRotateCoords(): Array<{ x: number, y: number }>;


    getRotateBound(): Bound;


    stage(): Stage;


    getContext(): any;


    getIndex(): number;


    moveIndex(target: number, action?: boolean, force?: boolean): number;


    moveTop(action?: boolean): number;


    moveBottom(action?: boolean): number;


    forward(action?: boolean): number;


    backward(action?: boolean): number;


    destroy(flag?: boolean): void;


    bindContext(context: any): void;


    ColorBound(): {
        w: string;
        x: string;
        h: string;
        _w: string;
        y: string;
        _x: string;
        _h: string;
        _y: string;
    };


    toJson(config?: object): string;


    relative(): object;


    active(): void;


    deactivate(flag?: boolean): void;


    toggle(): boolean;


    props(options?: {
        element?: boolean;
        private?: boolean;
        relative?: boolean;
        ignore?: string[];
    }): object;
}

declare class Text extends Shape {

    constructor(config: object);


    button_2_Text: string;

    canDo: boolean;

    canFlip: boolean;

    _bound: {
        x: number | null;
        y: number | null;
        w: number | null;
        h: number | null;
    };

    flip: {
        x: number;
        y: number;
    };

    maxWidth: number;

    maxHeight: number;

    text: string;

    fontSize: number;

    fontFamily: string;

    textColor: string;

    bold: boolean;

    italic: boolean;

    textDecoration: boolean;

    textBaseline: string;

    textAlign: string;

    background: boolean;

    cornerRadius: number;

    backgroundColor: string;

    border: number;

    borderColor: string;

    padding: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };


    direction: string;

    maxLineWidth: number | null;

    letterSpacing: number;

    lineSpacing: number;

    spacingLeft: number;

    spacingTop: number;


    input(text: string): void;


    append(text: string): void;


    setFont(font: string): void;


    updateBound(): void;


    getText(): string;
}

declare class Image extends Shape {

    constructor(config: object);


    w: number | null;

    h: number | null;

    url: string | null;

    originWidth: number | null;

    originHeight: number | null;

    image: HTMLImageElement | null;

    button_2_Text: string;

    canDo: boolean;

    canFlip: boolean;

    flip: {
        x: number;
        y: number;
    };


    update(config: object): void;
}

declare class Group extends Shape {

    constructor(config: object);


    w: number | null;

    h: number | null;

    shapes: Shape[];

    canFlip: boolean;

    ratio: number;

    button_2_Text: string;

    canDo: boolean;
    fit: boolean;
    rule: string;
    _activeChild: Shape | null;
    flip: {
        x: number;
        y: number;
    };
    _inited: boolean;
    _initedBound: boolean;

    clickText(x: number, y: number, flag?: boolean, coords?: Array<{ x: number, y: number }>): boolean;

    getCenterPoint(): { x: number, y: number };

    scale(zoom: number, coords: Array<{ x: number, y: number }>): void;

}

declare class Stage {
    constructor(drawer: HTMLElement);


    _elem: HTMLElement;
    _custom: Record<string, any>;
    _model: Record<string, any>;
    _shapes: Shape[];
    _global: Window;
    _event: Record<string, any>;
    _gesture: any;
    _queue: any[];
    _view: {
        bound: any;
        shape: any;
    };
    _offset: {
        x: number;
        y: number;
    };
    $offset: {
        x: number;
        y: number;
    };
    _scale: number;
    _bound: {
        x: number;
        y: number;
        w: number | null;
        h: number | null;
        _w: number | null;
        _h: number | null;
    };
    _loop: boolean;
    _mode: 'auto' | 'event';
    _limit: boolean;
    _stop: boolean;
    _clicked: Shape | null;
    _actived: Shape | null;
    _isMoving: boolean;
    _dpr: number;
    _startOffset: { x: number, y: number } | null;
    _startPoint: { x: number, y: number } | null;
    _new: boolean;
    _multiActive: boolean;
    _useBuffer: boolean;
    _stack: boolean;
    _pauseEvent: string[];


    config: {
        maxWidth: number;
        maxHeight: number;
        sensitivity: number;
        minRotatable: number;
        themeColor: string;
        activeColor: string;
        showOutline: boolean;
    };


    z: any;
    y: any;
    n: number;


    _init(): void;

    _initBound(): void;

    _initStyle(): void;

    _initCanvas(): void;

    _initModel(): void;

    _iniCanvasProxy(canvas: HTMLCanvasElement, w?: number | null, h?: number | null): void;

    _iniContextProxy(context: CanvasRenderingContext2D): void;

    _initGesTure(): void;

    _initEvent(): void;

    _render(flag?: boolean): void;


    _eventTouch(coords: Array<{ x: number, y: number }>, isTap?: boolean): void;

    _eventMove(coords: Array<{ x: number, y: number }>): void;

    _eventUp(coords: Array<{ x: number, y: number }>): void;

    _eventRotate(angle: number, coords: Array<{ x: number, y: number }>): void;

    _eventPinch(zoom: number, coords: Array<{ x: number, y: number }>): void;


    on(event: string | string[], listener: Function, ignore?: boolean): void;

    off(event: string | string[], listener: Function): void;

    emit(event: string, ...args: any[]): Promise<void>;

    removeAlllistener(event: string): void;

    pauseEvent(event: string): void;

    resumeEvent(event: string): void;

    withEventPause(event: string, callback: Function): void;


    add(shape: Shape, zIndex?: number): Promise<Shape>;

    remove(shape: Shape | string, flag?: boolean): boolean;

    get(name: string): Shape | null;

    load(json: string | object, flag?: boolean): Shape | false;

    clear(): void;

    active(shape: Shape): void;


    enableMultiActive(): void;

    disableMultiActive(): void;

    getConfig(): object;

    setConfig(key: string, value: any): void;

    getContext(): CanvasRenderingContext2D;

    getElement(): HTMLElement;

    setElementStyle(style: object): void;

    setOffset(offset: { x: number, y: number }): void;

    resetOffset(): void;

    scale(zoom: number): void;

    getScale(): number;

    getQueue(): any[];

    clearQueue(): void;

    addQueueTask(task: Function): void;


    getModel(): any;

    renderModel(): void;

    addModel(shape: Shape): void;

    getModelShapes(flag?: boolean, index?: number | string): Shape[] | Shape | null;

    setModel(shape: Shape): void;

    clearModel(): void;


    clearView(): void;

    setView(shape: Shape): Promise<void>;

    getViewBound(): any;

    getView(): any;


    r(snapshot?: any): void;

    alter(snapshot: any, flag?: boolean): Promise<void>;

    undo(): void;

    redo(): void;

    snap(flag?: boolean): any;

    clearSnap(): void;

    snapTest(): void;


    toJson(): string;

    loadJson(json: string | object, param?: object): Promise<void>;

    loadJsonWithSnap(json: string | object, param?: object): Promise<void>;


    bound(): any;

    dpr(): number;

    shapes(flag?: boolean, index?: number | string): Shape[] | Shape | null;

    getActive(): Shape | null;

    getIndex(shape: Shape): number;

    canMultiActive(): boolean;

    getColorBound(screen: any, flag?: boolean): any;

    createCanvas(w: number, h: number, append?: boolean, styles?: object): any;

    reset(): void;

    hiddenOutline(): void;

    showOutline(): void;

    canShowOutline(): boolean;
}

interface Point {
    x: number;
    y: number;
}

interface Bound {
    x: number;
    y: number;
    w: number;
    h: number;
}

export declare function renameProperty(obj: any, oldProp: string, newProp: string): void;

export declare function moveElem<T>(arr: T[], element: T, index: number): T[] | false;

export declare function getPosOfEvent(ev: MouseEvent | TouchEvent): Point[];

export declare function getEnd(ev: MouseEvent | TouchEvent): Point[];

export declare function chooseFile(): Promise<File | false>;

export declare function loadImage(url: string, callback: (image: HTMLImageElement) => void, error?: () => void, cache?: boolean): void;

export declare function downloadBlob(blob: Blob, fileName: string): void;

export declare function delay(callback: () => void, time: number): void;

export declare function throttle(cb: Function, wait?: number): (...args: any[]) => void;

export declare function debounce(func: Function, wait: number, immediate: boolean): () => void;

export declare function cloneDeep<T>(obj: T, config?: Record<string, any>): T;

export declare function getVector(p1: Point, p2: Point): Point;

export declare function getVectorCenter(p1: Point, p2: Point): Point;

export declare function getLength(v1: Point): number;

export declare function getAngle(v1: Point, v2: Point): number;

export declare function radToDegree(radians: number): number;

export declare function rotateVector(vector: Point, angle: number, pivot: Point): Point;

export declare function reverseRotatePoint(vector: Point, angle: number, pivot: Point): Point;

export declare function getBoundingBox(rectangles: Bound[]): Bound;

export declare function getCoordsBox(coords: Point[]): Bound;

export declare function scaleVector(v1: Point, s: number): Point;

export declare function getCoordsByBound(bound: Bound): Point[];

export declare function isOutBound(bound: Bound, coords: Point[]): boolean;

export declare function loadImage(url: string, onload: (image: HTMLImageElement) => void, onerror?: () => void): void;


// @ts-ignore
export default {
    Text,
    Image,
    Group,
    Stage
}