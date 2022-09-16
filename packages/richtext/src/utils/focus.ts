import { EDITOR_TO_ELEMENT, IS_FOCUSED } from './weak-maps';
import { RichtextEditor } from '../plugins/richtext-editor';
import { Transforms } from 'slate';

export function setFullSelectionAndFocus(editor: RichtextEditor) {
    Transforms.select(editor, [0, 0]);
    const isFocused = IS_FOCUSED.get(editor);
    const editable = EDITOR_TO_ELEMENT.get(editor);
    console.log(editable);
    if (!isFocused && editable) {
        editable.focus({ preventScroll: true });
    }
}
