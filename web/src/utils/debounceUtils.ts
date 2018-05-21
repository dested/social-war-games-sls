export class DebounceUtils {
    static debounce(key: string, ms: number, callback: () => void): any {
        if (DebounceUtils.debounceCallbacks[key]) {
            //                console.log(key + ' debounce stopped');
            clearTimeout(DebounceUtils.debounceCallbacks[key].timeout);
        }
        console.log(key + ' debounce started', ms);
        DebounceUtils.debounceCallbacks[key] = {
            callback,
            timeout: window.setTimeout(() => {
                console.log(key + ' debounce called');
                callback();
                delete DebounceUtils.debounceCallbacks[key];
            }, ms)
        };
    }

    static wait(key: string, ms: number, callback: () => void): any {
        if (DebounceUtils.debounceCallbacks[key]) {
            DebounceUtils.debounceCallbacks[key].callback = callback;
            return;
        }
        DebounceUtils.debounceCallbacks[key] = {
            callback,
            timeout: window.setTimeout(() => {
                DebounceUtils.debounceCallbacks[key].callback();
                delete DebounceUtils.debounceCallbacks[key];
            }, ms)
        };
    }
    private static debounceCallbacks: {[key: string]: {timeout: number; callback: () => void}} = {};
}
