import ComponentUi from "./ComponentUi";
import ContextSupport from "./ContextSupport";
import PropertyEvent from "../Event/PropertyEvent";
import Model from "./Model";
import {v4 as uuidV4} from 'uuid';

export default class Component {

    constructor(logicTemplate, ui) {
        this.name = null;
        this.parent = null;
        this.model = null;
        this.fragment = null;
        this.uuid = uuidV4();
        this.children = [];
        this.spaces = [];
        if (ui) {
            if (logicTemplate) {
                console.error('Config has already been applied and a new one is not expected.');
            }
            if (!ui) {
                throw new Error('The ui cannot be empty in this context.');
            }
            this.ui = ui;
        } else {
            if (!logicTemplate) {
                throw new Error('Config is require.');
            }
            this.ui = ComponentUi.createUi(logicTemplate);
        }
        this.handler = new Handler(this);
        this.ui.installComponent(this);
    }

    getRenderer() {
        let renderer = this.ui.config.getRenderer(this.getName());
        if (!renderer) {
            return null;
        }
        return renderer;
    }

    getDropzone(name) {
        let renderer = this.getRenderer();
        if (!renderer) {
            return null;
        }
        if (!renderer.hasOwnProperty('dropzone')) {
            return null;
        }
        if (!renderer.dropzone.hasOwnProperty(name)) {
            return null
        }
        return renderer.dropzone[name];
    }

    getDraggable() {
        let renderer = this.getRenderer();
        if (!renderer) {
            return null;
        }
        if (!renderer.hasOwnProperty('draggable')) {
            return null;
        }
        return renderer.draggable;
    }

    setParent(parent) {
        if (parent === this.parent) {
            return;
        }
        let old = this.parent;
        if (this.parent) {
            this.parent.removeChildren(this)
        }
        this.parent = parent;
        ContextSupport.getSupport(this).executeEvent(
            new PropertyEvent(this, ContextSupport.SET_PARENT_PROPERTY, old, parent)
        );
    }

    removeChildren(child) {
        for (let key in this.children) {
            let childsInSpace = this.children[key];
            let idx = childsInSpace.indexOf(child);
            if (idx !== -1) {
                childsInSpace.splice(idx, 1);
                this.children[key] = childsInSpace;
                ContextSupport.getSupport(this).executeEvent(
                    new PropertyEvent(
                        this,
                        ContextSupport.REMOVE_CHILDREN_PROPERTY,
                        {
                            space: key,
                            child: child
                        },
                        null
                    )
                );
            }
        }
    }

    containsPoint(x, y) {
        let rect = this.fragment.getBoundingClientRect();
        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    }

    addChildren(child, space) {
        if (this.children.hasOwnProperty(space)) {
            this.insertChild(child, space, this.children[space].length);
        } else {
            this.insertChild(child, space, 0);
        }
    }

    insertChild(child, space, index) {
        if (index < 0 || index === null || typeof index === "undefined") {
            throw new Error('The index cannot be less than zero, null, or undefined.');
        }
        if (this.ui.isAllowedAdding(this, child, space)) {
            child.setParent(this);

            for (let spaceName in this.children) {
                let idx = this.children[spaceName].indexOf(child);
                if (idx !== -1 && space !== spaceName) {
                    let container = this.children[spaceName];
                    container.splice(idx, 1);
                    this.children[spaceName] = container;
                }
            }

            let container = this.children.hasOwnProperty(space) ? this.children[space] : [];
            let idx = container.indexOf(child);

            if (idx !== -1) {
                container.splice(idx, 1);
            }

            container.splice(index, 0, child);
            this.children[space] = container;

            let newIndex = container.indexOf(child);
            if (idx !== -1) {
                ContextSupport.getSupport(this).executeEvent(new PropertyEvent(
                    this, ContextSupport.CHILD_INDEX_CHANGED, {oldIndex: idx}, {
                        space: space, index: newIndex, child: child
                    }));
            } else {
                ContextSupport.getSupport(this).executeEvent(new PropertyEvent(
                    this, ContextSupport.CHILD_INSERTED, null, {
                        space: space, index: newIndex, child: child
                    }));
            }
        }
    }

    getSpaceByChild(child) {
        for (let spaceName in this.children) {
            if (this.children[spaceName].indexOf(child) !== -1) {
                return spaceName;
            }
        }
        return null;
    }

    getChildIndex(child, space) {
        if (this.children.hasOwnProperty(space)) {
            return this.children[space].indexOf(child);
        }
        return -1;
    }

    getChildsBySpace(spaceName) {
        if (this.children.hasOwnProperty(spaceName)) {
            let container = this.children[spaceName];
            if (container.length > 0) {
                return container
            }
        }
        return null;
    }

    getChildByIndex(spaceName, index) {
        let childs = this.getChildsBySpace(spaceName);
        if (childs === null) {
            return null;
        }
        return childs[index];
    }

