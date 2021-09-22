<template>
  <router-view></router-view>
  <!--
    Note: the Vue template compiler is not available as we use the Vue runtime.
    So we can't put <router-view> in index.html but must render the root component
    (= this one) via render function (see main.js).
  -->
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
  --main-font-family: -apple-system, system-ui, Segoe UI, Roboto, Oxygen-Sans, Ubuntu, Cantarell, Helvetica Neue,
      sans-serif;
  --main-font-size: 14px;
}

html {
  height: 100%;
}

body {
  height: 100%;
  margin: 0;
  overflow: hidden;   /* avoid window bounce when scrolling reaches top/bottom */
  font-family: var(--main-font-family);
  font-size:   var(--main-font-size);
}
</style>
