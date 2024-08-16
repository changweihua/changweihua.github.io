<template>
  <div class="card">
    <div class="box">
      <div class="img_box">
        <video src="/videos/cover.mp4" muted autoplay loop playsinlie />
      </div>
    </div>

    <div class="box">
      <div class="content">
        <h2>
          常伟华
          <br />
          <span> Programmer & Designer </span>
        </h2>

        <ul>
          <li>
            Posts
            <span>22</span>
          </li>
          <li>
            Followers
            <span>0+</span>
          </li>
          <li>
            Following
            <span>7</span>
          </li>
        </ul>

        <button>关注</button>
      </div>
    </div>

    <div class="circle">
      <div class="img_box">
        <!-- <img src="/author.jpg" alt="" /> -->
        <div class="animated-avatar"></div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
:root {
  --clr: #f0f2f5;
}

.card {
  background-color: var(--vp-c-bg);
  position: relative;

  width: 320px;
  height: 430px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* 先把容器基本样式调整一下 */
.card .box {
  background-color: tomato;
  position: relative;

  width: 110%;
  height: 200px;
  /* 文本内容区域圆角 */
  border-radius: 20px;
}

/* 头像容器则使用定位布局 */
.card .circle {
  width: 180px;
  height: 180px;
  position: absolute;
  left: -70px;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 50%;
  border: 10px solid var(--vp-c-bg);
}

/* 调整img和video共有的父容器样式 */
.card .box .img_box,
.card .circle .img_box {
  position: absolute;
  inset: 0;
  overflow: hidden;
  /* img的圆角 */
  border-radius: 50%;
}

.card .box .img_box {
  /* video的圆角 */
  border-radius: 15px;
}

/* 调整图片和视频的样式 */
.card .box .img_box video,
.card .circle .img_box img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card .box .content button::before {
  content: "";
  width: 20px;
  height: 20px;
  background-color: transparent;
  position: absolute;
  top: 23px;
  left: -29px;
  border-top-right-radius: 20px;
  box-shadow: 5px -7px #fff;
}

.card .box .content button::after {
  content: "";
  width: 20px;
  height: 20px;
  background-color: transparent;
  position: absolute;
  top: 23px;
  right: -29px;
  border-top-left-radius: 20px;
  box-shadow: -5px -7px #fff;
}

.card .box:nth-child(1)::before {
  content: "";
  width: 20px;
  height: 20px;
  background-color: transparent;

  position: absolute;
  z-index: 10;
  top: 106px;
  left: -1px;
  border-bottom-left-radius: 20px;
  box-shadow: -6px 6px var(--vp-c-bg);
}

/* 样式同before类似，注意定位样式 */
.card .box:nth-child(1)::after {
  content: "";
  width: 20px;
  height: 20px;
  background-color: transparent;

  position: absolute;
  z-index: 10;
  bottom: -1px;
  left: 105px;
  border-bottom-left-radius: 20px;
  box-shadow: -6px 6px var(--vp-c-bg);
}

.card .box:nth-child(2) {
  background-color: #fff;

  width: 100%;
  height: 220px;
}

.card .box:nth-child(2)::before {
  content: "";
  width: 20px;
  height: 20px;
  background-color: transparent;

  position: absolute;
  z-index: 10;
  bottom: 106px;
  left: -1px;
  border-top-left-radius: 20px;
  box-shadow: -6px -6px var(--vp-c-bg);
}

.card .box:nth-child(2)::after {
  content: "";
  width: 20px;
  height: 20px;
  background-color: transparent;

  position: absolute;
  z-index: 10;
  top: -1px;
  left: 109px;
  border-top-left-radius: 20px;
  box-shadow: -6px -6px var(--vp-c-bg);
}

.card .box .content {
  position: absolute;
  inset: 0;
  padding: 30px 10px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

/* 姓名和Title样式 */
.card .box .content h2 {
  width: 100%;
  padding-left: 120px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  line-height: 1.1em;
  font-size: 1.15em;
  font-weight: 600;
  color: #333;
}

.card .box .content h2 span {
  letter-spacing: 0.05em;
  font-size: 0.75em;
  font-weight: 400;
  color: tomato;
  text-transform: initial;
}

/* 列表样式 */
.card .box .content ul {
  position: relative;
  top: 15px;

  width: 100%;
  padding: 0 10px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.card .box .content ul li {
  list-style: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 10px;
  font-size: 0.85em;
  font-weight: 500;
  color: #999;
}

.card .box .content ul li:not(:last-child) {
  border-right: 1px solid #ccc;
}

.card .box .content ul li span {
  font-size: 1.65em;
  color: #333;
}

/* 按钮样式 */
.card .box .content button {
  position: relative;
  top: 25px;
  padding: 8px 30px;
  border: none;
  outline: none;
  background-color: #03a9f4;
  border-radius: 30px;
  color: #fff;
  font-size: 1em;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 500;
  cursor: pointer;
  border: 5px solid var(--vp-c-bg);
  box-shadow: 0 0 0 10px #fff;
  transition: 0.5s;
}

.card .box .content button:hover {
  letter-spacing: 0.5em;
  background-color: #ff3d7f;
}

.animated-avatar {
  background-image: url(/author.jpg);
  background-size: 110%, 110%;
  background-position: center;
  background-repeat: no-repeat;
  width: 100%;
  height: 100%;
  cursor: pointer;
  position: relative;
  border-radius: 50%;
  // border: 2px solid #000;
}

.animated-avatar::before,
.animated-avatar::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transition: all 0.3s;
  left: 0;
  top: 0;
}

.animated-avatar::before {
  background-color: rgba(0, 0, 0, 0.2);
}

.animated-avatar::after {
  background: inherit;
  clip-path: circle(0% at 50% 50%);
}

.animated-avatar:hover::after {
  clip-path: circle(50% at 50% 50%);
}
</style>
