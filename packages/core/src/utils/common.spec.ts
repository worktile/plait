import { fakeAsync, tick } from '@angular/core/testing';
import { debounce } from './common';

describe('debounce', () => {
    let func: jasmine.Spy;
    let debouncedFunc: ReturnType<typeof debounce>;
    const wait = 100;

    beforeEach(() => {
        func = jasmine.createSpy('func');
        debouncedFunc = debounce(func, wait);
    });

    it('should call the function after the wait time', fakeAsync(() => {
        debouncedFunc();
        expect(func).not.toHaveBeenCalled();
        tick(wait);
        expect(func).toHaveBeenCalled();
    }));

    it('should not call the function if called again within the wait time', fakeAsync(() => {
        debouncedFunc();
        debouncedFunc();
        expect(func).not.toHaveBeenCalled();
        tick(wait);
        expect(func).toHaveBeenCalledTimes(1);
    }));

    it('should call the function immediately if leading option is true', fakeAsync(() => {
        const debouncedFuncLeading = debounce(func, wait, { leading: true });
        debouncedFuncLeading();
        expect(func).toHaveBeenCalled();
        tick(wait);
        expect(func).toHaveBeenCalledTimes(1);
    }));

    it('should call the function again after the wait time if leading option is true', fakeAsync(() => {
        const debouncedFuncLeading = debounce(func, wait, { leading: true });
        debouncedFuncLeading();
        expect(func).toHaveBeenCalledTimes(1);
        debouncedFuncLeading();
        expect(func).toHaveBeenCalledTimes(1);
        tick(wait);
        expect(func).toHaveBeenCalledTimes(2);
    }));
});
