---
prev: 'P-Touch P900 打印机使用 | Markdown'
commentabled: true
recommended: false 
---


# P-Touch P900 打印机使用 #

>

<img class="w-full shadow-2xl max-h-56 rounded aspect-video" src="/images/cmono-20230620145254.jpg" data-fancybox="gallery" />

## 驱动安装 ##

**支持操作系统**

Windows 11, Windows 10 (32-bit), Windows 10 (64-bit), Windows 8.1 (32-bit), Windows 8.1 (64-bit)

> 基于使用情况、Windows 7 (32-bit/64-bit) 可正常运行。

**适用机型**

<p class="text-size-[32px] font-bold font-bebas">PT-P900/P900c, PT-P900W/P900Wc, PT-P950NW</p>

[官方驱动下载](https://support.brother.com/g/b/downloadend.aspx?c=cn&lang=zh&prod=p900cheas&os=10069&dlid=dlfp100982_000&flang=226&type3=347)

## SDK 下载 ##

[b-PAC SDK Ver.3.1](https://support.brother.com/g/s/es/dev/en/bpac/download/index.html?c=eu_ot&lang=zh-cn&navi=offall&comple=on&redirect=on)

![SDK 列表](/images/cmono-20230620090715.png)

> 需根据机器操作系统内容，下载对应位数的SDK安装程序，否则会提示版本不兼容。

<!-- ![](图片地址) -->
<!-- <img src="/images/cmono-20230620090715.png" data-fancybox="gallery"/> -->

**模板编辑器**

[官方下载](https://mksoftcdnhp.yesky.com/648fbc3e/65f2fe1f7889a07d90bdb09f031dac49/uploadsoft/PT_EDITOR_51012_CH.exe)

[示例二维码模板下载](/files/QR.lbx)

> 打印机支持多尺寸打印纸，更换不同尺寸打印纸时，需调整模板内容。
>
> 尺寸不匹配时，打印时会给出相应错误提示。

## 与 Vue 集成 ##

因为考虑到后端程序运行的环境是 CentOS，为保证后续的兼容性，最终选择浏览器直连打印机的方式进行打印。

支持Chrome、Edge、Firefox 浏览器。

本文代码运行在 Edge 浏览器下。

> 如果需断网部署，推荐使用 Firefox 浏览器。

**思路**

用户点击打印按钮，打开预览弹窗(iframe方式)，在iframe页面内调用官方SDK和提取设计的二维码模板进行二维码图片预览和打印。

<div class="grid grid-cols-2 gap-4">
  <div><img class="w-full rounded aspect-square" src="/images/cmono-20230620111603.png" data-fancybox="gallery" /></div>
  <div><img class="w-full rounded aspect-square" src="/images/cmono-20230620111612.png" data-fancybox="gallery" /></div>
</div>

**代码**

```vue

<template>
  <div>
    <a-modal
      v-model:visible="printDialogVisible"
      :destroyOnClose="true"
      :maskClosable="false"
      :z-index="2000"
      :closable="true"
      width="50vw"
      :footer="null"
      :body-style="bodystyle"
      centered
    >
      <iframe
        ref="iframeRef"
        frameborder="no"
        :border="0"
        marginwidth="0"
        marginheight="0"
        scrolling="no"
        allowtransparency="true"
        style="width: 100%; height: 100%"
        :src="printDialogUrl"
      />
    </a-modal>
  </div>
</template>

```


```ts

const appPrintUrl = inject<string>('appPrintUrl')
const iframeRef = shallowRef()
const printDialogUrl = ref('')
const printDialogVisible = ref<boolean>(false)
const doPrint = (applicationForm: ApplicationFormListModel) => {
  printDialogVisible.value = true
  printDialogUrl.value = `${appPrintUrl}`
}

const bodystyle = {
  height: '90vh',
  padding: '50px',
  overflow: 'hidden',
  overflowY: 'disabled'
}

```

```html

<!--
'*************************************************************************
'
'		b-PAC 3.2 Component Sample for Extensions (JS_NamePlate.html)
'
'		(C)Copyright Brother Industries, Ltd. 2019
'
'*************************************************************************/
-->
<!doctype html>
<html lang="en" class="text-gray-900 leading-tight">

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>旅客服务二维码打印页面</title>

	<script type="module">
		import * as bpac from './bpac.js';
		const DATA_FOLDER = "D:\\Templates\\";
		//const DATA_FOLDER = "http://your_server/";
		//------------------------------------------------------------------------------
		//   Function name   :   DoPrint
		//   Description     :   Print, Preview Module
		//------------------------------------------------------------------------------
		window.DoPrint = async function DoPrint(strExport) {
			if (bpac.IsExtensionInstalled() == false) {
				const agent = window.navigator.userAgent.toLowerCase();
				const ischrome = (agent.indexOf('chrome') !== -1) && (agent.indexOf('edge') === -1) && (agent.indexOf('opr') === -1)
				if (ischrome)
					window.open('https://chrome.google.com/webstore/detail/ilpghlfadkjifilabejhhijpfphfcfhb', '_blank');
				return;
			}

			try {
				const theForm = document.getElementById("myForm");
				const nItem = theForm.cmbTemplate.selectedIndex;
				const strPath = DATA_FOLDER + theForm.cmbTemplate.options[nItem].value;
				const objDoc = bpac.IDocument;
				const ret = await objDoc.Open(strPath);
				if (ret == true) {
					const objQrCode = await objDoc.GetObject("objQrCode");
					objQrCode.Text = theForm.applcationTypeCode.value + '|' + theForm.applicationFormId.value;
					// const objName = await objDoc.GetObject("objName");
					// objName.Text = theForm.txtName.value;
					// theForm.txtWidth.value = await objDoc.Width;

					if (strExport == "") {
						objDoc.StartPrint("", 0);
						objDoc.PrintOut(1, 0);
						objDoc.EndPrint();
					}
					else {
						const image = await objDoc.GetImageData(4, 0, 180);
						const img = document.getElementById("previewArea");
						img.src = image;
					}

					objDoc.Close();
				}
			}
			catch (e) {
				console.log(e);
			}
		}   
	</script>
	<script src="./jquery.js" ></script>
	<script>
		function GetQueryString(name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
			var r = window.location.search.substr(1).match(reg); //获取url中"?"符后的字符串并正则匹配
			var context = "";
			if (r != null)
				context = decodeURIComponent(r[2]);
			reg = null;
			r = null;
			return context == null || context == "" || context == "undefined" ? "" : context;
		}

		$(document).ready(function(){
			$('#applcationTypeCode').val(GetQueryString('applcationTypeCode'))
			$('#applicationFormId').val(GetQueryString('applicationFormId'))
			$('#applcationTypeName').val(GetQueryString('applcationTypeName'))
		});
	</script>
	<script src="./tailwindcss.js"></script>
	<script>
	  tailwind.config = {
		theme: {
		  extend: {
			colors: {
			  clifford: '#506BEE',
			}
		  }
		}
	  }
	</script>

</head>

<body class="h-screen rounded-md bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 select-none">
	<form id="myForm" action=""  class="container h-full mx-auto">
		<div class="container h-full mx-auto">
			<div class="flex h-full flex-col justify-between py-8 items-center">
				<div class="flex h-1/2 flex-col justify-around items-center">
					<h2 class="text-4xl text-purple-700 text-opacity-75 text-center font-semibold">阳光服务平台 - 旅客服务二维码打印</h2>
					<div> 模板名称:
						<select class="rounded-sm outline-none" name="cmbTemplate" id="cmbTemplate" style="width: 320px; height: 22px">
							<option value="QR.lbx" class="rounded-sm" selected="selected">条形码</option>
						</select>
					</div>
					
					<div>
						服务类型 :
						<input id="applcationTypeCode" type="hidden" style="width: 320px" value="" />
						<input id="applcationTypeName" placeholder="服务类型" class="outline-none placeholder-gray-500 placeholder-opacity-50 rounded-sm" readonly type="text" style="width: 320px" value="" />
					</div>

					<div>
						流水编号 :
						<input id="applicationFormId" readonly type="text" placeholder="流水编号" class="outline-none placeholder-gray-500 placeholder-opacity-50 rounded-sm" style="width: 320px" value="" />
					</div>

					<div class="grid grid-cols-2 gap-10">
						<input type="button" id="btnPrint" class="bg-indigo-700 font-semibold text-white py-2 px-4 rounded cursor-pointer" onclick="DoPrint('')" value="打印" />
						<input type="button" id="btnPreview" class="bg-indigo-400 font-semibold text-white py-2 px-4 rounded cursor-pointer" onclick="DoPrint('Preview.bmp')" value="预览" />
					</div>
				</div>

				<div class=" text-center">
					<img id='previewArea'></img>
				</div>
			</div>
		</div>
	</form>
</body>
</html>

```

<img class="w-full rounded aspect-radio" src="/images/cmono-20230620144912.png" data-fancybox="gallery" />

