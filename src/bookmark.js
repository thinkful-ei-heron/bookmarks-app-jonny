const store = {bookmarks: [], adding: false, error: null, filter: 0};

const findById = function (id) {
    return this.store.bookmarks.find(currentItem => currentItem.id === id);
};


const addItem = function (bookmark) {
    Object.assign(bookmark, {expanded: false})
    this.store.bookmarks.push(bookmark);
};

const findAndDelete = function (id) {
    this.store.bookmarks = this.store.bookmarks.filter(currentItem => currentItem.id !== id);
};

const findAndUpdate = function (id, newData) {
    const currentItem = this.findById(id);
    Object.assign(currentItem, newData);
};
const toggleAdding = function () {
    this.store.adding = !this.store.adding;
};

const setError = function (error) {
    this.store.error = error;
};

export default {
    store,
    findById,
    addItem,
    findAndDelete,
    findAndUpdate,
    toggleAdding,
    setError
};