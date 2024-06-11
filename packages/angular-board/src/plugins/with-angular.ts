import { ComponentType, PlaitBoard } from '@plait/core';
import { AngularBoard } from './angular-board';
import { PlaitTextBoard, TextComponentRef, TextProps } from '@plait/common';
import { PlaitTextComponent } from '@plait/angular-text';
import { AngularEditor } from 'slate-angular';
import { BOARD_TO_COMPONENT } from '../utils/weak-maps';
import { BoardComponentInterface } from '../board/board.component.interface';

export const withAngular = (board: PlaitBoard & PlaitTextBoard) => {
    const newBoard = board as PlaitBoard & PlaitTextBoard & AngularBoard;

    newBoard.renderComponent = <T, K extends { nativeElement: () => HTMLElement }>(
        type: ComponentType<K>,
        container: Element | DocumentFragment,
        props: T
    ) => {
        const boardComponent = BOARD_TO_COMPONENT.get(board) as BoardComponentInterface;
        const componentRef = boardComponent.viewContainerRef.createComponent<K>(type);
        for (const key in props) {
            const value = props[key as keyof T];
            (componentRef.instance as any)[key as keyof TextProps] = value as any;
        }
        container.appendChild(componentRef.instance.nativeElement());
        componentRef.changeDetectorRef.detectChanges();
        const ref: TextComponentRef = {
            destroy: () => {
                componentRef.destroy();
            },
            update: (props: Partial<TextProps>) => {
                for (const key in props) {
                    const value = props[key as keyof TextProps];
                    (componentRef.instance as any)[key] = value;
                }
                // solve image lose on move node
                if (container.children.length === 0) {
                    container.append(componentRef.instance.nativeElement());
                }
                componentRef.changeDetectorRef.detectChanges();
            }
        };
        return { ref, componentRef };
    };

    newBoard.renderText = (container: Element | DocumentFragment, props: TextProps) => {
        const { ref, componentRef } = newBoard.renderComponent(PlaitTextComponent, container, props);
        const { update } = ref;
        ref.update = props => {
            const beforeReadonly = componentRef.instance.readonly;
            update(props);
            if (beforeReadonly === true && props.readonly === false) {
                AngularEditor.focus(componentRef.instance.editor);
            } else if (beforeReadonly === false && props.readonly === true) {
                AngularEditor.blur(componentRef.instance.editor);
            }
        };
        return ref;
    };

    return newBoard;
};
