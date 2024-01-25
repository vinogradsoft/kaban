import ExtensionManager from "../ExtensionManager";
import SpaceOrientation from "../../Util/SpaceOrientation";
import DndContext from "./DndContext";
import Component from "../../Component/Component";

export default class DragManagement {

    constructor() {
        this.contexts = new Map();
    }

    getName() {
        return 'DragManagement';
    }

    detectAndInstall(component, fragment, rawTemplate) {
        let dropzones = fragment.querySelectorAll(`[data-dropzone]`);

        let draggable = fragment.dataset.hasOwnProperty('draggable') ? fragment.dataset['draggable'] : null;

        if (draggable) {
            let handle = fragment.querySelector('[drag-handle]');
            fragment.setAttribute("draggable", true);

            let draggableSettings = component.getDraggable();

            let addActiveDraggableSelectors = null;
            let removeActiveDraggableSelectors = null;

            if (draggableSettings && draggableSettings.hasOwnProperty('selectors') && draggableSettings.selectors.hasOwnProperty('active')) {
                addActiveDraggableSelectors = this.userAddActiveDraggableSelectors;
                removeActiveDraggableSelectors = this.userRemoveActiveDraggableSelectors;
            } else {
                addActiveDraggableSelectors = this.emptyAddActiveDraggableSelectors;
                removeActiveDraggableSelectors = this.emptyRemoveActiveDraggableSelectors;
            }

            let addDemoDraggableSelectors = null;

            if (draggableSettings && draggableSettings.hasOwnProperty('selectors') && draggableSettings.selectors.hasOwnProperty('demo')) {
                addDemoDraggableSelectors = this.userAddDemoDraggableSelectors;
            } else {
                addDemoDraggableSelectors = this.defaultAddDemoDraggableSelectors;
            }

            let dragEnd = null;

            if (draggableSettings && draggableSettings.hasOwnProperty('dragend')) {
                dragEnd = this.userDragEnd;
            } else {
                dragEnd = this.emptyDragend;
            }

            let draggableCondition = null;

            if (draggableSettings && draggableSettings.hasOwnProperty('dragCondition')) {
                draggableCondition = draggableSettings.dragCondition;
            } else {
                draggableCondition = this.defaultDraggableCondition;
            }

            let convertFormat = null;
            if (draggableSettings && draggableSettings.hasOwnProperty('convertFormat')) {
                convertFormat = draggableSettings.convertFormat;
            } else {
                convertFormat = this.defaultConvertFormat;
            }

            let dragImage = null;
            if (draggableSettings && draggableSettings.hasOwnProperty('dragImage')) {
                dragImage = draggableSettings.dragImage;
            } else {
                dragImage = this.defaultSetDragImage;
            }
            let createDemoFragment = null;
            if (draggableSettings && draggableSettings.hasOwnProperty('createDemoFragment')) {
                createDemoFragment = draggableSettings.createDemoFragment;
            } else {
                createDemoFragment = this.createDemoFragment;
            }

            fragment.addEventListener('dragstart', {
                handleEvent: this.dragstart,
                component: component,
                addActiveDraggableSelectors: addActiveDraggableSelectors,
                addDemoDraggableSelectors: addDemoDraggableSelectors,
                draggableCondition: draggableCondition,
                convertFormat: convertFormat,
                dragImage: dragImage,
                createDemoFragment: createDemoFragment,
                manager: this
            });

            fragment.addEventListener('dragend', {
                handleEvent: this.dragend,
                component: component,
                userDragEnd: dragEnd,
                removeActiveDraggableSelectors: removeActiveDraggableSelectors,
                manager: this
            });

            if (handle) {
                handle.addEventListener('mousedown', {
                    handleEvent: this.mousedown,
                    component: component,
                    manager: this
                });
                handle.addEventListener('mouseup', {
                    handleEvent: this.mouseup,
                    component: component,
                    manager: this
                });
                component.draghandleElement = handle;
            }

            component.draggableFormat = draggable;
            component.draggableElement = fragment;
        }

        for (let key = 0; key < dropzones.length; key++) {
            let dropzone = dropzones[key];
            let space = dropzone.dataset.hasOwnProperty('space') ? dropzone.dataset['space'] : null;

            if (space) {
                let dropzoneName = dropzone.dataset['dropzone'];
                let dropzoneSettings = component.getDropzone(dropzoneName);
                let dropzoneAcceptable = null;
                if (dropzoneSettings === null) {
                    continue;
                }
                if (!dropzoneSettings.hasOwnProperty('acceptable')) {
                    continue;
                }

                if (!Array.isArray(dropzoneSettings.acceptable) || dropzoneSettings.acceptable.length < 1) {
                    throw new Error('An unexpected value is acceptable. An array of component names is expected.');
                }

                dropzoneAcceptable = dropzoneSettings.acceptable;

                let direction = null;
                let getIndex = null;
                if (dropzoneSettings.hasOwnProperty('direction')) {
                    if (dropzoneSettings.direction === 'vertical') {
                        direction = this.verticalDirection.bind(this);
                        getIndex = this.getIndexWithVerticalDirection.bind(this);
                    } else if (dropzoneSettings.direction === 'horizontal') {
                        direction = this.horizontalDirection.bind(this);
                        getIndex = this.getIndexWithHorizontalDirection.bind(this);
                    } else {
                        throw new Error('Incorrect direction setting. "vertical" or "horizontal" is expected.');
                    }
                } else {
                    direction = this.verticalDirection.bind(this);
                    getIndex = this.getIndexWithVerticalDirection.bind(this);
                }
                let threshold = null;
                if (dropzoneSettings.hasOwnProperty('threshold')) {
                    let customThreshold = Math.abs(dropzoneSettings.threshold);
                    if (customThreshold > 1) {
                        customThreshold = 1;
                    }
                    threshold = customThreshold;
                } else {
                    threshold = 0.5;
                }

                let dropCondition = null;
                if (dropzoneSettings.hasOwnProperty('dropCondition')) {
                    if (typeof dropzoneSettings.dropCondition !== "function") {
                        throw new Error('Unexpected dropCondition value. A function is expected.');
                    }
                    dropCondition = dropzoneSettings.dropCondition.bind(dropzoneSettings);
                } else {
                    dropCondition = this.defaultDropCondition.bind(this);
                }
                let addSelectorsActive = null;
                let removeSelectorsActive = null;

                if (
                    dropzoneSettings.hasOwnProperty('selectors') &&
                    dropzoneSettings.selectors.hasOwnProperty('active')
                ) {
                    addSelectorsActive = this.addNotEmptySelectorsActive;
                    removeSelectorsActive = this.removeNotEmptySelectorsActive;
                } else {
                    addSelectorsActive = this.addEmptySelectorsActive;
                    removeSelectorsActive = this.removeEmptySelectorsActive;
                }
                let drop = null;
                if (dropzoneSettings.hasOwnProperty('drop')) {
                    drop = dropzoneSettings.drop;
                } else {
                    drop = this.defaultDrop;
                }

                this.contexts.set(dropzone, new DndContext(component, space, this, dropzoneSettings,
                    dropzoneAcceptable, dropzone, direction, threshold, getIndex, dropCondition, addSelectorsActive,
                    removeSelectorsActive, drop));
            }
        }
    }

