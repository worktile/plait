import { insertAbstract, setAbstractsByRefs, setAbstractByStandardLayout } from './abstract-node';
import {
    setTopic,
    setTopicSize,
    insertNodes,
    insertAbstractNodes,
    setRightNodeCountByRefs,
    setNodeManualWidth,
    insertChildNode,
    insertSiblingNode
} from './node';
import { addEmoji, removeEmoji, replaceEmoji } from './emoji';
import { removeImage, setImage } from './image';
import { setShape, setBranchShape, setBranchWidth, setLayout, setBranchColor } from './property';

export const MindTransforms = {
    setLayout,
    setShape,
    setBranchShape,
    setBranchWidth,
    setBranchColor,
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
    setImage,
    insertChildNode,
    insertSiblingNode
};
