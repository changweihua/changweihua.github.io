<template>
  <figure class="container">
    <span class="girl"></span>
    <div class="boys">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  </figure>
</template>

<style lang="scss" scoped>
.container {
  width: 8em;
  height: 1em;
  font-size: 35px;
  display: flex;
  justify-content: space-between;
}

.container span {
  width: 1em;
  height: 1em;
  --duration: 1.5s;
}

.girl {
  animation: slide var(--duration) ease-in-out infinite alternate;
}


.boys {
  width: 6em;
  display: flex;
  justify-content: space-between;
}

.boys span {
  transform-origin: -50% center;
  animation: var(--duration) ease-in-out infinite alternate;
}

.boys span:nth-child(1) {
  animation-name: jump-off-1;
}

.boys span:nth-child(2) {
  animation-name: jump-off-2;
}

.boys span:nth-child(3) {
  animation-name: jump-off-3;
}

.boys span:nth-child(4) {
  animation-name: jump-off-4;
}


.container span::before {
  content: "";
  position: absolute;
  width: inherit;
  height: inherit;
  border-radius: 15%;
  box-shadow: 0 0 0.1em rgba(0, 0, 0, 0.3);
}

.girl::before {
  background-color: hotpink;
}

.boys span::before {
  background-color: dodgerblue;
  animation: var(--duration) ease-in-out infinite alternate;
}

.boys span:nth-child(1)::before {
  filter: brightness(1);
  animation-name: jump-down-1;
}

.boys span:nth-child(2)::before {
  filter: brightness(1.15);
  animation-name: jump-down-2;
}

.boys span:nth-child(3)::before {
  filter: brightness(1.3);
  animation-name: jump-down-3;
}

.boys span:nth-child(4)::before {
  filter: brightness(1.45);
  animation-name: jump-down-4;
}

</style>
