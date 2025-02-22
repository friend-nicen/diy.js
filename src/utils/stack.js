

export default class Stack {


    constructor(maxLength) {
        this.maxLength = maxLength;
        this.queue = [];
    }

    get length() {
        return this.queue.length;
    }

    push(item) {
        if (this.queue.length >= this.maxLength) {
            this.queue.shift();
        }
        this.queue.push(item);
    }

    pop() {
        return this.queue.pop();
    }

    clear() {
        this.queue = [];
    }
}
