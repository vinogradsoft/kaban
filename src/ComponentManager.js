import ContextSupport from "./Component/ContextSupport";
import Model from "./Component/Model";

export default class ComponentManager {

    constructor() {
        this.components = new Map();
        this.handler = new Handler();
    }

    getByUuid(uuid) {
        this.components.get(uuid);
    }

    _add(component) {
        component.addPropertyChangeListener(this.handler);
        this.components.set(component.uuid, component);
    }

}

class Handler {
    constructor(manager) {
        this.manager = manager;
    }

    firePropertyChange(propertyEvent) {
        if (propertyEvent.propertyName === ContextSupport.COMPONENT_DELETED) {
            propertyEvent.source.removePropertyChangeListener(this);
            this.manager.components.delete(propertyEvent.source.uuid);
        }
    }

}