export default class PropertyEvent {

    constructor(source, propName, oldValue, newValue) {
        this.source = source;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.propertyName = propName;
    }

}