    executeAfterCreatingAll(topAncestor) {
        let fragment = topAncestor.fragment;
        fragment.addEventListener('dragover', {
            handleEvent: this.dragover,
            contexts: this.contexts,
            manager: this
        });

        fragment.addEventListener('drop', {
            handleEvent: this.drop,
            contexts: this.contexts,
            manager: this
        });

        fragment.addEventListener('dragleave', {
            handleEvent: this.dragleave,
            contexts: this.contexts,
            element: fragment,
            manager: this
        });

        fragment.addEventListener('dragenter', {
            handleEvent: this.dragenter,
            contexts: this.contexts,
            manager: this
        });
    }

    unregister() {

    }

    getType() {
        return ExtensionManager.EVENT_TYPE_EXT;
    }

    addNotEmptySelectorsActive(context) {
        context.dropzoneElement.classList.add(context.dropzoneSettings.selectors.active)
    }

    removeNotEmptySelectorsActive(context) {
        context.dropzoneElement.classList.remove(context.dropzoneSettings.selectors.active)
    }

    addEmptySelectorsActive(context) {

    }

    removeEmptySelectorsActive(context) {

    }

    defaultDropCondition(draggableComponent, oldDropzoneComponent, oldIndex, oldSpaceName,
                         newDropzoneComponent, index, spaceName) {
        return true;
    }

    defaultDrop(draggableComponent, oldDropzoneComponent, oldIndex,
                oldSpaceName, newDropzoneComponent, newIndex, newSpaceName) {
        newDropzoneComponent.insertChild(draggableComponent, newSpaceName, newIndex);
    }

    getIndexWithVerticalDirection(idx, e, rect, threshold, demoIndex) {
        let max = (rect.height / 2) * threshold;
        let result = SpaceOrientation.beginningOrEnd(e.clientY, rect.top, rect.height);

        if (result.distance < max) {
            return null;
        }

        if (demoIndex === -1 && result.distance < max) {
            return idx;
        }

        if (demoIndex < idx) {
            idx++;
        }
        return idx;
    }

