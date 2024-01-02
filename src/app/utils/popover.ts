import { fromEvent, take } from 'rxjs';

export function closeAction(action: () => void) {
    setTimeout(() => {
        fromEvent(document, 'click')
            .pipe(take(1))
            .subscribe(event => {
                action();
            });
    }, 201);
}
