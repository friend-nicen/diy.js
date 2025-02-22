
import {toFixed} from "./math";


export function getVector(p1, p2) {
    let x = toFixed(p1.x - p2.x, 5)
    let y = toFixed(p1.y - p2.y, 5);
    return {
        x,
        y
    };
}



export default function getVectorCenter(p1, p2) {
    const centerX = (p1.x + p2.x) / 2;
    const centerY = (p1.y + p2.y) / 2;
    return {x: centerX, y: centerY};
}



export function getLength(v1) {
    return Math.sqrt(v1.x * v1.x + v1.y * v1.y);
}



export function getAngle(v1, v2) {

    
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



export function radToDegree(radians) {
    return radians * 180 / Math.PI;
}



export function rotateVector(vector, angle, pivot) {

    
    const x1 = vector.x - pivot.x;
    const y1 = vector.y - pivot.y;

    
    const rad = angle * Math.PI / 180;

    
    const x2 = x1 * Math.cos(rad) - y1 * Math.sin(rad);
    const y2 = x1 * Math.sin(rad) + y1 * Math.cos(rad);

    
    return {x: toFixed(x2 + pivot.x, 3), y: toFixed(y2 + pivot.y, 3)};
}



export function reverseRotatePoint(vector, angle, pivot) {
    
    const x1 = vector.x - pivot.x;
    const y1 = vector.y - pivot.y;

    
    const rad = -angle * Math.PI / 180;

    
    const x2 = x1 * Math.cos(rad) - y1 * Math.sin(rad);
    const y2 = x1 * Math.sin(rad) + y1 * Math.cos(rad);

    
    return {x: toFixed(x2 + pivot.x, 3), y: toFixed(y2 + pivot.y, 3)};
}



export function getBoundingBox(rectangles) {

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



export function getCoordsBox(coords) {

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



export function scaleVector(v1, s) {
    return {
        x: v1.x * s,
        y: v1.y * s
    }
}



export function getCoordsByBound(bound) {
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



export function isOutBound(bound, coords) {

    
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