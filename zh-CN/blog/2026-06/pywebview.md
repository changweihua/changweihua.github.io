---
lastUpdated: true
commentabled: true
recommended: true
title: Pywebview
description: Web技术构建桌面应用的最佳选择
date: 2026-06-09 11:35:00 
pageClass: blog-page-class
cover: /covers/python.svg
---

今天我们来聊聊一个非常轻量且强大的Python库——pywebview。如果你曾经为开发一个简单的桌面应用而纠结于Electron的笨重、PyQt的复杂，或是Tkinter的界面简陋，那pywebview或许正是你一直在找的解决方案。

## 一、介绍 ###

pywebview 是一个轻量级的跨平台Python库，它允许你在一个原生窗口中嵌入Web技术（HTML/CSS/JS）来构建GUI界面。本质上，它就是一个迷你浏览器内核，让你可以用写网页的方式写桌面应用。

与其他桌面框架对比：

- Electron：功能强大，但打包体积大、内存占用高。

- PyQt/Tkinter：原生控件，但界面现代化程度低、开发效率不高。

- pywebview：轻量、跨平台、易上手，适合快速开发中小型桌面应用，尤其是已有Web前端的项目。

## 二、安装 ##

### 安装全量版本 ###

```bash
pip install pywebview
```

### 安装指定环境版本 ###

如果你希望控制依赖版本，可以使用：

```bash
pip install pywebview[qt]  # 使用Qt后端
pip install pywebview[cef] # 使用CEF后端
```

## 三、使用入门 ##

### 基本使用 ###

来看一个最简单的例子：

```python
import webview

def main():
    window = webview.create_window('Hello pywebview', 'https://pywebview.flowrl.com')
    webview.start()

if __name__ == '__main__':
    main()
```

函数说明：

- `create_window()`：创建窗口，参数包括标题和初始URL或本地HTML路径。
- `start()`：启动GUI事件循环。

### 应用程序架构 ###

#### 纯网络服务架构 ####

就如上文的基本使用，前端只需暴露应用服务器，后端调用即可

```python
import webview

if __name__ == '__main__':
    webview.create_window("My App", "http://localhost:3000")
    webview.start(http_server=True, port=3000)
```

> 官网有完整的示例 基于 Flask 的应用程序 供参考学习。

#### 无服务器架构 ####

完全不使用网络服务器，通过 `webview.create_window(...html='')` 或者 `window.load_html` 加载 HTML。

```python
import webview

html='''
<!DOCTYPE html>
<html>
<body>
    <h1>Hello from HTML!</h1>
</body>
</html>
'''

webview.create_window("Local App", html=html)
webview.start()
```

> 根据官网说明：这种方法有一些限制，因为在加载的页面上下文中没有文件系统。图片和其他资源只能通过 Base64 内联加载。

### JS与Python交互 ###

pywebview 支持在JS中调用Python函数，也支持在Python中调用JS方法。

下述是JS中调用Python函数的代码示例：

*Python端*：

```python
import webview

class Api:
    def get_message(self):
        return "Hello from Python!"

if __name__ == '__main__':
    api = Api()
    window = webview.create_window('JS 接口 示例', 'index.html', js_api=api)
    webview.start()
```

*JS端（在HTML中）*：

```html
<!DOCTYPE html>
<html>
<body>
    <button onClick="greet()">打招呼</button>
</body>
<script>
function greet() {
    pywebview.api.get_message().then(function(message) {
        alert(message);
    });
}
</script>
</html>
```

> ✅ 推荐将Python逻辑封装成API，JS中异步调用，保持前后端分离。

## 四、应用打包 ##

使用 `pyinstaller` 打包你的应用：

```bash
pyinstaller --onefile --windowed your_script.py
```

打包后会生成一个独立的可执行文件，可在没有Python环境的机器上运行。

> 有关 pyinstaller 的介绍，详情请查阅唐叔的这篇文章：告别Python环境依赖！用PyInstaller打包EXE的终极指南_python打包成exe-CSDN博客

## 五、常见使用场景 ##

### 文件操作 ###

#### 文件下载 ####

你可以使用Python控制文件下载路径，或由前端触发下载。

