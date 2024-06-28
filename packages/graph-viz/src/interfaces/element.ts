import { PlaitElement } from '@plait/core';
export interface ForceAtlasNodeElement extends PlaitElement {
    label: string;
    icon: string;
    isActive?: boolean;
}

export interface ForceAtlasEdgeElement extends PlaitElement {
    source: string;
    target: string;
}

export interface ForceAtlasElement extends PlaitElement {
    children: (ForceAtlasNodeElement | ForceAtlasEdgeElement)[];
}

export const ForceAtlasElement = {
    isForceAtlas: (value: any) => {
        return value?.type === 'force-atlas';
    },
    isForceAtlasNodeElement: (value: any): value is ForceAtlasNodeElement => {
        return value && value.label && value.icon;
    },
    isForceAtlasEdgeElement: (value: any): value is ForceAtlasEdgeElement => {
        return value && value.source && value.target;
    }
};
