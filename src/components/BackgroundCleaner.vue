<script setup lang="ts">
import { ref } from 'vue'
import { UploadOutlined } from '@ant-design/icons-vue';
import { removeBackground, Config } from "@imgly/background-removal"

const fileList = ref([])
const beforeSrc = ref('')
const afterSrc = ref('')

const headers = {
  authorization: 'authorization-text',
}
// 模型文件访问路径
const public_path = `${import.meta.env.VITE_APP_HOST}/background-removal/dist/`
let config: Config = {
  publicPath: public_path
};

const customRequest = (info: any) => {
  fileToBase64(info.file)
  removeBackground(info.file, config).then(res => {
    console.log(res)
    blobToDataURI(res, (result: any) => {
      afterSrc.value = result
    })
  })
}

// file 转base 64
function fileToBase64(file: any) {
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    beforeSrc.value = reader.result as string;
  }
  reader.onerror = function (err) {
    console.log(err);
  }
}

// blob 转 base64
function blobToDataURI(blob: any, callback: any) {
  var reader = new FileReader();
  reader.readAsDataURL(blob);
  reader.onload = function (e) {
    callback(e.target!.result);
  };
}


</script>

<template>
  <div>
    <a-upload v-model:file-list="fileList" name="file" :customRequest="customRequest" :headers="headers">
      <a-button>
        <upload-outlined></upload-outlined>
        上传图片
      </a-button>
    </a-upload>
  </div>
  <div style="display: flex; justify-content: center;">
    <img style='width: 400px' :src="beforeSrc">
    <img style='width: 400px' :src="afterSrc">
  </div>
</template>
