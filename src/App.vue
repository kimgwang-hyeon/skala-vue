<script setup>
import SampleOne from './components/practices/basic/SampleOne.vue'
import SampleTwo from './components/practices/basic/SampleTwo.vue'
import VueHtml from './components/practices/basic/VueHtml.vue'
import VueHtmlXSS from './components/practices/basic/VueHtmlXSS.vue'
import VueText from './components/practices/basic/VueText.vue'
import VueBind from './components/practices/basic/VueBind.vue'
import VueBindClass from './components/practices/basic/VueBindClass.vue'
import VueBindStyle from './components/practices/basic/VueBindStyle.vue'
import VueBindShorthand from './components/practices/basic/VueBindShorthand.vue'
import VueIf from './components/practices/basic/VueIf.vue'
</script>

<template>
  <div class="container">
    <h1>Vue3 기초 실습 노트</h1>

    <!-- 섹션 1 -->
    <section class="card">
      <h2>1. Sample One</h2>
      <p>첫 번째 기본 실습 예제입니다.</p>
      <SampleOne />
    </section>

    <!-- 섹션 2 -->
    <section class="card">
      <h2>2. Sample Two</h2>
      <p>두 번째 기본 실습 예제입니다.</p>
      <SampleTwo />
    </section>

    <!-- 섹션 3 -->
    <section class="card">
      <h2>3. Vue HTML 바인딩</h2>
      <p>v-html 디렉티브 기본 활용 예제입니다.</p>
      <VueHtml />
    </section>

    <!-- 섹션 4 -->
    <section class="card">
      <h2>4. Vue HTML XSS</h2>
      <p>v-html 사용 시 XSS 보안 주의사항 실습 예제입니다.</p>
      <VueHtmlXSS />
    </section>

    <!-- 섹션 5 -->
    <section class="card">
      <h2>5. Vue Text 바인딩</h2>
      <p>v-text 디렉티브와 일반 보간법({{ }}) 비교 예제입니다.</p>
      <VueText />
    </section>

    <!-- 섹션 6 -->
    <section class="card">
      <h2>6. Vue Bind 속성 바인딩</h2>
      <p>v-bind 디렉티브(:속성명)를 활용한 동적 속성 및 상태 연결 예제입니다.</p>
      <VueBind />
    </section>

    <!-- 섹션 7 -->
    <section class="card">
      <h2>7. Vue Bind 클래스 바인딩</h2>
      <p>v-bind:class 객체 및 배열 형식을 활용한 동적 클래스 적용 예제입니다.</p>
      <VueBindClass />
    </section>

    <!-- 섹션 8 -->
    <section class="card">
      <h2>8. Vue Bind 스타일 바인딩</h2>
      <p>v-bind:style 객체 및 배열 형식을 활용한 동적 스타일 적용 예제입니다.</p>
      <VueBindStyle />
    </section>

    <!-- 섹션 9 -->
    <section class="card">
      <h2>9. Vue Bind 동일 이름 단축 구문</h2>
      <p>Vue 3.4+ Same-name Shorthand(:속성명) 단축 바인딩 예제입니다.</p>
      <VueBindShorthand />
    </section>

    <!-- 섹션 10 -->
    <section class="card">
      <h2>10. Vue If 조건부 렌더링</h2>
      <p>v-if, v-else-if, v-else 디렉티브를 활용한 조건부 렌더링 예제입니다.</p>
      <VueIf />
    </section>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
}

h1 {
  text-align: center;
  color: #42b883;
  margin-bottom: 30px;
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
  margin-bottom: 8px;
}

.card p {
  color: #475569;
  font-size: 0.95rem;
  margin-bottom: 16px;
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
}

.card :deep(button:disabled) {
  background-color: #e2e8f0;
  color: #94a3b8;
  border-color: #cbd5e1;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
