import * as saveUtils from './save'
declare global {
    interface Window {
        saveUtils: typeof saveUtils;
    }
}
window.saveUtils = saveUtils
