<template>
  <div class="loader-wrapper">
    <div class="loader">
      <span></span>
      <span></span>
      <span></span>

      <span></span>
      <span></span>
      <span></span>

      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.loader-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;

  .loader {
    display: grid;
    grid-template-columns: repeat(3, 50px);
    grid-template-rows: repeat(3, 50px);
    gap: 5px;

    transform: rotate(45deg);
  }

  .loader span {
    background-color: #fff;
    border-radius: 8px;

    animation: loading 1.5s ease-in-out infinite;
  }
  /* 1~3 */
  .loader span:nth-child(-n + 3) {
    background-color: #4bc8eb;
  }
  /* 4~6 */
  .loader span:nth-child(n + 4):nth-child(-n + 6) {
    background-color: #f13a8f;
  }
  /* 7~9 */
  .loader span:nth-child(n + 7):nth-child(-n + 9) {
    background-color: #36f372;
  }

  /* ... */

  /* 第一列 */
  .loader span:nth-child(7) {
    animation-delay: 0.6s;
  }

  /* 第二列 */
  .loader span:nth-child(4),
  .loader span:nth-child(8) {
    animation-delay: 0.7s;
  }

  /* 第三列 */
  .loader span:nth-child(1),
  .loader span:nth-child(5),
  .loader span:nth-child(9) {
    animation-delay: 0.8s;
  }

  /* 第四列 */
  .loader span:nth-child(2),
  .loader span:nth-child(6) {
    animation-delay: 0.9s;
  }

  /* 第五列 */
  .loader span:nth-child(3) {
    animation-delay: 1s;
  }
}
</style>
<style>

@keyframes loading {
    0%,
    100% {
      opacity: 0;
      transform: scale(0);
    }

    35%,
    65% {
      opacity: 1;
      transform: scale(1);
    }
  }

</style>
