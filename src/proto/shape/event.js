export default {


    _listener: null,


    on(event, listener) {

        if (typeof listener !== 'function') {
            throw new TypeError('listener must be a function');
        }

        const events = Array.isArray(event) ? event : [event];

        for (let i of events) {

            if (!this._listener.has(i)) {
                this._listener.set(i, []);
            }

            this._listener.get(i).push(listener);
        }
    },


    async emit(event, ...args) {
        if (this._listener.has(event)) {
            const listeners = this._listener.get(event);
            for (const listener of listeners) {
                try {
                    await listener.apply(null, args);
                } catch (error) {
                    console.error(error);
                }
            }
        }


    },


    off(event, listener) {

        const events = Array.isArray(event) ? event : [event];

        for (let i of events) {
            if (this._listener.has(i)) {
                const listeners = this._listener.get(i);
                const index = listeners.indexOf(listener);
                if (index !== -1) {
                    listeners.splice(index, 1);
                }
            }
        }

    },


    removeAlllistener(event) {
        this._listener.delete(event);
    }

}