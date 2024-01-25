import DragManagement from "./DnD/DragManagement";
import TextNodeManagement from "./Template/TextNodeManagement";

export default class ExtensionManager {

    static EVENT_TYPE_EXT = 'event';
    static TEMPLATE_TYPE_EXT = 'template';

    constructor() {
        this.templateExtensions = [];
        this.eventExtensions = [];
        let dragManagement = new DragManagement();
        this.eventExtensions[dragManagement.getName()] = dragManagement;
        let textNodeManagement = new TextNodeManagement();
        this.templateExtensions[textNodeManagement.getName()] = textNodeManagement;
    }

    detectApplicable(component, fragment, rawTemplate) {
        for (let idx in this.eventExtensions) {
            let ext = this.eventExtensions[idx];
            ext.detectAndInstall(component, fragment, rawTemplate);
        }
        for (let idx in this.templateExtensions) {
            let ext = this.templateExtensions[idx];
            ext.detectAndInstall(component, fragment, rawTemplate);
        }
    }

    executeAfterCreatingAll(topAncestor) {
        for (let idx in this.eventExtensions) {
            let ext = this.eventExtensions[idx];
            ext.executeAfterCreatingAll(topAncestor);
        }
        for (let idx in this.templateExtensions) {
            let ext = this.templateExtensions[idx];
            ext.executeAfterCreatingAll(topAncestor);
        }
    }

    modelToFrontend(component, model, fragment) {
        for (let idx in this.templateExtensions) {
            let ext = this.templateExtensions[idx];
            ext.updateContent(component, model, fragment);
        }
    }

    hasExtension(ext) {
        if (ext.getType() === ExtensionManager.EVENT_TYPE_EXT) {
            return this.eventExtensions.hasOwnProperty(ext.getName());
        } else if (ext.getType() === ExtensionManager.TEMPLATE_TYPE_EXT) {
            return this.templateExtensions.hasOwnProperty(ext.getName());
        }
    }

    addExtension(ext) {
        if (ext.getType() === ExtensionManager.EVENT_TYPE_EXT) {
            if (this.eventExtensions.hasOwnProperty(ext.getName())) {
                throw Error('The extension is already installed.');
            }
            this.eventExtensions[ext.getName()] = ext;
        } else if (ext.getType() === ExtensionManager.TEMPLATE_TYPE_EXT) {
            if (this.templateExtensions.hasOwnProperty(ext.getName())) {
                throw Error('The extension is already installed.');
            }
            this.templateExtensions[ext.getName()] = ext;
        }
    }

    setEventExtension(ext) {
        if (ext.getType() !== ExtensionManager.EVENT_TYPE_EXT) {
            throw Error('Invalid extension type.');
        }
        if (this.eventExtensions.hasOwnProperty(ext.getName())) {
            let old = this.eventExtensions[ext.getName()];
            old.unregister()
        }
        this.eventExtensions[ext.getName()] = ext;
    }

    setTemplateExtension(ext) {
        if (ext.getType() !== ExtensionManager.TEMPLATE_TYPE_EXT) {
            throw Error('Invalid extension type.');
        }
        if (this.templateExtensions.hasOwnProperty(ext.getName())) {
            let old = this.templateExtensions[ext.getName()];
            old.unregister()
        }
        this.templateExtensions[ext.getName()] = ext;
    }

    removeEventExtension(name) {
        if (!this.eventExtensions.hasOwnProperty(name)) {
            return;
        }
        let ext = this.eventExtensions[name];
        ext.unregister();

        delete this.eventExtensions[name];

    }

    removeTemplateExtension(name) {
        if (!this.templateExtensions.hasOwnProperty(name)) {
            return;
        }
        let ext = this.templateExtensions[name];
        ext.unregister();
        delete this.templateExtensions[name];
    }

}
