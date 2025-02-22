

import Action from "./action";

export default class Clear extends Action {

    
    tap() {
        
        this.shape.destroy(true);
    }

}