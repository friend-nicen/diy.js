
export default {


    
    save() {
        return this.props();
    },

    
    restore(snap) {
        this.each(snap);
    },

}