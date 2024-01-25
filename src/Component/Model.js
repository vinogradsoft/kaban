import ModelEvent from "../Event/ModelEvent";

export default class Model {

    static SET_PART = 'SET_PART';
    static SET_CONTENT = 'SET_CONTENT';
    static SET_PROPERTY = 'SET_PROPERTY';

    constructor() {
        this.content = {};
        this.stateChangeListeners = new Map();
    }

    addStateChangedListener(l) {
        this.stateChangeListeners.set(l, l);
    }

    removeStateChangedListener(l) {
        this.stateChangeListeners.delete(l);
    }

    fireStateChanged(data, type) {
        let e = new ModelEvent(this, data, type);
        for (let listener of this.stateChangeListeners.values()) {
            listener.stateChanged(e);
        }
    }

    setPart(data) {
        let old = this.content;
        this.content = Object.assign({}, this.content, data);
        this.fireStateChanged({
            changedPart: data,
            oldContent: old,
            newContent: Object.assign({}, this.content)
        }, Model.SET_PART);
    }

    setContent(content) {
        let old = this.content;
        this.content = content;
        this.fireStateChanged({oldContent: old, newContent: Object.assign({}, this.content)}, Model.SET_CONTENT);
    }

    getContent() {
        return Object.assign({}, this.content);
    }

    set(key, value) {
        let oldValue = null;
        if (this.content.hasOwnProperty(key)) {
            oldValue = this.content[key];
        }
        this.content[key] = value;
        this.fireStateChanged({
            content: Object.assign({}, this.content),
            key: key,
            oldValue: oldValue,
            newValue: value
        }, Model.SET_PROPERTY);
    }

    get(key) {
        if (this.content.hasOwnProperty(key)) {
            return this.content[key];
        }
        return null;
    }

}