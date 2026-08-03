<script setup>
import LifecycleParent from './components/component/LifecycleParent.vue'
import PropsEmitsParent from './components/component/PropsEmitsParent.vue'
import SlotDefaultParent from './components/component/SlotDefaultParent.vue'
import SlotNamedParent from './components/component/SlotNamedParent.vue'
import SlotScopedParent from './components/component/SlotScopedParent.vue'
</script>

<template>
  <div class="container">
    <h1>Vue3 Component 심화 실습 노트</h1>

    <!-- 섹션 1: PDF 133~136페이지 -->
    <section class="card">
      <h2>1. Lifecycle Hooks (생명주기 훅)</h2>
      <p>컴포넌트의 생성(Mount), 수정(Update), 소멸(Unmount) 단계의 생명주기 훅 동작 원리 예제입니다.</p>
      <LifecycleParent />
    </section>

    <!-- 섹션 2: PDF 137~152페이지 -->
    <section class="card">
      <h2>2. Props & Emits (부모-자식 데이터 통신)</h2>
      <p>부모에서 자식으로 데이터를 전달(Props)하고, 자식에서 발생한 이벤트를 부모가 수신(Emits)하는 양방향 통신 예제입니다.</p>
      <PropsEmitsParent />
    </section>

    <!-- 섹션 3: PDF 153~154페이지 -->
    <section class="card">
      <h2>3. Default Slot (기본 슬롯 레이아웃 주입)</h2>
      <p>부모 컴포넌트에서 자식 컴포넌트 내부로 HTML 구조 및 텍스트 콘텐츠를 동적으로 주입하는 기본 슬롯 예제입니다.</p>
      <SlotDefaultParent />
    </section>

    <!-- 섹션 4: PDF 155페이지 -->
    <section class="card">
      <h2>4. Named Slot (이름을 가진 슬롯 주입)</h2>
      <p>v-slot:header 등의 이름을 가진 슬롯 영역별로 원하는 레이아웃 파트를 지정 주입하는 예제입니다.</p>
      <SlotNamedParent />
    </section>

    <!-- 섹션 5: PDF 156~157페이지 -->
    <section class="card">
      <h2>5. Scoped Slot (범위 지정 슬롯 - 자식 데이터 전달)</h2>
      <p>자식 컴포넌트 내부의 데이터를 부모가 주입하는 템플릿 영역에서 전달받아 활용하는 범위 지정 슬롯 예제입니다.</p>
      <SlotScopedParent />
    </section>
  </div>
</template>

<style>
/* 외부 기본 실습 공통 스타일 적용 */
@import '@/assets/practice.css';
</style>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
}

h1 {
  text-align: center;
  color: #42b883;
  margin-top: 10px;
  margin-bottom: 30px;
  font-weight: 800;
}

.card {
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  background-color: #ffffff;
  color: #1e293b;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.card h2 {
  margin-top: 0;
  color: #0f172a;
  font-size: 1.3rem;
  font-weight: 700;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 8px;
  margin-bottom: 12px;
}

.card p {
  color: #475569;
  font-size: 0.95rem;
  margin-bottom: 16px;
}

.card :deep(.practice-section) {
  border: none;
  padding: 0;
  margin: 0;
  background-color: transparent;
}

.card :deep(.practice-section > h2) {
  display: none;
}

.card :deep(button) {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background-color: #f1f5f9;
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 6px;
  margin-bottom: 6px;
}

.card :deep(button:hover) {
  background-color: #e2e8f0;
}

.card :deep(button:disabled) {
  background-color: #e2e8f0;
  color: #94a3b8;
  border-color: #cbd5e1;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
