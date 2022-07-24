<template>
  <router-view></router-view>
</template>

<style>
:root {
  /*
    Note 1: we use the native font of the respective platform.
      https://make.wordpress.org/core/2016/07/07/native-fonts-in-4-6/
      https://bitsofco.de/the-new-system-font-stack/
    Update: since Cytoscape 3.3 "BlinkMacSystemFont" lets crash Chrome on macOS.
      https://github.com/cytoscape/cytoscape.js/issues/2249
    As a workaround since DMX 5.0-beta-3 we replace "BlinkMacSystemFont" by "system-ui" which is supported by both,
    Safari and Chrome. Firefox (at least up to version 66) still needs "-apple-system".
      https://caniuse.com/#feat=font-family-system-ui

    Note 2: multiple-word font names like "Segoe UI" are not quoted.
    In various browsers DOM style.getPropertyValue() works differently (see https://jsfiddle.net/jri_/tt8o97yu/2/):
      Safari: converts " -> '
      Chrome: converts ' -> "
      Firefox: no conversion
    This affects at least 2 situations:
      1) When styling Cytoscape nodes/edges (style: {'font-family': ...}) Cytoscape expects " to be used when quoting
         multiple-word font names. Otherwise an error is reported along with stacktrace (but rendering works anyways).
      2) When rendering a SVG <text> element the font-family attribute value must be enclosed in the opposite quoting
         style (e.g. <text font-family='"Lucida Grande", sans-serif'>). Otherwise the SVG would be malformed.
    So, the different style.getPropertyValue() browser behavior creates quite a mess.
    All the mess vanish if multiple-word font names are not quoted at all in CSS. There are some debates whether this
    is valid CSS or not. Fact is multiple-word font names without quotes do work in all major browsers.
  */
  --primary-font-family: -apple-system, system-ui, Segoe UI, Roboto, Oxygen-Sans, Ubuntu, Cantarell, Helvetica Neue,
      sans-serif;
  --primary-font-size: 14px;
  --secondary-font-size: 13px;
  --secondary-color: #808080;
  --line-height: 1.5;
  --paragraph-spacing: 0.5em;
  --field-spacing: 16px;                      /* vertical spacing between data fields */

  --header-color: black;
  --discussion-color: #e6e6e6;
  --doc-filter-color: #ffe880;
  --primary-color: #ffd100;                   /* (yellow) */
  --primary-color-light: #fff6cc;             /* (light yellow) */
  --highlight-color: #409eff;                 /* matches Element UI --color-primary */
  --highlight-color-2: #66b1ff;               /* matches Element UI --color-primary-light-2 */
  --highlight-color-9: #ecf5ff;               /* matches Element UI --color-primary-light-9 */
  --color-danger: #f56c6c;                    /* matches Element UI --color-danger */
  --border-color: #dcdfe6;                    /* matches Element UI --border-color-base */
  --border-color-lighter: #ebeef5;            /* matches Element UI --border-color-lighter */
  --glow-duration: 3s;                        /* corresponds to jumpTo() in zw-discussion.vue */
}

html {
  height: 100%;
}

body {
  height: 100%;
  margin: 0;
  overflow: hidden;         /* avoid body bounce when scrolling reaches top/bottom */
  word-break: break-word;   /* FIXME: long attachment names (discussion panel) still don't break */
  /* overflow-wrap: break-word; */
  font-family: var(--primary-font-family);
  font-size:   var(--primary-font-size);
}

body.fixed {
  position: fixed;
}

/* Reusable classes */

.secondary {
  color: var(--secondary-color);
}

.label {
  font-size: var(--secondary-font-size) !important;
  color:     var(--secondary-color) !important;
}

.field-label {
  font-size: var(--secondary-font-size) !important;
  color:     var(--secondary-color) !important;
  margin-bottom: 3px !important;
}

.field + .field {
  margin-top: var(--field-spacing);
}

/* Element UI Overrides */
.el-button--text {
  padding: 0 !important;
}

.el-loading-mask {
  background-color: rgba(255, 255, 255, .7) !important;       /* Element UI default alpha is 0.9 */
}

.el-notification__content {
  text-align: unset !important;
}

.el-notification__content p {
  margin-top: 1em !important;
}

.el-collapse-item__header,
.el-collapse-item__content {
  font-size: unset !important;
}

.el-collapse-item.zw-selected .el-collapse-item__wrap,
.el-collapse-item.zw-selected .el-collapse-item__header {
  background-color: var(--highlight-color-9);
}

/* HTML fields */

.dmx-html-field {
  line-height: var(--line-height);
}

