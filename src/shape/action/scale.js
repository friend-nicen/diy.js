

import Action from "./action";
import {getLength, getVector} from "../../utils/vector";

export default class Scale extends Action {

    startScale; 
    rectCenterPoint; 

    
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