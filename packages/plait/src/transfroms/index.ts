import { GeneralTransforms } from './general';
import { NodeTransforms } from './node';
import { SelectionTransforms } from './selection';
import { ViewportTransforms } from './viewport';

export const Transforms: GeneralTransforms & ViewportTransforms & SelectionTransforms & NodeTransforms = {
    ...GeneralTransforms,
    ...ViewportTransforms,
    ...SelectionTransforms,
    ...NodeTransforms
};
