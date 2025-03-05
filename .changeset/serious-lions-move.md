---
'@plait/core': minor
---

support i18n method, you can config default text like below code:

```
const { getI18nValue } = newBoard;
newBoard.getI18nValue = (key) => {
    if (key === DrawI18nKey.lineText) {
        return 'Text';
    }
    if (key === DrawI18nKey.geometryText) {
        return 'Text';
    }
    if (key === MindI18nKey.mindCentralText) {
        return 'Central Topic';
    }
    return getI18nValue(key);
};
```
