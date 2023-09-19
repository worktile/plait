import { insertAbstract, setAbstractsByRefs, setAbstractByStandardLayout } from './abstract-node';
import { setLayout } from './layout';
import {
    setTopic,
    setTopicSize,
    insertNodes,
    insertAbstractNodes,
    setRightNodeCountByRefs,
    setNodeManualWidth
} from './node';
import { addEmoji, removeEmoji, replaceEmoji } from './emoji';
import { removeImage, setImage } from './image';

export const MindTransforms = {
    setLayout,
    setTopic,
    setTopicSize,
    setNodeManualWidth,
    addEmoji,
    removeEmoji,
    replaceEmoji,
    insertAbstract,
    setAbstractsByRefs,
    setAbstractByStandardLayout,
    insertNodes,
    insertAbstractNodes,
    setRightNodeCountByRefs,
    removeImage,
    setImage
};
