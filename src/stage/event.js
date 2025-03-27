export default {


    _listener: new Map(),
    _pauseEvent: [],


    pauseEvent(event) {

        if (this._pauseEvent.indexOf(event) === -1) {
            this._pauseEvent.push(event);
        }
    },


    withEventPause(event, callback) {
        this.pauseEvent(event);
        callback();
        this.resumeEvent(event);
    },


    resumeEvent(event) {

        const index = this._pauseEvent.indexOf(event)

        if (index > -1) {
            this._pauseEvent.splice(index, 1);
        }
    },


    on(event, listener, ignore = false) {

        if (typeof listener !== 'function') {
            throw new TypeError('listener must be a function');
        }

        const events = Array.isArray(event) ? event : [event];

        for (let i of events) {

            if (!this._listener.has(i)) {
                this._listener.set(i, []);
            }


            if (this._listener.get(i).length === 0 || !ignore) {
                this._listener.get(i).push(listener);
            }
        }
    },


    async emit(event, ...args) {


        if (this._pauseEvent.indexOf(event) > -1) {
            return;
        }

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