    getIndexWithHorizontalDirection(idx, e, rect, threshold, demoIndex) {
        let max = (rect.width / 2) * threshold;
        let result = SpaceOrientation.beginningOrEnd(e.clientX, rect.left, rect.width);

        if (result.distance < max) {
            return null;
        }

        if (result.distance < max && demoIndex === -1) {
            return idx;
        }

        if (demoIndex < idx) {
            idx++;
        }
        return idx;
    }

    horizontalDirection(idx, segment, demoIndex, max) {
        if (idx === max && demoIndex === -1) {
            idx++;
            return idx;
        }
        if (demoIndex === idx || demoIndex === -1) {
            return idx;
        }

        if (segment.side === SpaceOrientation.RIGHT && demoIndex < idx) {
            return idx;
        }

        if (segment.side === SpaceOrientation.LEFT && idx > 0) {
            idx--;
        } else if (segment.side === SpaceOrientation.RIGHT) {
            idx++;
        } else if (segment.side === SpaceOrientation.TOP && idx > 0 && demoIndex < idx) {
            idx++;
        } else if (segment.side === SpaceOrientation.BOTTOM && idx > 0 && demoIndex < idx) {
            idx++;
        }
        return idx;
    }

    verticalDirection(idx, segment, demoIndex, max) {
        if (idx === max && demoIndex === -1) {
            idx++;
            return idx;
        }

        if (demoIndex === idx || demoIndex === -1) {
            return idx;
        }

        if (segment.side === SpaceOrientation.BOTTOM && demoIndex < idx) {
            return idx;
        }

        if (segment.side === SpaceOrientation.TOP && idx > 0) {
            idx--;
        } else if (segment.side === SpaceOrientation.BOTTOM) {
            idx++;
        } else if (segment.side === SpaceOrientation.LEFT && idx > 0 && demoIndex < idx) {
            idx++;
        } else if (segment.side === SpaceOrientation.RIGHT && idx > 0 && demoIndex < idx) {
            idx++;
        }
        return idx;
    }

    dragleave(e) {
        if (!this.manager.demoFragment) {
            return;
        }
        if (this.manager.demoFragment.parentElement === null) {
            return;
        }
        let elem = this.element;
        let rect = elem.getBoundingClientRect();
        if (
            (e.clientX <= rect.left || e.clientX >= rect.right) ||
            (e.clientY <= rect.top || e.clientY >= rect.bottom)
        ) {
            this.manager.contextDragleave(this.manager.currentContext, e);
        }
    }

    dragenter(e) {
        let el = document.elementFromPoint(e.clientX, e.clientY);
        let context = this.manager.findContext(el);
        if (this.manager.currentContext && this.manager.currentContext !== context) {
            this.manager.contextDragleave(this.manager.currentContext, e);
        }
        if (context) {
            this.manager.currentContext = context;
        }
    }

    findContext(element) {
        let node = element;
        while (node) {
            if (node.dataset.hasOwnProperty('dropzone')) {
                let context = this.contexts.get(node);
                if (context && context.isAvailable()) {
                    return context;
                }
                node = node.parentElement;
            } else {
                node = node.parentElement;
            }
        }
        return null;
    }

