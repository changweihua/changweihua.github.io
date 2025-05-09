---
lastUpdated: true
commentabled: true
recommended: false
title: 基于 Flutter 和 Blazor 实现 Web 扫一扫
description: 基于 Flutter 和 Blazor 实现 Web 扫一扫
date: 2023-07
---

# 基于 Flutter 和 Blazor 实现 Web 扫一扫 #

## 背景 ##

之前做个微信扫一扫，想着如果以后没有微信了，业务系统还是需要扫一扫如何解决。

可以完成登录、二次授权等敏感操作。

内网系统，只能使用本厂APP又该如何解决。

## Flutter ##

使用 Flutter 快速构建自有 APP，完成调用设备摄像头实现扫码。

```dart
import 'dart:developer';
import 'dart:io';

import 'package:adaptive_dialog/adaptive_dialog.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_monog/models/session_entity.dart';
import 'package:flutter_monog/routes/app_route.dart';
import 'package:flutter_monog/routes/route_names.dart';
import 'package:flutter_session_manager/flutter_session_manager.dart';
import 'package:icons_plus/icons_plus.dart';
import 'package:loading_animation_widget/loading_animation_widget.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';

class QRScannerPage extends StatefulWidget {
  const QRScannerPage({Key? key}) : super(key: key);

  @override
  State<StatefulWidget> createState() => _QRScannerPageState();
}

class _QRScannerPageState extends State<QRScannerPage> {
  Barcode? result;
  QRViewController? controller;
  final GlobalKey qrKey = GlobalKey(debugLabel: 'QR');
  bool isPaused = false;

  // In order to get hot reload to work we need to pause the camera if the platform
  // is android, or resume the camera if the platform is iOS.
  @override
  void reassemble() {
    super.reassemble();
    if (Platform.isAndroid) {
      controller!.pauseCamera();
    }
    controller!.resumeCamera();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
          // backgroundColor: Colors.transparent,
          ),
      body: Column(
        children: <Widget>[
          Expanded(
            flex: 8,
            child: _buildQrView(context),
          ),
          Expanded(
            flex: 1,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 10),
              child: FittedBox(
                fit: BoxFit.contain,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: <Widget>[
                    if (result != null) ...[
                      Text('Barcode Type: ${describeEnum(result!.format)}'),
                      Text('Data: ${result!.code}')
                    ] else
                      LoadingAnimationWidget.prograssiveDots(
                        color: Theme.of(context).primaryColorLight,
                        size: 10,
                      ),
                  ],
                ),
              ),
            ),
          ),
          Expanded(
            flex: 1,
            child: FittedBox(
              fit: BoxFit.fitWidth,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: <Widget>[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: <Widget>[
                      Container(
                        margin: const EdgeInsets.all(8),
                        child: ElevatedButton(
                          onPressed: () async {
                            await controller?.toggleFlash();
                            setState(() {});
                          },
                          child: FutureBuilder(
                            future: controller?.getFlashStatus(),
                            builder: (context, snapshot) {
                              return '${snapshot.data}' == 'true'
                                  ? const Icon(
                                      EvaIcons.flash_outline,
                                    )
                                  : const Icon(
                                      EvaIcons.flash_off_outline,
                                    );
                            },
                          ),
                        ),
                      ),
                      Container(
                        margin: const EdgeInsets.all(8),
                        child: ElevatedButton(
                          onPressed: () async {
                            await controller?.flipCamera();
                            setState(() {});
                          },
                          child: FutureBuilder(
                            future: controller?.getCameraInfo(),
                            builder: (context, snapshot) {
                              if (snapshot.data != null) {
                                return describeEnum(snapshot.data!) == 'front'
                                    ? const Icon(
                                        LineAwesome.camera_retro_solid,
                                      )
                                    : const Icon(
                                        LineAwesome.camera_solid,
                                      );
                                // return Text(
                                //     'Camera facing ${describeEnum(snapshot.data!)}');
                              } else {
                                return const Icon(
                                  EvaIcons.camera_outline,
                                );
                              }
                            },
                          ),
                        ),
                      ),
                      Container(
                        margin: const EdgeInsets.all(8),
                        child: ElevatedButton(
                          onPressed: isPaused
                              ? null
                              : () async {
                                  await controller?.pauseCamera();
                                  setState(() {
                                    isPaused = true;
                                  });
                                },
                          child: const Icon(EvaIcons.pause_circle_outline),
                        ),
                      ),
                      Container(
                        margin: const EdgeInsets.all(8),
                        child: ElevatedButton(
                          onPressed: !isPaused
                              ? null
                              : () async {
                                  await controller?.resumeCamera();
                                  setState(() {
                                    isPaused = false;
                                  });
                                },
                          child: const Icon(EvaIcons.play_circle_outline),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQrView(BuildContext context) {
    // For this example we check how width or tall the device is and change the scanArea and overlay accordingly.
    var scanArea = (MediaQuery.of(context).size.width < 400 ||
            MediaQuery.of(context).size.height < 400)
        ? 150.0
        : 300.0;
    // To ensure the Scanner view is properly sizes after rotation
    // we need to listen for Flutter SizeChanged notification and update controller
    return QRView(
      key: qrKey,
      onQRViewCreated: _onQRViewCreated,
      overlay: QrScannerOverlayShape(
          borderColor: Colors.red,
          borderRadius: 10,
          borderLength: 30,
          borderWidth: 10,
          cutOutSize: scanArea),
      onPermissionSet: (ctrl, p) => _onPermissionSet(context, ctrl, p),
    );
  }

  bool isInWhiteList(String host) {
    RegExp domainReg = RegExp(r"(?<=://)(www.)?(\w+(\.)?)+");
    String? domainStr = domainReg.stringMatch(host);

    debugPrint(domainStr);

    const hosts = ['192.168.100.7'];

    return hosts.any((element) => element == host);
  }

  void _onQRViewCreated(QRViewController controller) {
    setState(() {
      this.controller = controller;
    });
    controller.scannedDataStream.listen((scanData) {
      setState(() async {
        result = scanData;
        // showTopSnackBar(
        //   context,
        //   const CustomSnackBar.info(
        //     message: "扫码成功",
        //   ),
        // );
        controller.pauseCamera();
        isPaused = true;

        var uri = Uri.parse(result!.code!);

        final scaffoldMessenger = ScaffoldMessenger.of(context);
        final appRoute = AppRoute.of(context);
        scaffoldMessenger.showSnackBar(
          const SnackBar(
            content: Text('扫码成功'),
          ),
        );

        //是否为白名单
        if (isInWhiteList(uri.host)) {
          var user = SessionUser.fromJson(await SessionManager().get('user'));

          final state = uri.queryParameters['state'];
          final redirectUri = uri.queryParameters['redirectUri'];
          final platform = uri.queryParameters['platform'];
          final cellPhone = user.cellPhone;

          appRoute.redirectNamed(
            RouteNames.HOME_QR_SCANNER_RESULT,
            replace: true,
            queryParameters: {
              'url': '${result!.code!}&cellPhone=$cellPhone',
              'state': state.toString(),
              'redirectUri': redirectUri.toString(),
              'platform': platform.toString(),
              'cellPhone': cellPhone,
            },
          );
        } else {
          final dialogResult = await showOkCancelAlertDialog(
            context: context,
            title: '扫码提示',
            message: '当前二维码需要访问不可信网页，是否确认前往！',
            defaultType: OkCancelAlertDefaultType.cancel,
            barrierDismissible: false,
            onWillPop: () => Future.value(false),
            isDestructiveAction: true,
          );
          if (dialogResult == OkCancelResult.ok) {
            appRoute.redirectNamed(
              RouteNames.HOME_QR_SCANNER_RESULT,
              replace: true,
              queryParameters: {
                'url': result!.code!,
                'state': '',
                'redirectUri': '',
                'platform': '',
                'cellPhone': ''
              },
            );
          }
        }
      });
    });
  }

  void _onPermissionSet(BuildContext context, QRViewController ctrl, bool p) {
    log('${DateTime.now().toIso8601String()}_onPermissionSet $p');
    if (!p) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('no Permission'),
        ),
      );
    }
  }

  @override
  void dispose() {
    controller?.dispose();
    super.dispose();
  }
}
```

