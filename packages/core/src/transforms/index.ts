import { AlignTransform } from './align';
import { GeneralTransforms } from './general';
import { NodeTransforms } from './node';
import { SelectionTransforms } from './selection';
import { ViewportTransforms } from './viewport';

export { BoardTransforms } from './board';
export { CoreTransforms } from './element';
export * from './align';

export const Transforms: GeneralTransforms & ViewportTransforms & SelectionTransforms & NodeTransforms & AlignTransform = {
    ...GeneralTransforms,
    ...ViewportTransforms,
    ...SelectionTransforms,
    ...NodeTransforms,
    ...AlignTransform
};
