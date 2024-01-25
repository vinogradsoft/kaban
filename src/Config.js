export default class Config {

    constructor() {
        this.data = null;
        this.componentNames = null;
    }

    getRenderer(name) {
        return this.data['renderer'][name];
    }


    setConfig(config) {
        this.data = config;
    }

    setComponentNames(names) {
        this.componentNames = names;
    }

    containsName(name) {
        return this.componentNames.indexOf(name) !== -1;
    }

    getComponentNames() {
        return this.componentNames;
    }

}