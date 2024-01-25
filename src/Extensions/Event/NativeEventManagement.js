import ExtensionManager from "../ExtensionManager";

export default class NativeEventManagement {

    getName() {
        return 'NativeEventManagement';
    }

    detect(component, fragment, rawTemplate) {

    }

    install(component, fragment, rawTemplate) {

    }

    unregister() {

    }

    getType() {
        return ExtensionManager.EVENT_TYPE_EXT;
    }

    executeAfterCreatingAll(topAncestor) {

    }

}