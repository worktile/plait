import { PlaitPlugin } from '../interfaces';

export type BoardEventName = 'pointerDown' | 'pointerMove' | 'pointerUp' | 'globalPointerUp' | 'touchStart';

export type BoardEventCalls = Partial<Record<BoardEventName, Event[]>>;

/**
 * Creates a plugin that records events delegated by plugins applied after it.
 *
 * Place the observer before the plugin under test in the plugin list so that it
 * observes events delegated downstream:
 * `[observer.plugin, pluginUnderTest]`.
 */
export const createBoardEventObserver = (eventNames: BoardEventName[]) => {
    const calls: BoardEventCalls = {};

    eventNames.forEach((eventName) => {
        calls[eventName] = [];
    });

    const plugin: PlaitPlugin = (board) => {
        eventNames.forEach((eventName) => {
            const downstream = board[eventName] as (event: Event) => void;

            Object.assign(board, {
                [eventName]: (event: Event) => {
                    calls[eventName]!.push(event);
                    downstream(event);
                }
            });
        });

        return board;
    };

    const clear = () => {
        eventNames.forEach((eventName) => {
            calls[eventName]!.length = 0;
        });
    };

    return {
        plugin,
        calls,
        clear
    };
};
