export default {

    _draw: null,
    _rotate: null,
    _init: null,
    draw: null,

    render() {
        if (this._stage) {

            this._stage.render();
        }
    }
}