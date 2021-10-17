<template>
  <div class="webclient">
    <zw-header></zw-header>
    <zw-workspace></zw-workspace>
  </div>
</template>

<script>
export default {
  components: {
    'zw-header':    require('./zw-header').default,
    'zw-workspace': require('./zw-workspace').default
  }
}
</script>

<style>
.webclient {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
