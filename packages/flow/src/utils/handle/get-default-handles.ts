import { DEFAULT_POSITIONS } from '../../constants/handle';
import { FlowHandle } from '../../interfaces/element';

export const getDefaultHandles: () => FlowHandle[] = () => {
    return DEFAULT_POSITIONS.map(item => {
        return {
            position: item
        };
    });
};