    addSpace(name, space) {
        this.spaces[name] = space;
        ContextSupport.getSupport(this).executeEvent(new PropertyEvent(
            this, ContextSupport.ADD_SPACE_PROPERTY, null, {
                space: space,
                name: name
            }));
    }

    getSpaceByName(name) {
        if (this.spaces.hasOwnProperty(name)) {
            return this.spaces[name];
        }
        return null;
    }

    getParent() {
        return this.parent;
    }

    setContent(rawData) {
        this.model.setContent(rawData);
    }

    remove() {
        ContextSupport.getSupport(this).executeEvent(new PropertyEvent(
            this, ContextSupport.COMPONENT_DELETED, null, null));
    }

    getSpaces() {
        return this.spaces;
    }

    getModel() {
        return this.model;
    }

    setModel(model) {
        let old = this.model;
        this.model = model;
        ContextSupport.getSupport(this).executeEvent(new PropertyEvent(
            this, ContextSupport.MODEL_CHANGED, old, model
        ));
    }

    getName() {
        return this.name;
    }

    setName(name) {
        let old = this.name;
        this.name = name;
        ContextSupport.getSupport(this).executeEvent(
            new PropertyEvent(this, ContextSupport.NAME_PROPERTY, old, this.name)
        );
    }

    addPropertyChangeListener(listener, propName) {
        ContextSupport.getSupport(this).addPropertyChangeListener(listener, propName);
    }

    removePropertyChangeListener(listener) {
        ContextSupport.getSupport(this).removePropertyChangeListener(listener);
    }

    buildOf(data) {
        let keys = Object.keys(data);
        if (keys.length === 1) {
            let key = keys[0];
            if (!this.ui.config.containsName(key)) {
                throw new Error('Config is require.');
            }
            this.setName(key);
            let cData = data[key];

            if (cData.hasOwnProperty('items')) {
                let items = cData.items;
                delete cData.items;
                this.setContent(cData);

                for (let space in items) {
                    let spaces = items[space];

                    for (let componentName in spaces) {
                        let subItems = spaces[componentName];
                        for (let i in subItems) {
                            let obj = {};
                            obj[componentName] = subItems[i];
                            let child = this.ui.buildComponent(obj);
                            child.buildOf(obj);
                            this.addChildren(child, space);
                        }
                    }
                }
            } else {
                this.setContent(cData);
            }
            setTimeout(function () {
                if (!this.getParent()) {
                    ContextSupport.getSupport(this).executeEvent(new PropertyEvent(
                        this, ContextSupport.COMPONENTS_CREATED, null, this));
                }
            }.bind(this), 0)
        }
    }

    toSimpleObject() {
        let data = {};

        return data;
    }

}

class Handler {

    constructor(component) {
        this.component = component;
        this.component.addPropertyChangeListener(this);
    }

    firePropertyChange(propertyEvent) {
        let name = propertyEvent.propertyName;
        if (name === ContextSupport.MODEL_CHANGED) {
            let oldModel = propertyEvent.oldValue;
            if (typeof oldModel !== "undefined" && oldModel !== null) {
                oldModel.removeStateChangedListener(this);
            }
            let newModel = propertyEvent.newValue;
            newModel.addStateChangedListener(this);
        } else if (name === ContextSupport.NAME_PROPERTY) {
            propertyEvent.source.ui.buildSelfFragment(propertyEvent.source);
        } else if (ContextSupport.CHILD_INSERTED === propertyEvent.propertyName) {
            let space = propertyEvent.newValue.space;
            let source = propertyEvent.source;
            let childs = source.getChildsBySpace(space);
            for (let i = childs.length - 1; i >= 0; i--) {
                let c = childs[i];
                source.ui.insertChild(source, c, space, 0);
            }
        } else if (ContextSupport.CHILD_INDEX_CHANGED === propertyEvent.propertyName) {
            let space = propertyEvent.newValue.space;
            let source = propertyEvent.source;
            let childs = source.getChildsBySpace(space);

            for (let i = childs.length - 1; i >= 0; i--) {
                let c = childs[i];
                source.ui.insertChild(source, c, space, 0);
            }
        } else if (ContextSupport.SET_PARENT_PROPERTY === propertyEvent.propertyName) {
            let newParent = propertyEvent.newValue;
            let oldParent = propertyEvent.oldValue;
            let source = propertyEvent.source;


        } else if (ContextSupport.REMOVE_CHILDREN_PROPERTY === propertyEvent.propertyName) {
            let source = propertyEvent.source;
            let data = propertyEvent.oldValue;
            let child = data.child;
            let space = data.space;

            source.ui.removeChild(source, child, space);
        } else if (ContextSupport.COMPONENTS_CREATED === propertyEvent.propertyName) {
            propertyEvent.source.ui.afterCreatingAll(propertyEvent.source);
        }
    }

    stateChanged(event) {
        if (event.type === Model.SET_CONTENT) {
            this.component.ui.updateContent(this.component);
        } else if (event.type === Model.SET_PROPERTY) {
            this.component.ui.updateContent(this.component);
        }
    }

}