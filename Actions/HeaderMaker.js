export default class HeaderMaker{
    constructor() {}
        addHeader(key,value){
            this[key]=value;
            return this;
        }
}