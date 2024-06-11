export interface RenderComponentRef<T> {
    destroy: () => void;
    update: (props: Partial<T>) => void;
}