```dart
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
// #docregion platform_imports
// Import for Android features.
// ignore: depend_on_referenced_packages
import 'package:webview_flutter_android/webview_flutter_android.dart';
// Import for iOS features.
// ignore: depend_on_referenced_packages
import 'package:webview_flutter_wkwebview/webview_flutter_wkwebview.dart';
// #enddocregion platform_imports

class QrScannerResultPage extends StatefulWidget {
  final QrScannerResult result;

  const QrScannerResultPage({super.key, required this.result});

  @override
  State<QrScannerResultPage> createState() => _QrScannerResultPageState();
}

class _QrScannerResultPageState extends State<QrScannerResultPage> {
  late final WebViewController _controller;

  @override
  void initState() {
    super.initState();
// #docregion platform_features
    late final PlatformWebViewControllerCreationParams params;
    if (WebViewPlatform.instance is WebKitWebViewPlatform) {
      params = WebKitWebViewControllerCreationParams(
        allowsInlineMediaPlayback: true,
        mediaTypesRequiringUserAction: const <PlaybackMediaTypes>{},
      );
    } else {
      params = const PlatformWebViewControllerCreationParams();
    }

    final WebViewController controller =
        WebViewController.fromPlatformCreationParams(params);
    // #enddocregion platform_features

    controller
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            debugPrint('WebView is loading (progress : $progress%)');
          },
          onPageStarted: (String url) {
            debugPrint('Page started loading: $url');
          },
          onPageFinished: (String url) {
            debugPrint('Page finished loading: $url');
          },
          onWebResourceError: (WebResourceError error) {
            debugPrint('''
Page resource error:
  code: ${error.errorCode}
  description: ${error.description}
  errorType: ${error.errorType}
  isForMainFrame: ${error.isForMainFrame}
          ''');
          },
          onNavigationRequest: (NavigationRequest request) {
            if (request.url.startsWith('https://www.youtube.com/')) {
              debugPrint('blocking navigation to ${request.url}');
              return NavigationDecision.prevent;
            }
            debugPrint('allowing navigation to ${request.url}');
            return NavigationDecision.navigate;
          },
        ),
      )
      ..addJavaScriptChannel(
        'Toaster',
        onMessageReceived: (JavaScriptMessage message) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(message.message)),
          );
        },
      )
      ..loadRequest(Uri.parse('https://flutter.cn'));

    // #docregion platform_features
    if (controller.platform is AndroidWebViewController) {
      AndroidWebViewController.enableDebugging(true);
      (controller.platform as AndroidWebViewController)
          .setMediaPlaybackRequiresUserGesture(false);
    }
    // #enddocregion platform_features

    _controller = controller;
  }

  //自定义加载中的组件
  Widget _getMoreWidget() {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(10.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: <Widget>[
            Text(
              '加载中...',
              style: TextStyle(fontSize: 16.0),
            ),
            CircularProgressIndicator(
              strokeWidth: 1.0,
            )
          ],
        ),
      ),
    );
  }

  final bool _flag = true;

  // JavascriptChannel _toasterJavascriptChannel(BuildContext context) {
  //   return JavascriptChannel(
  //       name: 'Toaster',
  //       onMessageReceived: (JavascriptMessage message) {
  //         ScaffoldMessenger.of(context).showSnackBar(
  //           SnackBar(content: Text(message.message)),
  //         );
  //         AppRoute.of(context)
  //             .redirectNamed(RouteNames.HOME_INDEX, replace: true);
  //       });
  // }

  // JavascriptChannel _scannerBackJavascriptChannel(BuildContext context) {
  //   return JavascriptChannel(
  //       name: 'scannerBack',
  //       onMessageReceived: (JavascriptMessage message) {
  //         AppRoute.of(context).pop();
  //       });
  // }

  // JavascriptChannel _scannerCloseJavascriptChannel(BuildContext context) {
  //   return JavascriptChannel(
  //       name: 'scannerClose',
  //       onMessageReceived: (JavascriptMessage message) {
  //         AppRoute.of(context)
  //             .redirectNamed(RouteNames.HOME_INDEX, replace: true);
  //       });
  // }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "扫码提示",
        ),
      ),
      body: Center(
        child: Stack(
          // mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            WebViewWidget(controller: _controller),
            // WebView(
            //   // initialUrl: widget.result.url,
            //   zoomEnabled: false,
            //   javascriptMode: JavascriptMode.unrestricted,
            //   onWebViewCreated: (WebViewController webViewController) {
            //     _controller.complete(webViewController);
            //     webViewController.loadUrl(
            //       widget.result.url,
            //       headers: {"Token": "iphone"},
            //     );
            //   },
            //   onProgress: (int progress) {
            //     if (progress / 100 > 0.9999) {
            //       setState(() {
            //         _flag = false;
            //       });
            //     }
            //     // ScaffoldMessenger.of(context).showSnackBar(
            //     //   SnackBar(
            //     //       content:
            //     //           Text('WebView is loading (progress : $progress%)')),
            //     // );
            //   },
            //   javascriptChannels: <JavascriptChannel>{
            //     _toasterJavascriptChannel(context),
            //     _scannerBackJavascriptChannel(context),
            //     _scannerCloseJavascriptChannel(context),
            //   },
            //   navigationDelegate: (NavigationRequest request) {
            //     // if (request.url.startsWith('https://www.youtube.com/')) {
            //     //   print('blocking navigation to $request}');
            //     //   return NavigationDecision.prevent;
            //     // }
            //     ScaffoldMessenger.of(context).showSnackBar(
            //       SnackBar(content: Text('allowing navigation to $request')),
            //     );
            //     return NavigationDecision.navigate;
            //   },
            //   onPageStarted: (String url) {
            //     // ScaffoldMessenger.of(context).showSnackBar(
            //     //   SnackBar(content: Text('Page started loading: $url')),
            //     // );
            //   },
            //   onPageFinished: (String url) {
            //     // ScaffoldMessenger.of(context).showSnackBar(
            //     //   SnackBar(content: Text('Page finished loading: $url')),
            //     // );
            //   },
            //   gestureNavigationEnabled: true,
            //   backgroundColor: const Color(0x00000000),
            // ),
            _flag ? _getMoreWidget() : const SizedBox.shrink(),
          ],
        ),
      ),
    );
  }
}

class QrScannerResult {
  late String url;
  late String redirectUri;
  late String state;
  late String platform;

  QrScannerResult(this.url, this.redirectUri, this.state, this.platform);
}
```

