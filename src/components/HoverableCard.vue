<template>
  <div class="card">
    <p class="card-title">再见浓眉！地震级3方交易达成！</p>
    <p class="small-desc">
      湖人，独行侠，爵士一笔史诗级地震三方交易达成！湖人送走浓眉，克里斯蒂，希菲诺，得到东契奇，克勒贝尔，莫里斯。独行侠送走东契奇，克勒贝尔，莫里斯，2025年次轮签，得到浓眉，克里斯蒂，2029年首轮签，爵士为第三方参与者，在这笔交易中得到了希菲诺和2025年次轮。
    </p>
    <div class="go-corner">
      <div class="go-arrow">→</div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.card-title {
  color: #262626;
  font-size: 1.2em;
  line-height: normal;
  font-weight: 700;
  margin-bottom: 0.5em;
}

.small-desc {
  font-size: 0.8em;
  font-weight: 400;
  line-height: 1.3em;
  color: #452c2c;
}

.small-desc {
  font-size: 1em;
}

.go-corner {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  width: 2em;
  height: 2em;
  overflow: hidden;
  top: 0;
  right: 0;
  background: linear-gradient(135deg, #6293c8, #384c6c);
  border-radius: 0 4px 0 32px;
}

.go-arrow {
  margin-top: -4px;
  margin-right: -4px;
  color: white;
  font-family: courier, sans;
}

.card {
  display: block;
  position: relative;
  max-height: 320px;
  background-color: #f2f8f9;
  border-radius: 10px;
  padding: 2em 1.2em;
  margin: 12px;
  text-decoration: none;
  z-index: 0;
  overflow: hidden;
  background: linear-gradient(to bottom, #c3e6ec, #a7d1d9);
  font-family: Arial, Helvetica, sans-serif;
}

.card:before {
  content: "";
  position: absolute;
  z-index: -1;
  top: -16px;
  right: -16px;
  background: linear-gradient(135deg, #364a60, #384c6c);
  height: 32px;
  width: 32px;
  border-radius: 32px;
  transform: scale(1);
  transform-origin: 50% 50%;
  transition: transform 0.35s ease-out;
}

.card:hover:before {
  transform: scale(32);
}

.card:hover .small-desc {
  transition: all 0.5s ease-out;
  color: rgba(255, 255, 255, 0.8);
}

.card:hover .card-title {
  transition: all 0.5s ease-out;
  color: #ffffff;
}
</style>
