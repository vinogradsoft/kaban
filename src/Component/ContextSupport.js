import PropertySupport from "./PropertySupport";

let supports = null;
export default class ContextSupport {

    static NAME_PROPERTY = 'NAME_PROPERTY';
    static ADD_SPACE_PROPERTY = 'ADD_SPACE_PROPERTY';
    static REMOVE_CHILDREN_PROPERTY = 'REMOVE_CHILDREN_PROPERTY';
    static SET_PARENT_PROPERTY = 'SET_PARENT_PROPERTY';
    static MODEL_CHANGED = 'MODEL_CHANGED';
    static COMPONENT_DELETED = 'COMPONENT_DELETED';
    static CHILD_INSERTED = 'CHILD_INSERTED';
    static CHILD_INDEX_CHANGED = 'CHILD_INDEX_CHANGED';
    static COMPONENTS_CREATED = 'COMPONENTS_CREATED';

    /*   static CHILD_INDEX_CHANGED = 'CHILD_INDEX_CHANGED';
       static CHILD_MOVED_TO_ANOTHER_SPACE = 'CHILD_MOVED_TO_ANOTHER_SPACE';*/

    static getSupport(comp) {
        if (supports === null) {
            supports = new WeakMap();
        }
        if (!supports.has(comp)) {
            let support = new PropertySupport();
            supports.set(comp, support);
            return support;
        }
        return supports.get(comp);
    }

}