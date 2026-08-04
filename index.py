import webview

def main():
    window = webview.create_window('Hello pywebview', 'https://changweihua.github.io/zh-CN')
    webview.start()

if __name__ == '__main__':
    main()
