var Stack = function(capacity) {
    // Maximum capacity of items that the stack can hold
    this._capacity = capacity || Infinity;
    this._storage = {};

    // Count variable to keep track of the size of the stack
    this._count = 0;
}

Stack.prototype.push = function(val) {
    if (this._count < this._capacity) {
        this._storage[this._count] = val;
        this._count += 1;
        return this._count;
    }
    return 'Max capacity already reached. Remove element before adding a new one.';
};

Stack.prototype.pop = function() {
    var value = this._storage[this._count - 1];
    this._count -= 1;
    delete this._storage[this._count];
    if (this._count < 0) {
        this._count = 0;
    }
    return value;
};

Stack.prototype.peek = function() {
    return this._storage[this._count - 1];
}

Stack.prototype.size = function(val) {
    return this._count;
};