## Blazor ##

承载扫码之后的结果渲染，支持与 APP 互操作。

```c#
@page "/scanner/result"

@layout BlankLayout

@using System.Text.Json
@using System.Text.Json.Serialization
@inject IHttpClientFactory ClientFactory
@inject NavigationManager NavigationManager
@inject IJSRuntime JSRuntime;

<Spin Indicator=antIcon Spinning="@Spinning">

    <ErrorBoundary @ref="errorBoundary">
        <ChildContent>
            <Result Status="@ResultStaus"
                    Title="@ResultTitle"
                    SubTitle="@ResultSubTitle"
                    Extra=ResultExtra>
                @if (ResultStaus == "info")
                {
                    <p>Redirect_Uri = @Redirect_Uri</p>
                    <p>State = @State</p>
                    <p>Platform = @Platform</p>
                }
                @if (ResultStaus == "success")
                {
                    <p>可以关闭当前页面，尽情浏览了。</p>
                }
            </Result>
        </ChildContent>
        <ErrorContent Context="ex">
            <Result Status="error"
                    Title="@ex.Message"
                    SubTitle="@ex.StackTrace">
                <Extra>
                    <Button Type="primary" OnClick="errorBoundary.Recover"> 回退 </Button>
                </Extra>
            </Result>
        </ErrorContent>
    </ErrorBoundary>
</Spin>


@code {

    ErrorBoundary errorBoundary;

    RenderFragment antIcon = @<Icon Type="loading" Theme="outline" Style="font-size: 24px" Spin />;

    //http://192.168.100.7:5007/api/account/qrlogin
    [Parameter]
    [SupplyParameterFromQuery]
    public string Redirect_Uri { get; set; }

    [Parameter]
    [SupplyParameterFromQuery]
    public string State { get; set; }

    [Parameter]
    [SupplyParameterFromQuery]
    public string Platform { get; set; }

    private string ResultStaus { get; set; } = "info";
    private string ResultTitle { get; set; } = "操作提示";
    private string ResultSubTitle { get; set; } = "是否确认本次登录";

    private bool Spinning { get; set; } = false;

    private RenderFragment ResultExtra { get; set; }


    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
        }
        await Task.CompletedTask;
    }

    protected override async Task OnInitializedAsync()
    {
        ResultExtra =
    @<Template>
        <Button Type="primary" OnClick="OnConfirmClick">确认登录</Button>
    </Template>;
        await base.OnInitializedAsync();

        await JSRuntime.InvokeVoidAsync("confirmClick", DotNetObjectReference.Create(this), nameof(OnConfirmClick));
    }

    private async Task OnCloseClick()
    {
        await Task.CompletedTask;
        await this.JSRuntime.InvokeVoidAsync("scanner.close");
    }

    private async Task OnBackClick()
    {
        await Task.CompletedTask;
        await this.JSRuntime.InvokeVoidAsync("scanner.back");
    }

    [JSInvokable]
    private  async Task OnConfirmClick()
    {

        try
        {
            Spinning = true;

            //var request = new HttpRequestMessage(HttpMethod.Post, "http://192.168.100.7:5007/api/account/qrlogin");
            //request.Headers.Add("Accept", "application/vnd.github.v3+json");
            //request.Headers.Add("User-Agent", "HttpClientFactory-Sample");

            var client = ClientFactory.CreateClient();

            //request.Content = new JsonContent()

            var response = await client.PostAsJsonAsync($"{Redirect_Uri}", new
            {
                Platform = Platform,
                CellPhone = "18888888888",
                State = State
            });

            if (response.IsSuccessStatusCode)
            {
                using var responseStream = await response.Content.ReadAsStreamAsync();

                ResultStaus = "success";
                ResultTitle = "登录成功";
                ResultSubTitle = $"已成功授权登录{Platform}";

                ResultExtra =
                    @<Template>
                        <Button Type="primary" OnClick="OnCloseClick">关闭页面</Button>
                    </Template>;
                //NavigationManager.NavigateTo("/test/999");
            }
            else
            {

                ResultStaus = "error";
                ResultTitle = "登录失败";
                ResultSubTitle = "请扫码重试";

                ResultExtra =
                    @<Template>
                        <Button Type="primary" OnClick="OnBackClick">返回扫码</Button>
                    </Template>;
            }
        }
        finally
        {
            Spinning = false;
        }


    }
}
```


