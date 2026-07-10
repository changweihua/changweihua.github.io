---
lastUpdated: true
commentabled: true
recommended: true
title: 如何在axios或者fetch里实现文件下载
description: 如何在axios或者fetch里实现文件下载
date: 2025-09-28 15:00:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

## 前言 ##

通常我们遇到的文件下载，后端都会以文件流的形式将文件传给我们，我们如何在axios或者fetch中实现文件下载的功能呢？

## 场景 ##

后端返回文件流，文件名在header上，前端需要将其获取下来并且实现文件下载功能。

我们可以知道后端是以文件流的形式传给我们的，也可以通过 `headers` 上面的 `Content-Disposition` 上获取文件名。

## 区别 ##

### fetch实现 ###

#### 简单实现 ####

```ts
fetch('your-file-url')
  .then((response) => response.blob()) // 将响应体转为Blob对象
  .then((blob) => {
    // 文件名存储在'Content-Disposition'头中
    const filename = response.headers.get('content-disposition').split('filename=')[1].replace(/"/g, '');
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename); // 使用从header中获取的文件名
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  })
  .catch((error) => console.error('Error:', error));
```

#### 优雅的封装实现 ####

```javascript
// get请求下载文件封装
  getFile(url: string, params: string) {
    const queryString = new URLSearchParams(params).toString();
    const requestUrl = queryString ? `${url}?${queryString}` : url;
    let options;

    const requestOptions = {
      ...options,
      method: 'GET',
      headers: {
        ...(options?.headers || {}),
        'Content-Type': 'application/json',
      },
    };

    return fetch(requestUrl, requestOptions)
      .then(authBeforeFormate)
      .then((response) => {
        const { headers } = response;
        headers.forEach((value, key) => {
          headers[key] = value;
        });
        const fileStream = response.blob();
        // 处理 headers
        if (headers?.['content-disposition']?.indexOf('filename=') > -1) {
          const filename = decodeURIComponent(
            headers?.['content-disposition']
              ?.replace('attachment;', '')
              ?.replace('filename=', '')
          );
          const contentType = headers?.['content-type'];
          return {
            success: !!filename,
            fileStream,
            filename,
            contentType,
          };
        }
      })
      .then((data) => {
        // 处理data
        return data;
      })
      .catch((err) => {
       // 处理异常
        return err;
      });
  }
```

#### 如何调用 ####

```javascript
// 请求
downloadFile(params?: any) {
  return http.getRequest(`your-file-url`, params);
},

const getFile = async () => {
    const res = await dowloadFile()
    if (res) {
      const fileStream = res?.fileStream;
      const fileName = res?.filename?.split('.');
      const newFileName = fileName[0] + `(${state.level})` + '.' + fileName[1];
      fileStream.then((resData) => {
      const url = window.URL.createObjectURL(resData);
      const link = document.createElement('a');
      link.href = url;
      link.download = newFileName
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    });
      message.success('下载成功');
   } else {
      message.error('下载失败');
   }    
}
```

### axios实现 ###

#### 简单实现 ####

```javascript
axios({
  method: 'get',
  url: 'your-file-url',
  responseType: 'blob',
}).then((response) => {
  // 文件名存储在'Content-Disposition'头中
  const filename = response.headers['content-disposition'].split('filename=')[1].replace(/"/g, '');
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename); // 使用从header中获取的文件名
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
});
```

#### 优雅的封装实现 ####

```javascript
// 拦截器，统一处理未登录或者没有权限的情况
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data, headers } = response;
    if (headers?.['content-disposition']?.indexOf('filename=') > -1) {
      const filename = decodeURIComponent(
        headers
          ?.['content-disposition']
          ?.replace('attachment;', '')
          ?.replace('filename=', '')
      );
      const contentType = headers?.['content-type'];
      return {
        success: !!filename,
        data: {
          content: data,
          filename,
          contentType
        },
      };
    }

    return data;
 }
 
export const getForm = (url: string, param?: any) => {
  return new Promise((resolve) => {
    instance.get(url, { params: param , responseType: 'blob'}) //这里一定要用responseType: 'blob'，也是和fetch的一个区别
      .then(res => resolve(res))
      .catch(err => resolve(err))
  });
};
```

#### 如何调用 ####

```javascript
//请求
downloadFile(param){
    return Http.getForm(`your_request_url`, param)
}

const downloadFile = async () => {
    const param = {
        ....
    }
    const res = await downloadAuditLogs(param);
    const fileContent = res.data.content;
    const fileName = res.data.filename;
    const contentType = res.data.contentType;
    const blob = new Blob([fileContent], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a')
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}
```

## 前端文件下载常用的几种方式 ##

### axios使用json下载文件流 ###

- 定义：可以传递json。不适用于已有封装全局请求的axios
- 使用注意点：
  - 声明 `responseType：'blob'`.
  - 使用 `Blob` 接收
  - 动态文件名 `content-disposition` 接收。雷点：某些浏览器不会暴露该头部字段，需要服务器允许跨域访问该头部

```js
axios({
      headers: {
        // 'hero-platform-code': type
      },
      url: 'https://localhost/download/test',
      method: 'post',
      data: {
        "headers": [
            "姓名",
            "年龄",
            "城市"
        ],
        "data": [
            {
                "姓名": "张三",
                "年龄": 25,
                "城市": "北京"
            },
        ],
        "fileName": "99"
    },
      responseType: 'blob',
      withCredentials: true
    }).then(response => {
      console.log(response, 'response')
      // 从响应头中获取文件名
      const disposition = response.headers['content-disposition']
      let filename = 'aa.xlsx' // 默认文件名
      if (disposition && disposition.indexOf('filename=') !== -1) {
        // 从Content-Disposition中提取文件名
        filename = disposition.split('filename=')[1].replace(/"/g, '')
        // 解码文件名(处理中文)
        filename = decodeURIComponent(filename)
      }
      const blob = new Blob([response.data], { type: response.headers['content-type'] })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
    })
```

### axios使用formData下载文件流 ###

- 定义：类似于 `form` 提交下载
- 使用注意点：
  - 声明 `Content-Type：'application/x-www-form-urlencoded'`.
  - 创建 `FormData` 传递参数
  - 动态文件名 `content-disposition` 接收。参考json下载

```js
var formData = new FormData();
formData.append("key","value")
axios({
      headers:{
      'Content-Type': 'application/x-www-form-urlencoded',
      },
      url: 'http://localhost/api/download' ,
      method: 'post',
      data: formData,
      responseType: 'blob',
      withCredentials: true
    }).then(response =>{
      console.log(response,'response')
      const blob = new Blob([response.data], { type: response.headers['content-type'] })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = '游戏管理.xlsx'
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      })
```

### form方式下载文件流 ###

- 定义：`form` 提交下载
- 使用注意点：
  - 声明 `Content-Type：'application/x-www-form-urlencoded'`.
  - 创建 `FormData` 传递参数
  - 动态文件名 `content-disposition` 接收。参考json下载

```js
const paraData = { id: 1212, name: '测试名' }
  console.log(paraData)
  var form = document.createElement('form')
  form.style.display = 'none'
  form.action = gateUrl + '/api/dictData/downloadDictDataList'
  form.method = 'post'
  document.body.appendChild(form)
  for (var key in paraData) {
    if (paraData[key]) {
      var input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = paraData[key]
      form.appendChild(input)
    }
  }

  form.submit()
  form.remove()
```