    dragover(e) {
        if (!(this.manager.currentDragged instanceof Component)) {
            return;
        }
        let el = document.elementFromPoint(e.clientX, e.clientY);
        let context = this.manager.findContext(el);
        if (context) {
            let childs = context.component.getChildsBySpace(context.space);

            if (childs) {
                let childrenElements = context.dropzoneElement.children;
                let demoIndex = Array.from(childrenElements).indexOf(this.manager.demoFragment);

                for (let i in childs) {
                    let child = childs[i];

                    if (child.containsPoint(e.clientX, e.clientY)) {
                        let rect = child.fragment.getBoundingClientRect();
                        let childIdx = Array.from(childrenElements).indexOf(child.fragment);

                        let idx = context.getIndex(
                            childIdx,
                            e,
                            rect,
                            context.threshold,
                            demoIndex
                        );

                        if (idx === null) {
                            if (typeof this.manager.demoFragmentIndex !== "undefined" &&
                                context.dropCondition(
                                    this.manager.currentDragged,
                                    this.manager.oldParentCurrentDragged,
                                    this.manager.oldIndexCurrentDragged,
                                    this.manager.oldSpaceName,
                                    context.component,
                                    this.manager.demoFragmentIndex,
                                    context.space
                                )
                            ) {
                                e.preventDefault();
                            }
                            return;
                        }
                        let checkIdx = demoIndex < idx ? idx - 1 : idx;
                        if (
                            context.dropCondition(
                                this.manager.currentDragged,
                                this.manager.oldParentCurrentDragged,
                                this.manager.oldIndexCurrentDragged,
                                this.manager.oldSpaceName,
                                context.component,
                                checkIdx,
                                context.space
                            )
                        ) {
                            e.preventDefault();
                            context.addSelectorsActive(context);
                            context.component.ui.insertElement(context.dropzoneElement, this.manager.demoFragment, idx);
                            this.manager.demoFragmentIndex = checkIdx;
                        }
                        if (
                            this.manager.demoFragment &&
                            this.manager.demoFragment.parentElement !== null &&
                            this.manager.demoFragmentIndex > 0
                        ) {
                            e.preventDefault();
                        }
                        return;
                    }
                }

                let side = SpaceOrientation.getElementWithMinDistance(childrenElements, e.clientX, e.clientY);

                let idx = Array.from(childrenElements).indexOf(side.element);
                let length = childs.length;
                if (length > 0) {
                    length--;
                }
                idx = context.direction(idx, side, demoIndex, length);
                let checkIdx = demoIndex < idx && demoIndex !== -1 ? idx - 1 : idx;
                if (
                    context.dropCondition(
                        this.manager.currentDragged,
                        this.manager.oldParentCurrentDragged,
                        this.manager.oldIndexCurrentDragged,
                        this.manager.oldSpaceName,
                        context.component,
                        checkIdx,
                        context.space
                    )
                ) {
                    e.preventDefault();
                    if (checkIdx !== demoIndex) {
                        context.addSelectorsActive(context);
                        context.component.ui.insertElement(context.dropzoneElement, this.manager.demoFragment, idx);
                        this.manager.demoFragmentIndex = checkIdx;
                    }
                } else {
                    if (
                        this.manager.demoFragment &&
                        this.manager.demoFragment.parentElement !== null &&
                        this.manager.demoFragmentIndex > 0
                    ) {
                        e.preventDefault();
                    }
                }
            } else {
                if (
                    context.dropCondition(
                        this.manager.currentDragged,
                        this.manager.oldParentCurrentDragged,
                        this.manager.oldIndexCurrentDragged,
                        this.manager.oldSpaceName,
                        context.component,
                        0,
                        context.space
                    )
                ) {
                    e.preventDefault();
                    let childrenElements = context.dropzoneElement.children;
                    let demoIndex = Array.from(childrenElements).indexOf(this.manager.demoFragment);
                    if (demoIndex === -1) {
                        context.addSelectorsActive(context);
                        context.component.ui.insertElement(context.dropzoneElement, this.manager.demoFragment, 0);
                        this.manager.demoFragmentIndex = 0;
                    }
                }
            }
        }
    }

    contextDragleave(context, e) {
        if (typeof context === "undefined") {
            return;
        }
        let rect = context.dropzoneElement.getBoundingClientRect();
        if (
            (e.clientX <= rect.left || e.clientX >= rect.right) ||
            (e.clientY <= rect.top || e.clientY >= rect.bottom)
        ) {
            if (this.demoFragment.parentElement !== null) {
                this.demoFragment.parentElement.removeChild(this.demoFragment);
            }
            context.removeSelectorsActive(context);
            delete this.demoFragmentIndex;
        }
    }

    drop(e) {
        if (
            !this.manager.currentDragged instanceof Component ||
            this.manager.demoFragmentIndex < 0 ||
            typeof this.manager.demoFragmentIndex === "undefined"
        ) {
            return;
        }
        let el = document.elementFromPoint(e.clientX, e.clientY);
        let context = this.manager.findContext(el);
        if (context) {
            if (this.manager.demoFragment.parentElement) {
                this.manager.demoFragment.parentElement.removeChild(this.manager.demoFragment);
            }

            this.manager.aborted = true;

            if (
                context.dropCondition(
                    this.manager.currentDragged,
                    this.manager.oldParentCurrentDragged,
                    this.manager.oldIndexCurrentDragged,
                    this.manager.oldSpaceName,
                    context.component,
                    this.manager.demoFragmentIndex,
                    context.space
                )
            ) {
                context.removeSelectorsActive(context);
                context.drop(
                    this.manager.currentDragged,
                    this.manager.oldParentCurrentDragged,
                    this.manager.oldIndexCurrentDragged,
                    this.manager.oldSpaceName,
                    context.component,
                    this.manager.demoFragmentIndex,
                    context.space
                );
                this.manager.aborted = false;
            }
        }
    }

