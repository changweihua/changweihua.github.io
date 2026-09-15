---
lastUpdated: true
commentabled: true
recommended: true
title: AlertDialog → DialogFragment
description: AlertDialog → DialogFragment
date: 2026-09-14 09:55:00
pageClass: blog-page-class
cover: /covers/kotlin.svg
---

## 老写法（Java） ##

```java
private void showConfirmDialog() {
    new AlertDialog.Builder(this)
            .setTitle("确认删除")
            .setMessage("确定要删除这条记录吗？")
            .setPositiveButton("确定", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    deleteRecord();
                }
            })
            .setNegativeButton("取消", null)
            .show();
}

private void showLoading() {
    ProgressDialog dialog = new ProgressDialog(this);
    dialog.setMessage("加载中...");
    dialog.setCancelable(false);
    dialog.show();
}
```

### 问题在哪里 ###

两个问题：

- 屏幕旋转或配置变更后 Dialog 直接消失，用户操作到一半就丢了
- `ProgressDialog` 已官方废弃（API 26+），Google 不建议继续使用

## 新写法（Kotlin + DialogFragment） ##

```java
class ConfirmDialogFragment : DialogFragment() {

    companion object {
        const val TAG = "ConfirmDialog"

        fun newInstance(title: String, message: String): ConfirmDialogFragment {
            return ConfirmDialogFragment().apply {
                arguments = Bundle().apply {
                    putString("title", title)
                    putString("message", message)
                }
            }
        }
    }

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        val title = arguments?.getString("title") ?: ""
        val message = arguments?.getString("message") ?: ""

        return AlertDialog.Builder(requireContext())
                .setTitle(title)
                .setMessage(message)
                .setPositiveButton("确定") { _, _ ->
                    // 通过 FragmentResult 回传结果
                }
                .setNegativeButton("取消", null)
                .create()
    }
}
```

调用方：

```java
ConfirmDialogFragment.newInstance("确认删除", "确定要删除这条记录吗？")
        .show(parentFragmentManager, ConfirmDialogFragment.TAG)
```

ProgressDialog 替换为自定义 DialogFragment：

```java
class LoadingDialogFragment : DialogFragment() {

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        return Dialog(requireContext()).apply {
            setContentView(R.layout.dialog_loading)
            setCancelable(false)
        }
    }
}
```

## 一句话注意 ##

`DialogFragment` 由 `FragmentManager` 管理，配置变更后会自动恢复，不会再丢。但如果显示 `DialogFragment` 的 `Activity` 本身被重建了，需要用 `childFragmentManager` 还是 `parentFragmentManager` 要搞清楚——在 Activity 里用 `supportFragmentManager`，在 Fragment 里用 `childFragmentManager`。

结果回传不要再用"持有 Activity 引用"的老套路，用 `setFragmentResultListener` 即可。
