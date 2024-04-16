import { GeneralTransforms } from './general';
import { GroupTransforms } from './group';
import { NodeTransforms } from './node';
import { SelectionTransforms } from './selection';
import { ViewportTransforms } from './viewport';
import { ZIndexTransforms } from './z-index';

export { BoardTransforms } from './board';
export { CoreTransforms } from './element';

export const Transforms: GeneralTransforms &
    ViewportTransforms &
    SelectionTransforms &
    NodeTransforms &
    GroupTransforms &
    ZIndexTransforms = {
    ...GeneralTransforms,
    ...ViewportTransforms,
    ...SelectionTransforms,
    ...NodeTransforms,
    ...GroupTransforms,
    ...ZIndexTransforms
};