    mousedown(e) {
        this.manager.handleUuid = this.component.uuid;
    }

    mouseup(e) {
        delete this.manager.handleUuid;
    }

    dragstart(e) {
        if (this.manager.currentDragged) {
            return;
        }
        if (this.component.draghandleElement && this.manager.handleUuid !== this.component.uuid) {
            e.preventDefault();
            delete this.manager.handleUuid;
            return;
        }
        delete this.manager.handleUuid;
        let draggable = this.component.getDraggable();

        if (!this.draggableCondition(this.component.fragment, this.component)) {
            e.preventDefault();
            return;
        }

        let value = this.convertFormat(this.component, this.component.draggableFormat);

        this.dragImage(this.component, this.component.draggableFormat, e.dataTransfer.setDragImage);

        e.dataTransfer.setData(this.component.draggableFormat, value);
        this.manager.currentDragged = this.component;
        this.manager.demoFragment = this.createDemoFragment(this.component);

        this.addActiveDraggableSelectors(draggable, this.component);
        this.addDemoDraggableSelectors(draggable, this.manager.demoFragment);

        this.manager.aborted = true;

        setTimeout(function () {
            this.manager.oldParentCurrentDragged = this.manager.currentDragged.getParent();
            let spaceName = this.manager.oldParentCurrentDragged.getSpaceByChild(this.component);
            this.manager.oldSpaceName = spaceName;
            this.manager.oldIndexCurrentDragged = this.manager.oldParentCurrentDragged.getChildIndex(this.component, spaceName);
            let spaceElement = this.manager.oldParentCurrentDragged.getSpaceByName(spaceName);
            this.manager.currentDragged.setParent(null);
            this.manager.oldParentCurrentDragged.ui.insertElement(
                spaceElement, this.manager.demoFragment, this.manager.oldIndexCurrentDragged);
        }.bind(this), 0);
    }

    dragend(e) {
        if (this.component !== this.manager.currentDragged) {
            delete this.manager.handleUuid;
            delete this.manager.demoFragment;
            delete this.manager.currentContext;
            delete this.manager.oldParentCurrentDragged;
            delete this.manager.oldSpaceName;
            delete this.manager.oldIndexCurrentDragged;
            delete this.manager.demoFragmentIndex;
            delete this.manager.currentDragged;
            delete this.manager.aborted;
            e.preventDefault();
            return;
        }
        delete this.manager.handleUuid;
        if (this.manager.demoFragment && this.manager.demoFragment.parentElement) {
            this.manager.demoFragment.parentElement.removeChild(this.manager.demoFragment);
        }
        let draggable = this.component.getDraggable();

        this.removeActiveDraggableSelectors(draggable, this.component);

        this.userDragEnd(draggable, this.component);
        delete this.manager.demoFragment;

        if (this.manager.aborted) {
            this.manager.oldParentCurrentDragged.insertChild(this.manager.currentDragged, this.manager.oldSpaceName, this.manager.oldIndexCurrentDragged);
        }
        delete this.manager.currentContext;
        delete this.manager.oldParentCurrentDragged;
        delete this.manager.oldSpaceName;
        delete this.manager.oldIndexCurrentDragged;
        delete this.manager.demoFragmentIndex;
        delete this.manager.currentDragged;
        delete this.manager.aborted;
    }

    emptyDragend(draggable, component) {

    }

    userDragEnd(draggable, component) {
        draggable.dragend(component);
    }

    defaultAddDemoDraggableSelectors(draggable, demoFragment) {
        demoFragment.style.opacity = 0.4;
    }

    userAddDemoDraggableSelectors(draggable, demoFragment) {
        demoFragment.classList.add(draggable.selectors.demo);
    }

    emptyRemoveActiveDraggableSelectors(draggable, component) {

    }

    userRemoveActiveDraggableSelectors(draggable, component) {
        component.fragment.classList.remove(draggable.selectors.active);
    }

    emptyAddActiveDraggableSelectors(draggable, component) {

    }

    userAddActiveDraggableSelectors(draggable, component) {
        component.fragment.classList.add(draggable.selectors.active);
    }

    defaultDraggableCondition(draggableElement, draggableComponent) {
        return true;
    }

    defaultConvertFormat(component, draggableFormat) {
        return component;
    }

    defaultSetDragImage(component, draggableFormat, setDragImage) {

    }

    createDemoFragment(component) {
        return component.fragment.cloneNode(true);
    }

}