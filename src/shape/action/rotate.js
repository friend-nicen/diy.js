import Action from "./action";
import {getAngle, getVector} from "../../utils/vector";

export default class Rotate extends Action {

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