## Vue ##

web 业务系统基石。

```vue
<template>
  <div class="qr-container">
    <a-spin :spinning="spinning" :tip="$t('loading')">
      <div class="animated bounceInDown">
        <a-radio-group class="qr-type" v-model:value="qrType">
          <a-radio :value="QrTypes.MiniataD">
            <ant-cloud-outlined
              :style="{
                fontSize: '26px',
                color:
                  qrType === QrTypes.MiniataD
                    ? primaryColor
                    : 'rgba(0, 0, 0, 0.65)'
              }"
            />
          </a-radio>
          <a-radio :value="QrTypes.Wechat">
            <wechat-outlined
              :style="{
                fontSize: '26px',
                color:
                  qrType === QrTypes.Wechat
                    ? primaryColor
                    : 'rgba(0, 0, 0, 0.65)'
              }"
            />
          </a-radio>
          <a-radio :value="QrTypes.QQ">
            <qq-outlined
              :style="{
                fontSize: '26px',
                color:
                  qrType === QrTypes.QQ ? primaryColor : 'rgba(0, 0, 0, 0.65)'
              }"
            />
          </a-radio>

          <!-- <a-radio :value="QrType.MiniataD">
            <VectorIcon
              name="social-miniatad"
              :size="24"
              :color="
                qrType === QrType.MiniataD
                  ? primaryColor
                  : 'rgba(0, 0, 0, 0.65)'
              "
            />
          </a-radio>
          <a-radio :value="QrType.Wechat">
            <VectorIcon
              name="social-wechat"
              :size="24"
              :color="
                qrType === QrType.Wechat ? primaryColor : 'rgba(0, 0, 0, 0.65)'
              "
            />
          </a-radio>
          <a-radio :value="QrType.QQ">
            <VectorIcon
              name="social-qq"
              :size="24"
              :color="
                qrType === QrType.QQ ? primaryColor : 'rgba(0, 0, 0, 0.65)'
              "
            />
          </a-radio> -->
        </a-radio-group>
        <!--
        <VueQr3
          v-if="!spinning"
          :width="baseOptions.width"
          :height="baseOptions.height"
          :data="value"
          :qrOptions="baseOptions.qrOptions"
          :backgroundOptions="baseOptions.backgroundOptions"
          :imageOptions="baseOptions.imageOptions"
          :image="image"
          :dotsOptions="baseOptions.dotsOptions"
          :cornersSquareOptions="baseOptions.cornersSquareOptions"
          :cornersDotOptions="baseOptions.cornersDotOptions"
        /> -->

        <VueQr3
          v-if="qrType === QrTypes.MiniataD"
          :width="baseOptions.width"
          :height="baseOptions.height"
          :data="value"
          :qrOptions="baseOptions.qrOptions"
          :backgroundOptions="baseOptions.backgroundOptions"
          :imageOptions="baseOptions.imageOptions"
          :image="QrTypeLinks.MiniataD.image"
          :dotsOptions="baseOptions.dotsOptions"
          :cornersSquareOptions="baseOptions.cornersSquareOptions"
          :cornersDotOptions="baseOptions.cornersDotOptions"
        />

        <VueQr3
          v-if="qrType === QrTypes.Wechat"
          :width="baseOptions.width"
          :height="baseOptions.height"
          :data="QrTypeLinks.Wechat.url"
          :qrOptions="baseOptions.qrOptions"
          :backgroundOptions="baseOptions.backgroundOptions"
          :imageOptions="baseOptions.imageOptions"
          :image="QrTypeLinks.Wechat.image"
          :dotsOptions="baseOptions.dotsOptions"
          :cornersSquareOptions="baseOptions.cornersSquareOptions"
          :cornersDotOptions="baseOptions.cornersDotOptions"
        />

        <VueQr3
          v-if="qrType === QrTypes.QQ"
          :width="baseOptions.width"
          :height="baseOptions.height"
          :data="QrTypeLinks.QQ.url"
          :qrOptions="baseOptions.qrOptions"
          :backgroundOptions="baseOptions.backgroundOptions"
          :imageOptions="baseOptions.imageOptions"
          :image="QrTypeLinks.QQ.image"
          :dotsOptions="baseOptions.dotsOptions"
          :cornersSquareOptions="baseOptions.cornersSquareOptions"
          :cornersDotOptions="baseOptions.cornersDotOptions"
        />
      </div>
    </a-spin>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineAsyncComponent,
  defineComponent,
  onMounted,
  reactive,
  toRefs
} from 'vue'
import useSignalr from '@/hooks/useSignalr'
import { useAuthStore } from '@/store/auth.store'
import { AppLoginState, useAppStore } from '@/store/app.store'
import { getAccountProfile } from '@/apis/authentication/account.api'
import { defaultHomePath } from '@/router'
import { useRoute, useRouter } from 'vue-router'

type QrType = 'MiniataD' | 'Wechat' | 'QQ'

enum QrTypes {
  MiniataD = 'miniatad',
  Wechat = 'wechat',
  QQ = 'qq'
}

interface IQrCodeInfo {
  name: QrTypes
  icon: string
  image: string
  url: string
}

const QrTypeLinks: Record<QrType, IQrCodeInfo> = {
  MiniataD: {
    name: QrTypes.MiniataD,
    icon: 'social-miniatad',
    image: '/social-miniatad.svg',
    url: 'a'
  },
  Wechat: {
    name: QrTypes.Wechat,
    icon: 'social-wechat',
    image: '/social-wechat.svg',
    url: 'b'
  },
  QQ: { name: QrTypes.QQ, icon: 'social-qq', image: '/social-qq.svg', url: 'c' }
}

export default defineComponent({
  components: {
    VueQr3: defineAsyncComponent(() =>
      Promise.resolve(import('vue3-qr-code-styling'))
    )
  },
  setup() {
    const router = useRouter()
    const route = useRoute()

    const baseOptions = {
      width: 300,
      height: 300,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: 'H'
      },
      backgroundOptions: { color: 'rgba(255,255,255,0)' },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.1,
        margin: 0
      },
      dotsOptions: {
        type: 'extra-rounded',
        color: process.env.VUE_APP_PRIMARY_COLOR,
        gradient: {
          type: 'linear',
          rotation: 0,
          colorStops: [
            { offset: 0, color: process.env.VUE_APP_PRIMARY_COLOR },
            { offset: 1, color: process.env.VUE_APP_PRIMARY_COLOR }
          ]
        }
      },
      cornersSquareOptions: {
        type: 'extra-rounded',
        color: process.env.VUE_APP_PRIMARY_COLOR
      },
      cornersDotOptions: {
        type: undefined,
        color: process.env.VUE_APP_PRIMARY_COLOR
      }
    }

    const data: {
      value: string
      qrType: QrTypes
      image: string
      size: number
      spinning: boolean
      primaryColor: string
    } = reactive({
      value: QrTypeLinks.MiniataD.url,
      qrType: QrTypes.MiniataD,
      image: QrTypeLinks.MiniataD.image,
      size: 220,
      spinning: true,
      primaryColor: process.env.VUE_APP_PRIMARY_COLOR
    })

    const logo = computed(() => {
      let image = QrTypeLinks.MiniataD.image
      switch (data.qrType) {
        case QrTypes.Wechat:
          image = QrTypeLinks.Wechat.image
          break
        case QrTypes.QQ:
          image = QrTypeLinks.QQ.image
          break
        case QrTypes.MiniataD:
        default:
          break
      }
      return image
    })

    const methods = {
      handleConfirmed: (res: any) => {
        console.log(res)
        const token = {
          accessToken: res.accessToken,
          expiredAt: res.expiredAt,
          refreshToken: res.refreshToken,
          refreshExpiredAt: res.refreshExpiredAt
        }
        useAuthStore().setToken(token)
        useAppStore().setLoginState(AppLoginState.LOGINED)

        getAccountProfile().then((json) => {
          useAppStore().setAccountInfo({ ...json.profile })

          let path = defaultHomePath

          const { redirect } = route.query
          if (redirect && redirect !== '') {
            path = redirect + ''
          }

          router.push({
            path: path
          })
        })
      }
    }

    const { connection } = useSignalr(
      'http://localhost:5006/hub/qrcode',
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (connection) => {},
      false
    )

    onMounted(() => {
      connection.on('OnNotify', (result: { event: string; message: any }) => {
        console.log(result)
        switch (result.event) {
          case 'Connected': {
            const url = `${process.env.VUE_APP_MONOG_URI}?state=${
              result.message
            }&platform=${
              process.env.VUE_APP_PLATFORM
            }&redirect_uri=${encodeURIComponent(
              process.env.VUE_APP_REDIRECT_URI
            )}`
            data.value = `${url}`
            data.spinning = false
            break
          }
          case 'Confirmed':
            methods.handleConfirmed(result.message)
            break
        }
      })
    })

    return {
      ...toRefs(data),
      ...methods,
      QrTypes,
      logo,
      baseOptions,
      QrTypeLinks
    }
  }
})
</script>

<style lang="less" scoped>
.qr-container {
  height: 100%;

  :deep(.ant-spin-nested-loading) {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .qr-type {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 0 0 0;

    :deep(.ant-radio) {
      display: none;
    }
  }
}
</style>
```

## SignalR ##

双工通信。

当然其实本质上，只需实现服务器到客户端的单向通信即可。EventSource 也不失为一种优雅的解决方案。
