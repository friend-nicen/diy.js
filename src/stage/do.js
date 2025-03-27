import Stack from "../utils/stack";

export default {

    z: new Stack(30),

    y: new Stack(30),

    n: 30,

    r(snapshot = null) {
        if (!this._stack) return;
        this.z.push(snapshot ? snapshot : this.snap());
        this.y.clear();
        this.snapTest();
    },

    async alter(snapshot, flag = false) {


        if (flag) {


            await this.setView(snapshot.view);
            this.getModel().shapes = snapshot.model;
            this._shapes = snapshot.custom;


            this.render();
            this.renderModel();


        } else {


            const shapes = [];

            for (let i of snapshot) {
                const shape = i.shape;
                shape.restore(i.snap);
                shapes.push(shape);
            }

            this._shapes = shapes;
            this.snapTest();
            this.render();
        }

    },

    undo() {

        if (this.z.length === 0) return;

        this.y.push(this.snap());

        const snapshot = this.z.pop();

        this.alter(snapshot);

        this.emit('undo', {type: 'undo'})

        this.emit('deactivate', {type: 'deactivate'})
    },

    redo() {

        if (this.y.length === 0) return;

        this.z.push(this.snap());

        const snapshot = this.y.pop();

        this.alter(snapshot);

        this.emit('redo', {type: 'redo'})

        this.emit('deactivate', {type: 'deactivate'})
    },

    snap(flag = false) {


        if (flag) {


            const snapshot = {
                model: [],
                custom: [],
                view: null
            };


            snapshot.view = this._view.shape;
            snapshot.model = this.getModel().shapes;
            snapshot.custom = this.shapes();

            return snapshot;

        } else {


            const snapshot = [];


            for (let i of this.shapes()) {
                snapshot.push({
                    shape: i,
                    snap: i.save()
                });
            }

            return snapshot;

        }


    },

    clearSnap() {
        this.z.clear();
        this.y.clear();
        this.snapTest();
    },

    snapTest() {

        this.emit('snap-change', {
            type: 'snap-change',
            z: this.z.length,
            y: this.y.length
        })
    }
}