.dmx-html-field p {
  margin: 0;
}

.dmx-html-field p + p {
  margin-top: var(--paragraph-spacing);
}

.dmx-html-field img {
  max-width: 100%;
}

.dmx-html-field a {
  color: var(--highlight-color);
}

.dmx-html-field a:hover {
  color: var(--highlight-color-2);
}

/* Adopt Quill list style in info mode */

.dmx-html-field.info ol > li,
.dmx-html-field.info ul > li {
  list-style-type: none;
}

.dmx-html-field.info ul > li::before {
  content: '\2022';
}

.dmx-html-field.info li::before {
  display: inline-block;
  white-space: nowrap;
  width: 1.2em;
  margin-left: -1.5em;
  margin-right: 0.3em;
  text-align: right;
}

.dmx-html-field.info li.ql-indent-1 { padding-left:  3em; }
.dmx-html-field.info li.ql-indent-2 { padding-left:  6em; }
.dmx-html-field.info li.ql-indent-3 { padding-left:  9em; }
.dmx-html-field.info li.ql-indent-4 { padding-left: 12em; }
.dmx-html-field.info li.ql-indent-5 { padding-left: 15em; }
.dmx-html-field.info li.ql-indent-6 { padding-left: 18em; }

.dmx-html-field.info ol li             { counter-increment: list-0; counter-reset: list-1; }
.dmx-html-field.info ol li.ql-indent-1 { counter-increment: list-1; counter-reset: list-2; }
.dmx-html-field.info ol li.ql-indent-2 { counter-increment: list-2; counter-reset: list-3; }
.dmx-html-field.info ol li.ql-indent-3 { counter-increment: list-3; counter-reset: list-4; }
.dmx-html-field.info ol li.ql-indent-4 { counter-increment: list-4; counter-reset: list-5; }
.dmx-html-field.info ol li.ql-indent-5 { counter-increment: list-5; counter-reset: list-6; }

.dmx-html-field.info ol li:before             { content: counter(list-0, decimal)     '.'; }
.dmx-html-field.info ol li.ql-indent-1:before { content: counter(list-1, lower-alpha) '.'; }
.dmx-html-field.info ol li.ql-indent-2:before { content: counter(list-2, lower-roman) '.'; }
.dmx-html-field.info ol li.ql-indent-3:before { content: counter(list-3, decimal)     '.'; }
.dmx-html-field.info ol li.ql-indent-4:before { content: counter(list-4, lower-alpha) '.'; }
.dmx-html-field.info ol li.ql-indent-5:before { content: counter(list-5, lower-roman) '.'; }

/* Quill Overrides */

.ql-container {
  font-family: var(--primary-font-family) !important;     /* Quill default is "Helvetica, Arial, sans-serif" */
  font-size:   var(--primary-font-size)   !important;     /* Quill default is 13px */
}

.ql-container .ql-editor {
  line-height: inherit !important;                        /* Quill default is 1.42; inherit from dmx-html-field */
  padding: 6px 8px !important;                            /* Quill default is 12px 15px */
  background-color: white;
}

.ql-container .ql-editor.ql-blank::before {
  color: rgba(0, 0, 0, 0.4);                              /* Quill default is rgba(0, 0, 0, 0.6)
}

.ql-container .ql-editor h1 {
  margin-top: 0.67em;                                     /* Restore user agent style; Quill default is 0 */
  margin-bottom: 0.67em;                                  /* Restore user agent style; Quill default is 0 */
}

.ql-container .ql-editor h2 {
  margin-top: 0.83em;                                     /* Restore user agent style; Quill default is 0 */
  margin-bottom: 0.83em;                                  /* Restore user agent style; Quill default is 0 */
}

.ql-container .ql-editor h3 {
  margin-top: 1em;                                        /* Restore user agent style; Quill default is 0 */
  margin-bottom: 1em;                                     /* Restore user agent style; Quill default is 0 */
}

.ql-container .ql-editor ol,
.ql-container .ql-editor ul {
  margin-top: 1em;                                        /* Restore user agent style; Quill default is 0 */
  margin-bottom: 1em;                                     /* Restore user agent style; Quill default is 0 */
}

.ql-container .ql-tooltip {
  width: 250px;         /* fixed toolbar width */
  z-index: 2;           /* stack toolbar above adjacent detail panel fields and el-checkboxes (z-index 1) */
}

.ql-container .ql-tooltip .ql-toolbar .ql-formats:nth-child(4) {
  margin-left: 12px;    /* margin for 2nd toolbar row */
}
</style>
