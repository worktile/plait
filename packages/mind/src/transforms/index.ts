import { insertAbstract, setAbstractsByRefs, setAbstractByStandardLayout } from './abstract-node';
import { setLayout } from './layout';
import { setTopic, setTopicSize, deleteSelectedELements, insertNodes } from './node';
import { addEmoji, removeEmoji, replaceEmoji } from './emoji';

export const MindTransforms = {
    setLayout,
    setTopic,
    setTopicSize,
    addEmoji,
    removeEmoji,
    replaceEmoji,
    insertAbstract,
    setAbstractsByRefs,
    setAbstractByStandardLayout,
    deleteSelectedELements,
    insertNodes
};
