import { DEFAULT_POSITIONS } from '../constants';
import { FlowHandle, FlowPosition } from '../interfaces';

/**
 * getDefaultHandles
 * @returns FlowHandle[]
 */
export const getDefaultHandles: () => FlowHandle[] = () => {
    return DEFAULT_POSITIONS.map(item => {
        return {
            position: item
        };
    });
};
