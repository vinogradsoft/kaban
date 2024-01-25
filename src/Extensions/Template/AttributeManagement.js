import ExtensionManager from "../ExtensionManager";

export default class AttributeManagement {

    getName() {
        return 'AttributeManagement';
    }

    detect(component, fragment, rawTemplate) {

    }

    install(component, fragment, rawTemplate) {

    }

    unregister() {

    }

    getType() {
        return ExtensionManager.TEMPLATE_TYPE_EXT;
    }

    executeAfterCreatingAll(topAncestor) {

    }

}