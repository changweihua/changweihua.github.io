---
lastUpdated: true
commentabled: true
recommended: true
title: Android KTX 实战
description: Java 转 Kotlin 最全清单，照着改就完事了
date: 2026-08-26 11:35:00
pageClass: blog-page-class
cover: /covers/kotlin.svg
---

Android KTX 是 Kotlin 对 Android SDK 的扩展，让 Android API 更加简洁。这篇文章帮你把 Java 写法一键转换为 Kotlin 写法。

## View 相关操作 ##

### View 初始化与配置 ###

```java
// Java 写法
TextView tvTitle = findViewById(R.id.tv_title);
tvTitle.setText("标题");
tvTitle.setTextColor(Color.RED);
tvTitle.setTextSize(16f);
tvTitle.setOnClickListener(new View.OnClickListener() {
    @Override
    public void onClick(View v) {
        // 处理点击
    }
});

// Kotlin + KTX 写法
findViewById<TextView>(R.id.tv_title).apply {
    text = "标题"
    setTextColor(Color.RED)
    textSize = 16f
    setOnClickListener {
        // 处理点击
    }
}
```

### View 显示隐藏 ###

```java
// Java 写法
view.setVisibility(View.VISIBLE);
view.setVisibility(View.GONE);
view.setVisibility(View.INVISIBLE);

// Kotlin + KTX 写法
view.isVisible = true
view.isGone = true
view.isInvisible = true
```

### View 延迟操作 ###

```java
// Java 写法
view.postDelayed(new Runnable() {
    @Override
    public void run() {
        // 延迟执行
    }
}, 1000);

// Kotlin + KTX 写法
view.postDelayed(1000) {
    // 延迟执行
}
```

## Activity 和 Fragment ##

### Fragment 创建 ViewModel ###

```java
// Java 写法
private MyViewModel viewModel;

@Override
public void onCreate(@Nullable Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    viewModel = new ViewModelProvider(this).get(MyViewModel.class);
}

// Kotlin + KTX 写法
class MyFragment : Fragment() {
    private val viewModel: MyViewModel by viewModels()
}
```

### Fragment 间共享 ViewModel ###

```java
// Java 写法
viewModel = new ViewModelProvider(requireActivity()).get(MyViewModel.class);

// Kotlin + KTX 写法
private val shareViewModel: MyViewModel by activityViewModels()
```

## SharedPreferences ##

```java
// Java 写法
SharedPreferences sp = getSharedPreferences("app_sp", MODE_PRIVATE);
SharedPreferences.Editor editor = sp.edit();
editor.putString("token", "xxx");
editor.putBoolean("is_login", true);
editor.apply();

// Kotlin + KTX 写法
val sp = getSharedPreferences("app_sp", MODE_PRIVATE)
sp.edit {
    putString("token", "xxx")
    putBoolean("is_login", true)
}
```

## Bundle 创建 ##

```java
// Java 写法
Bundle bundle = new Bundle();
bundle.putString("key1", "value1");
bundle.putInt("key2", 100);

// Kotlin + KTX 写法
val bundle = bundleOf(
    "key1" to "value1",
    "key2" to 100
)
```

## Intent 和 Activity 跳转 ##

```java
// Java 写法
Intent intent = new Intent(this, SecondActivity.class);
intent.putExtra("name", "张三");
intent.putExtra("age", 20);
startActivity(intent);

// Kotlin + KTX 写法
val intent = intentOf<SecondActivity>(
    "name" to "张三",
    "age" to 20
)
startActivity(intent)

// 或者直接
startActivity<SecondActivity>(
    "name" to "张三",
    "age" to 20
)
```

## LiveData 观察 ##

```java
// Java 写法
viewModel.getUserData().observe(this, new Observer<User>() {
    @Override
    public void onChanged(User user) {
        updateUI(user);
    }
});

// Kotlin + KTX 写法
viewModel.userData.observe(this) { user ->
    updateUI(user)
}

// Fragment 中注意用 viewLifecycleOwner
viewModel.userData.observe(viewLifecycleOwner) { user ->
    updateUI(user)
}
```

## 协程与线程切换 ##

```java
// Java 写法
new Thread(new Runnable() {
    @Override
    public void run() {
        String result = fetchDataFromNet();
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                tvTitle.setText(result);
            }
        });
    }
}).start();

// Kotlin + KTX 写法
lifecycleScope.launch {
    val result = withContext(Dispatchers.IO) {
        fetchDataFromNet()
    }
    tvTitle.text = result
}
```

## 字符串和 Uri ##

```java
// String 转 Uri
val uri = "https://example.com".toUri()

// Uri 转 String
val urlString = uri.toString()
```

## IO 流自动关闭 ##

```java
// Java 写法
InputStream is = null;
try {
    is = getAssets().open("test.txt");
    // 读取逻辑
} finally {
    if (is != null) {
        try {
            is.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

// Kotlin + KTX 写法
val is = assets.open("test.txt")
is.use {
    // 读取逻辑，自动关闭
}
```

## 完整示例 ##

### Activity 标准模板 ###

```kotlin
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 1. 初始化 binding
        binding = ActivityMainBinding.inflate(layoutInflater).also {
            setContentView(it.root)
        }

        // 2. 观察数据
        viewModel.uiState.observe(this) { state ->
            when (state) {
                is UiState.Loading -> showLoading()
                is UiState.Success -> showData(state.data)
                is UiState.Error -> showError(state.message)
            }
        }

        // 3. 配置点击事件
        binding.btnSubmit.apply {
            isEnabled = true
            setOnClickListener {
                submitData()
            }
        }
    }

    private fun submitData() {
        lifecycleScope.launch {
            viewModel.submit()
        }
    }
}
```

### Fragment 标准模板 ###

```kotlin
class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    private val viewModel: HomeViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // 注意：用 viewLifecycleOwner，不是 this
        viewModel.uiState.observe(viewLifecycleOwner) { state ->
            when (state) {
                is UiState.Loading -> binding.progressBar.isVisible = true
                is UiState.Success -> {
                    binding.progressBar.isVisible = false
                    binding.tvContent.text = state.data
                }
                is UiState.Error -> {
                    binding.progressBar.isVisible = false
                    toast(state.message)
                }
            }
        }

        binding.btnClick.setOnClickListener {
            viewModel.loadData()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null  // 防止内存泄漏
    }
}
```

## 依赖引入 ##

```groovy
// build.gradle
implementation 'androidx.core:core-ktx:1.12.0'
implementation 'androidx.fragment:fragment-ktx:1.6.2'
implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.7.0'
implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0'
implementation 'androidx.lifecycle:lifecycle-livedata-ktx:2.7.0'
```

## 总结 ##

| 场景 | Java | Kotlin KTX |
| :--- | :--- | :--- |
| View 配置 | `setText`/`getText` | `text = "..."` |
| View 显示隐藏 | `setVisibility` | `isVisible = true` |
| Fragment ViewModel | `ViewModelProvider` | `by viewModels()` |
| SharedPreferences | `edit` + `apply` | `edit { }` |
| 点击事件 | 匿名内部类 | Lambda |
| 线程切换 | `Handler`/`Thread` | `lifecycleScope.launch` |
| IO 流 | `try-finally` | `use { }` |
