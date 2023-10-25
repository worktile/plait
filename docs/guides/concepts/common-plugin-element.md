---
title: common-plugin-element
order: 6
---

思维导图，图形都有 Textmanage，都支持设置富文本格式

在common中抽取 CommonPluginElement

```
export abstract class CommonPluginElement<
    T extends PlaitElement = PlaitElement,
    K extends PlaitBoard = PlaitBoard
> extends PlaitPluginElementComponent<T, K> {
    private textManages: TextManage[] = [];

    initializeTextManages(textManages: TextManage[]) {
        this.textManages = textManages;
    }

    getTextManages() {
        return this.textManages;
    }
}
```

抽取出公共类包含 textManages 用于统一设置文本格式。