```python
import webview

if __name__ == '__main__':
    # 创建一个标准的 webview 窗口
    webview.settings['ALLOW_DOWNLOADS'] = True
    window = webview.create_window('Simple browser', 'https://pywebview.idepy.com/download')
    webview.start()
```

#### 文件拖放 ####

下述是常见的文件拖放效果，实际上是通过拖放后获取到文件路径，进而通过文件路径调用相关API再进一步操作文件。

```python
import webview
from webview.dom import DOMEventHandler

def on_drag(e):
    pass

def on_drop(e):
    files = e['dataTransfer']['files']
    if len(files) == 0:
        return

    print(f'事件类型: {e["type"]}。被拖入的文件：')

    for file in files:
        print(file.get('pywebviewFullPath'))

def bind(window):
    window.dom.document.events.dragenter += DOMEventHandler(on_drag, True, True)
    window.dom.document.events.dragstart += DOMEventHandler(on_drag, True, True)
    window.dom.document.events.dragover += DOMEventHandler(on_drag, True, True, debounce=500)
    window.dom.document.events.drop += DOMEventHandler(on_drop, True, True)

if __name__ == '__main__':
    window = webview.create_window(
        '拖放示例', html='''
            <html>
                <body style="height: 100vh;"->
                    <h1>将文件拖放到此处</h1>
                </body>
            </html>
        '''
    )
    webview.start(bind, window)
```

### 自定义菜单 ###

pywebview 支持自定义系统菜单：

```python
import webview
import webview.menu as wm

def change_active_window_content():
    active_window = webview.active_window()
    if active_window:
        active_window.load_html('<h1>You changed this window!</h1>')

def click_me():
    active_window = webview.active_window()
    if active_window:
        active_window.load_html('<h1>You clicked me!</h1>')

def do_nothing():
    pass

def say_this_is_window_2():
    active_window = webview.active_window()
    if active_window:
        active_window.load_html('<h1>This is window 2</h2>')

def open_file_dialog():
    active_window = webview.active_window()
    active_window.create_file_dialog(webview.SAVE_DIALOG, directory='/', save_filename='test.file')

if __name__ == '__main__':
    window_1 = webview.create_window(
        'Application Menu Example', 'https://pywebview.idepy.com/hello'
    )
    window_2 = webview.create_window(
        'Another Window', html='<h1>Another window to test application menu</h1>'
    )

    menu_items = [
        wm.Menu(
            'Test Menu',
            [
                wm.MenuAction('Change Active Window Content', change_active_window_content),
                wm.MenuSeparator(),
                wm.Menu(
                    'Random',
                    [
                        wm.MenuAction('Click Me', click_me),
                        wm.MenuAction('File Dialog', open_file_dialog),
                    ],
                ),
            ],
        ),
        wm.Menu('Nothing Here', [wm.MenuAction('This will do nothing', do_nothing)]),
    ]

    webview.start(menu=menu_items)
```

> 💡 你也可以完全用HTML+CSS在前端构建菜单，更灵活美观。

### 图标设置 ###

使用 `webview.start(icon=<file_path>)` 设置窗口图标。

```python
import webview

if __name__ == '__main__':
    window = webview.create_window('Set window icon', 'https://pywebview.idepy.com/hello')
    webview.start(icon='../logo/logo.png')
```

此方法仅在 GTK 和 QT 平台上受支持。其他平台的图标将在冻结过程中设置。

## 六、总结 ##

pywebview 是一个非常灵活且强大的工具，尤其适合：

- 已有Web前端，想快速封装成桌面应用；
- 希望用HTML/CSS/JS构建现代化界面；
- 对应用体积和内存占用有要求的场景；
- 需要跨平台运行（Windows/macOS/Linux）。

它的学习曲线平缓，社区活跃，文档完善，是Python开发者进军桌面应用开发的绝佳选择。

如果你正在寻找一个轻量、高效、易扩展的桌面开发方案，不妨试试 pywebview，相信它会给你带来惊喜。

技术选型没有绝对的好坏，只有适合与否。pywebview 在我多个中小项目中表现出色，尤其是在快速原型和内部工具开发中。希望这篇指南能帮你少走弯路，早日打造出属于自己的桌面应用！

如果有新的想法，欢迎在评论区留言，我们一起交流进步！🎉
