<template>
  <div class="w-full px-6 items-center">
    <div v-for="(line, lineIndex) in textLines" :key="lineIndex" class="line">
      <div class="line-content">
        <div
          v-for="(char, charIndex) in line.characters"
          :key="charIndex"
          class="char-container"
        >
          <div class="pinyin">{{ char.pinyin }}</div>
          <div class="character">{{ char.character }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { pinyin } from "pinyin-pro";

// // 引入前需要先通过 `npm install @pinyin-pro/data` 进行安装 使用完整字典 但是体积有点大啊 这里只是测试
// import CompleteDict from "@pinyin-pro/data/complete";

// addDict(CompleteDict);

// 毛泽东的《沁园春·长沙》
const poem = `
独立寒秋，湘江北去，橘子洲头。
看万山红遍，层林尽染；漫江碧透，百舸争流。
鹰击长空，鱼翔浅底，万类霜天竞自由。
怅寥廓，问苍茫大地，谁主沉浮？

携来百侣曾游，忆往昔峥嵘岁月稠。
恰同学少年，风华正茂；书生意气，挥斥方遒。
指点江山，激扬文字，粪土当年万户侯。
曾记否，到中流击水，浪遏飞舟？
`;

const textLines = poem
  .split("。")
  .map((line) => {
    return {
      characters: line
        .split("")
        .map((char) => ({
          character: char,
          // { toneType: 'none' } 没有声调 { toneType: 'default' } 默认有声调
          pinyin: pinyin(char),
        }))
        .filter((char) => char.character.trim() !== ""),
    };
  })
  .filter((line) => line.characters.length > 0);
</script>

<style scoped>
.line {
  margin-bottom: 20px;
  font-family: MapleMono, "JetBrains Maple Mono", AlibabaPuHuiTi, JetBrainsMono;

  .line-content {
    display: flex;
    justify-content: flex-start;
  }

  .char-container {
    width: 40px; /* 设置固定宽度 */
    text-align: center;
    margin-right: 5px;
  }

  .pinyin {
    font-size: 14px;
    color: gray;
  }

  .character {
    font-size: 20px;
  }
}
</style>
