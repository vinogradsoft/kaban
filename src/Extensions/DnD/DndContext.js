export default class DndContext {

    constructor(component, space, manager, dropzoneSettings, dropzoneAcceptable, dropzone,
                direction, threshold, getIndex, dropCondition, addSelectorsActive,
                removeSelectorsActive, drop) {
        this.addSelectorsActive = addSelectorsActive;
        this.removeSelectorsActive = removeSelectorsActive;
        this.component = component;
        this.space = space;
        this.manager = manager;
        this.dropzoneSettings = dropzoneSettings;
        this.dropzoneAcceptable = dropzoneAcceptable;
        this.dropzoneElement = dropzone;
        this.direction = direction;
        this.threshold = threshold;
        this.getIndex = getIndex;
        this.dropCondition = dropCondition;
        this.drop = drop;
    }

    isAvailable() {
        return this.dropzoneAcceptable.indexOf(this.manager.currentDragged.getName()) !== -1;
    }

}