class Shape {
    constructor(config: object);

    // Base properties
    x: number | null;
    y: number | null;
    name: string | null;
    type: string;
    zIndex: number;
    fixed: boolean | null;

    // State properties
    actived: boolean;
    clicked: boolean;
    queue: boolean;
    _acting: boolean;

    // Rendering properties
    rotateRadius: number;
    rotateAroundCenter: boolean;
    blendMode: string;
    stroke: boolean;
    fill: boolean;
    strokeStyle: string;
    fillStyle: string;
    fillRule: string;
    outline: boolean;

    // Capability flags
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

    // Internal properties
    _stage: any;
    _context: any;
    _preview: any | null;
    _startAgree: any | null;
    _startBound: any | null;
    _action: any | null;
    _colorBound: any | null;
    _group: any | null;
    _listener: Map<string, Function[]>;
    _previous: {
        x: number | null;
        y: number | null;
        zoom: number | null;
        rotate: number | null;
    };

    // UI properties
    button_2_Text: string;
    reference: string;

    // Core methods
    init(): Promise<void>;
    set(config: object): void;
    render(): void;
    save(): object;
    restore(snap: object): void;

    // Event methods
    emit(event: string, data: any): Promise<void>;
    on(event: string | string[], listener: Function): void;
    off(event: string | string[], listener: Function): void;
    removeAlllistener(event: string): void;

    // Action methods
    move(coords: Array<{x: number, y: number}>, offset: {x: number, y: number}): boolean;
    scale(zoom: number, coords: Array<{x: number, y: number}>): void;
    tap(coords: Array<{x: number, y: number}>): boolean;
    rotate(rad: number, coords: Array<{x: number, y: number}>): boolean;
    up(coords: Array<{x: number, y: number}>): void;
    export(param?: object): Promise<Blob|string>;

    // State methods
    _active(status: boolean, flag?: boolean): void;
    getRotateCoords(): Array<{x: number, y: number}>;
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

class Text extends Shape {
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

class Image extends Shape {

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

class Group extends Shape {

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

class Stage {
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
    config: {
        maxWidth: number;
        maxHeight: number;
        sensitivity: number;
        minRotatable: number;
        themeColor: string;
        activeColor: string;
        showOutline: boolean;
    };
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

export default {
    Text,
    Image,
    Group,
    Stage
};
