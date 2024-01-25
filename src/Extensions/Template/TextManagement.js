import ExtensionManager from "../ExtensionManager";

export default class TextManagement {

    getName() {
        return 'TextManagement';
    }

    detect(component, fragment, rawTemplate) {

    }

    install(component, fragment, rawTemplate) {

    }

    unregister() {

    }

    executeAfterCreatingAll(topAncestor) {

    }

    getType() {
        return ExtensionManager.TEMPLATE_TYPE_EXT;
    }

}