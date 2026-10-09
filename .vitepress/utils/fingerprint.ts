import FingerprintJS from "@fingerprintjs/fingerprintjs";

// 使用 FingerprintJS 创建设备指纹
async function getDeviceFingerprint(saving: boolean) {
  const fpPromise = await FingerprintJS.load();
  const fp = await fpPromise.get();
  if (saving) {
    localStorage.setItem("storedFingerprint", fp.visitorId);
  }
  return fp.visitorId; // 返回设备指纹
}

// 验证设备指纹
async function verifyDeviceFingerprint() {
  const currentFingerprint = await getDeviceFingerprint(false);
  const storedFingerprint = localStorage.getItem("storedFingerprint");

  if (currentFingerprint !== storedFingerprint) {
    alert("检测到异常登录！"); // 可以触发安全提示或二次验证
  } else {
    alert("登录成功！");
  }
}

export {
  getDeviceFingerprint,
  verifyDeviceFingerprint
}

// // 在登录页面或关键操作处调用验证函数
// verifyDeviceFingerprint();

// // 根据设备指纹提供个性化推荐： 将设备指纹和用户的浏览行为结合起来，使用推荐算法为用户提供个性化的推荐内容。
// // 获取用户设备指纹和浏览行为
// async function personalizeRecommendations() {
//   const deviceId = await getDeviceFingerprint();
//   const userHistory = fetchUserHistory(deviceId); // 模拟获取用户浏览历史

//   // 根据用户历史和设备指纹推荐商品
//   const recommendations = recommendProducts(userHistory);
//   displayRecommendations(recommendations);
// }


// function displayRecommendations(recommendations) {
//   const recommendationList = document.getElementById('recommendation-list');
//   recommendationList.innerHTML = '';

//   recommendations.forEach(product => {
//     const item = document.createElement('li');
//     item.textContent = product.name;
//     recommendationList.appendChild(item);
//   });
// }

