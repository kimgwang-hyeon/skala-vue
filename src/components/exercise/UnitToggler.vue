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

<style scoped>
.unit-toggler {
  gap: 1px;
  cursor: pointer;
}

.unit-toggler span {
  display: grid;
  min-width: 30px;
  height: 26px;
  padding: 0 5px;
  color: var(--text-tertiary);
  border-radius: 5px;
  place-items: center;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 650;
}

.unit-toggler span.is-active {
  color: var(--text-primary);
  background: var(--surface-primary);
  box-shadow: var(--shadow-small);
}
</style>
