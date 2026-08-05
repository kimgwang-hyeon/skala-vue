<script setup>
import { useConfigStore } from '@/stores/configStore.js'

const configStore = useConfigStore()
</script>

<template>
  <button
    class="unit-toggler"
    type="button"
    :aria-label="`온도 단위 변경, 현재 ${configStore.unitSymbol}`"
    title="온도 단위 변경"
    @click="configStore.toggleUnit"
  >
    <span :class="{ 'is-active': configStore.unit === 'celsius' }">°C</span>
    <span :class="{ 'is-active': configStore.unit === 'fahrenheit' }">°F</span>
  </button>
</template>
