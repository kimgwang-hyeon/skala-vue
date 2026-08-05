<script setup>
import { useConfigStore } from '@/stores/configStore.js'

const configStore = useConfigStore()

const themeOptions = [
  { value: 'system', label: '시스템 설정' },
  { value: 'light', label: '라이트 모드' },
  { value: 'dark', label: '다크 모드' },
]
</script>

<template>
  <div class="theme-switcher" role="group" aria-label="화면 테마 선택">
    <button
      v-for="option in themeOptions"
      :key="option.value"
      type="button"
      class="theme-switcher-button"
      :class="{ 'is-active': configStore.theme === option.value }"
      :aria-label="option.label"
      :aria-pressed="configStore.theme === option.value"
      :title="option.label"
      @click="configStore.setTheme(option.value)"
    >
      <svg
        v-if="option.value === 'system'"
        aria-hidden="true"
        viewBox="0 0 24 24"
      >
        <rect x="3.5" y="4.5" width="17" height="12" rx="2" />
        <path d="M8 20h8M12 16.5V20" />
      </svg>

      <svg v-else-if="option.value === 'light'" aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2 12h2.2M19.8 12H22M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
      </svg>

      <svg v-else aria-hidden="true" viewBox="0 0 24 24">
        <path d="M20 15.2A8 8 0 0 1 8.8 4a8.1 8.1 0 1 0 11.2 11.2Z" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.theme-switcher {
  gap: 1px;
}

.theme-switcher-button {
  display: grid;
  width: 27px;
  height: 26px;
  padding: 0;
  color: var(--text-tertiary);
  background: transparent;
  border: 0;
  border-radius: 5px;
  cursor: pointer;
  place-items: center;
}

.theme-switcher-button:hover {
  color: var(--text-primary);
}

.theme-switcher-button.is-active {
  color: var(--text-primary);
  background: var(--surface-primary);
  box-shadow: var(--shadow-small);
}
</style>
