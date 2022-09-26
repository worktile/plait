import { EDITOR_TO_ELEMENT, IS_FOCUSED } from './weak-maps';
import { RichtextEditor } from '../plugins/richtext-editor';
import { Location, Transforms } from 'slate';

export function setFullSelectionAndFocus(editor: RichtextEditor, location: Location) {
    Transforms.select(editor, location);
    const isFocused = IS_FOCUSED.get(editor);
    const editable = EDITOR_TO_ELEMENT.get(editor);
    if (!isFocused && editable) {
        editable.focus({ preventScroll: true });
    }
}
