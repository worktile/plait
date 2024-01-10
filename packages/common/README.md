# @plait/common


Common logic for drawing plugins. When writing drawing business code, if you find that there is some reusable logic between plugins, such as text processing, graphics rendering, image rendering, Resize interaction, Creation interaction, etc., try to write the code in `@plait /common` for easy reuse.

`core` core logic, currently mainly places the base class of plugin components

`generators` Generator is an abstract concept, mainly used for plug-in component rendering and management of drawing elements, 👉 [View more](https://plait-docs.vercel.app/guides/concepts/generator)

`plugins` places reusable plugin logic

`transforms` Common data processing logic

#### Dependence
- `@plait/core`