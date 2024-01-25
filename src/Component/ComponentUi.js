import Config from "../Config";
import Component from "./Component";
import Model from "./Model";
import ComponentManager from "../ComponentManager";
import ExtensionManager from "../Extensions/ExtensionManager";

export default class ComponentUi {

    static createUi(logicTemplate) {
        return new ComponentUi(logicTemplate);
    }

    constructor(logicTemplate) {
        this.config = new Config();
        if (logicTemplate.hasOwnProperty('renderer')) {
            this.config.setComponentNames(Object.keys(logicTemplate.renderer));
        }
        this.config.setConfig(logicTemplate);
        this.componentManager = new ComponentManager();
        this.extensionManager = new ExtensionManager();
    }

    installComponent(component) {
        component.setModel(new Model());
        component.addPropertyChangeListener(this);
    }

    updateContent(component) {
        let fragment = component.fragment;
        if (fragment) {
            this.extensionManager.modelToFrontend(component, component.getModel(), fragment)
        }
    }

    buildSelfFragment(component) {
        let range = document.createRange();
        let renderer = this.config.getRenderer(component.getName());
        let fragment = range.createContextualFragment(renderer.template).children[0];

        let elements = fragment.querySelectorAll(`[data-space]`);

        if (fragment.dataset.hasOwnProperty('space')) {
            component.addSpace(fragment.dataset['space'], fragment);
        }

        for (let i = 0; i < elements.length; i++) {
            let element = elements[i];
            component.addSpace(element.dataset['space'], element);
        }

        component.fragment = fragment;
        this.extensionManager.detectApplicable(component, fragment, renderer.template);
    }

    afterCreatingAll(topAncestor) {
        this.extensionManager.executeAfterCreatingAll(topAncestor);
    }

    inserted(component) {

    }

    removed(component) {

    }

    removeChild(component, child, space) {
        let spaceElement = component.getSpaceByName(space);
        if (!spaceElement) {
            return;
        }
        spaceElement.removeChild(child.fragment);
    }

    insertChild(component, child, space, index) {
        let spaces = component.getSpaces();
        if (spaces.hasOwnProperty(space)) {
            let spaceElement = spaces[space];
            this.insertElement(spaceElement, child.fragment, index);
        }
    }

    insertElement(element, node, index) {
        element.insertBefore(node, element.childNodes[index]);
    }

    isAllowedAdding(component, child, space) {
        if (!component.getSpaces().hasOwnProperty(space)) {
            return false;
        }
        let renderer = component.getRenderer();
        if (!renderer) {
            return true;
        }
        if (
            renderer.hasOwnProperty('spaces') &&
            renderer.spaces.hasOwnProperty(space) &&
            renderer.spaces[space].hasOwnProperty('acceptable')
        ) {
            return renderer.spaces[space].acceptable.indexOf(child.getName()) !== -1;
        }
        return true;
    }

    buildComponent(data) {
        let comp = new Component(null, this);
        this.componentManager._add(comp);
        return comp;
    }

    firePropertyChange(propertyEvent) {

    }

}