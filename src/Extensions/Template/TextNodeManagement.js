import ExtensionManager from "../ExtensionManager";

export default class TextNodeManagement {

    getName() {
        return 'TextNodeManagement';
    }

    detectAndInstall(component, fragment, rawTemplate) {
        let elements = fragment.querySelectorAll(`[data-model]`);
        if (fragment.dataset.hasOwnProperty('model')) {
            let elementName = fragment.dataset['model'];
            if (typeof component.modelElements === "undefined") {
                component.modelElements = new Map();
            }
            let container = component.modelElements.get(elementName);
            if (typeof container === "undefined") {
                container = [];
            }
            container.push(fragment);
            component.modelElements.set(elementName, container)
        }
        if (elements.length > 0 && typeof component.modelElements === "undefined") {
            component.modelElements = new Map();
        }
        for (let i = 0; i < elements.length; i++) {
            let element = elements[i];
            let elementName = element.dataset['model'];
            let container = component.modelElements.get(elementName);
            if (typeof container === "undefined") {
                container = [];
            }
            container.push(element);
            component.modelElements.set(elementName, container)
        }
    }

    unregister() {

    }

    executeAfterCreatingAll(topAncestor) {

    }

    getType() {
        return ExtensionManager.TEMPLATE_TYPE_EXT;
    }

    updateContent(component, model, fragment) {
        let elements = fragment.querySelectorAll('[data-model]');
        if (fragment.dataset.hasOwnProperty('model')) {
            let key = fragment.dataset.model;
            let data = model.get(key);
            if (data) {
                fragment.textContent = data;
            }
        }
        for (let i = 0; i < elements.length; i++) {
            let element = elements[i];
            let key = element.dataset.model;
            let data = model.get(key);
            if (data) {
                element.textContent = data;
            }
        }
    }

}