<template>
  <div class="zw-webclient">
    <zw-header></zw-header>
    <div class="content-area">
      <zw-canvas></zw-canvas>
      <zw-discussion></zw-discussion>
    </div>
  </div>
</template>

<script>
export default {
  components: {
    'zw-header':     require('./zw-header').default,
    'zw-canvas':     require('./zw-canvas').default,
    'zw-discussion': require('./zw-discussion').default
  }
}
</script>

<style>
.zw-webclient {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.zw-webclient .content-area {
  display: flex;
  height: 100%;
}
</style>
