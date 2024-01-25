export default class PropertySupport {

    constructor() {
        this.listeners = new Map();
    }

    addPropertyChangeListener(listener, propName = 'all') {
        let container = this.listeners.get(propName);

        if (typeof container === "undefined") {
            container = [];
            container.push(listener);
            this.listeners.set(propName, container);
            return;
        }
        container.push(listener);
    }

    removePropertyChangeListener(listener) {
        this.listeners.forEach(function (value, key, map) {
            let idx = value.indexOf(listener);
            if (idx !== -1) {
                value.splice(idx, 1);
            }
        });
    }

    executeEvent(event) {
        let listener = this.listeners.get(event.propertyName);
        let listenerSubscribeAll = this.listeners.get('all');

        if (typeof listenerSubscribeAll !== "undefined") {
            for (let index = 0; index < listenerSubscribeAll.length; ++index) {
                listenerSubscribeAll[index].firePropertyChange(event);
            }
        }
        if (typeof listener !== "undefined") {
            for (let index = 0; index < listener.length; ++index) {
                listener[index].firePropertyChange(event);
            }
        }
    }

}