import { insertAbstract, setAbstractsByRefs, setAbstractByStandardLayout } from './abstract-node';
import {
    setTopic,
    insertNodes,
    insertAbstractNodes,
    setRightNodeCountByRefs,
    setNodeManualWidth,
    insertChildNode,
    insertSiblingNode,
    insertMind
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
    insertSiblingNode,
    insertMind
};
