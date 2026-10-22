---
lastUpdated: true
commentabled: true
recommended: true
title: WorkManager 后台任务调度实战
description: 从一次性任务到周期执行
date: 2026-10-22 09:35:00
pageClass: blog-page-class
cover: /covers/android.svg
---

在 Android 应用开发中，经常需要处理一些后台任务，比如数据同步、日志上传、图片压缩等。这些任务可能需要在特定条件下执行，也可能需要定期运行。WorkManager 是 Google 推荐的后台任务解决方案，它能确保任务即使在应用退出或设备重启后依然可靠执行。

## 为什么选择 WorkManager ##

在 WorkManager 出现之前，Android 开发者需要根据不同场景选择不同方案：

- 立即执行的短任务：Thread、Executor
- 需要保证执行的任务：JobScheduler（API 21+）、FirebaseJobDispatcher
- 定时任务：AlarmManager
- 长时运行任务：Foreground Service

这些 API 的使用场景和兼容性各不相同，WorkManager 统一了这些需求，提供了一套简洁且向后兼容的 API（最低支持到 API 14）。

### WorkManager 的优势 ###

- 保证执行：即使应用退出或设备重启，任务依然会执行
- 约束条件：可设置网络状态、充电状态、存储空间等执行条件
- 链式任务：支持任务串行、并行组合
- 周期任务：支持设置最短间隔的周期执行
- 向后兼容：内部会根据设备 API 级别选择最优实现方式

## 添加依赖 ##

```xml
dependencies {
    def work_version = "2.9.0"
    implementation "androidx.work:work-runtime-ktx:$work_version"
}
```

## 一次性任务：数据同步示例 ##

### 定义 Worker ###

```java
class DataSyncWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        return try {
            // 从 InputData 获取参数
            val userId = inputData.getString("user_id") ?: return Result.failure()

            // 执行同步逻辑
            val syncResult = syncUserData(userId)

            if (syncResult.success) {
                // 返回成功，可携带输出数据
                val outputData = workDataOf("sync_time" to System.currentTimeMillis())
                Result.success(outputData)
            } else {
                // 返回失败
                Result.failure()
            }
        } catch (e: Exception) {
            // 返回重试（WorkManager 会自动重试）
            Result.retry()
        }
    }

    private suspend fun syncUserData(userId: String): SyncResult {
        // 模拟网络请求
        delay(2000)
        return SyncResult(success = true)
    }
}

data class SyncResult(val success: Boolean)
```

### 构建和提交任务 ###

```java
// 构建输入数据
val inputData = workDataOf("user_id" to "12345")

// 创建一次性任务请求
val syncRequest = OneTimeWorkRequestBuilder<DataSyncWorker>()
    .setInputData(inputData)
    .build()

// 提交任务
WorkManager.getInstance(context).enqueue(syncRequest)
```

### 观察任务状态 ###

```java
WorkManager.getInstance(context)
    .getWorkInfoByIdLiveData(syncRequest.id)
    .observe(lifecycleOwner) { workInfo ->
        when (workInfo?.state) {
            WorkInfo.State.ENQUEUED -> Log.d("Work", "任务已入队")
            WorkInfo.State.RUNNING -> Log.d("Work", "任务执行中")
            WorkInfo.State.SUCCEEDED -> {
                val syncTime = workInfo.outputData.getLong("sync_time", 0)
                Log.d("Work", "任务成功，同步时间: $syncTime")
            }
            WorkInfo.State.FAILED -> Log.d("Work", "任务失败")
            WorkInfo.State.CANCELLED -> Log.d("Work", "任务取消")
            else -> {}
        }
    }
```

## 添加约束条件 ##

实际场景中，我们希望任务在特定条件下执行，比如只在 WiFi 网络下上传日志：

```java
val constraints = Constraints.Builder()
    .setRequiredNetworkType(NetworkType.UNMETERED) // WiFi 或无流量消耗网络
    .setRequiresBatteryNotLow(true)                 // 电量不低
    .setRequiresStorageNotLow(true)                 // 存储空间充足
    .setRequiresCharging(false)                     // 不要求充电
    .build()

val uploadRequest = OneTimeWorkRequestBuilder<LogUploadWorker>()
    .setConstraints(constraints)
    .build()

WorkManager.getInstance(context).enqueue(uploadRequest)
```

常见约束类型：

- NetworkType：`NOT_REQUIRED`、`CONNECTED`、`UNMETERED`、`NOT_ROAMING`、`METERED`
- 电量：`setRequiresBatteryNotLow(true)`
- 充电：`setRequiresCharging(true)`
- 存储：`setRequiresStorageNotLow(true)`
- 设备空闲（API 23+）：`setRequiresDeviceIdle(true)`

## 周期任务：定时数据清理 ##

周期任务的最短间隔是 15 分钟，这是系统为了省电做的限制：

```java
class DataCleanupWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        return try {
            cleanupOldData()
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }

    private suspend fun cleanupOldData() {
        val database = AppDatabase.getInstance(applicationContext)
        val cutoffTime = System.currentTimeMillis() - 7 * 24 * 60 * 60 * 1000L // 7天前
        database.logDao().deleteOlderThan(cutoffTime)
    }
}
```

创建周期任务：

```java
val cleanupRequest = PeriodicWorkRequestBuilder<DataCleanupWorker>(
    repeatInterval = 1,           // 间隔
    repeatIntervalTimeUnit = TimeUnit.DAYS  // 单位
).build()

WorkManager.getInstance(context).enqueueUniquePeriodicWork(
    "data_cleanup",                          // 唯一名称
    ExistingPeriodicWorkPolicy.KEEP,         // 如果已存在则保持
    cleanupRequest
)
```

`ExistingPeriodicWorkPolicy` 选项：

- KEEP：保持已存在的任务，忽略新请求
- REPLACE：取消并删除已存在的任务，用新任务替换
- UPDATE：保持已存在任务的状态和进度，只更新配置

## 链式任务：图片处理流水线 ##

假设需要：下载图片 → 压缩 → 添加水印 → 上传

```java
// 1. 下载图片
val downloadRequest = OneTimeWorkRequestBuilder<DownloadImageWorker>()
    .setInputData(workDataOf("image_url" to "https://example.com/photo.jpg"))
    .build()

// 2. 压缩图片
val compressRequest = OneTimeWorkRequestBuilder<CompressImageWorker>().build()

// 3. 添加水印
val watermarkRequest = OneTimeWorkRequestBuilder<WatermarkImageWorker>().build()

// 4. 上传图片
val uploadRequest = OneTimeWorkRequestBuilder<UploadImageWorker>()
    .setConstraints(
        Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()
    )
    .build()

// 构建链式任务
WorkManager.getInstance(context)
    .beginWith(downloadRequest)              // 第一步
    .then(compressRequest)                   // 第二步
    .then(watermarkRequest)                  // 第三步
    .then(uploadRequest)                     // 第四步
    .enqueue()
```

### 并行任务 ###

如果有多个独立任务可以并行执行：

```java
val taskA = OneTimeWorkRequestBuilder<WorkerA>().build()
val taskB = OneTimeWorkRequestBuilder<WorkerB>().build()
val taskC = OneTimeWorkRequestBuilder<WorkerC>().build()

val finalTask = OneTimeWorkRequestBuilder<FinalWorker>().build()

// taskA 和 taskB 并行执行，都完成后再执行 finalTask
WorkManager.getInstance(context)
    .beginWith(listOf(taskA, taskB))
    .then(finalTask)
    .enqueue()
```

## 任务重试与退避策略 ##

当任务返回 `Result.retry()` 时，WorkManager 会自动重试，默认使用指数退避策略：

```java
val retryRequest = OneTimeWorkRequestBuilder<RetryableWorker>()
    .setBackoffCriteria(
        BackoffPolicy.EXPONENTIAL,  // 或 LINEAR
        30,                          // 初始延迟
        TimeUnit.SECONDS
    )
    .build()
```

- EXPONENTIAL：指数退避，重试间隔为 30s、60s、120s…
- LINEAR：线性退避，每次增加固定时长

## 唯一任务：避免重复 ##

使用 `enqueueUniqueWork` 可以确保同一名称的任务不会重复执行：

```java
val syncRequest = OneTimeWorkRequestBuilder<DataSyncWorker>().build()

WorkManager.getInstance(context).enqueueUniqueWork(
    "user_data_sync",                   // 唯一名称
    ExistingWorkPolicy.KEEP,            // 策略
    syncRequest
)
```

`ExistingWorkPolicy` 选项：

- REPLACE：取消已存在的任务，用新任务替换
- KEEP：保持已存在的任务，忽略新请求
- APPEND：将新任务追加到已存在任务链的末尾
- APPEND_OR_REPLACE：如果已存在任务链失败或取消，则替换；否则追加

## 取消任务 ##

```java
// 根据 ID 取消
WorkManager.getInstance(context).cancelWorkById(workRequest.id)

// 根据唯一名称取消
WorkManager.getInstance(context).cancelUniqueWork("user_data_sync")

// 根据 Tag 取消
WorkManager.getInstance(context).cancelAllWorkByTag("sync")

// 取消所有任务
WorkManager.getInstance(context).cancelAllWork()
```

## 实战案例：离线数据上报 ##

场景：App 需要在网络可用时上报用户行为日志，要求：

- 只在 WiFi 下上传
- 每小时尝试一次
- 任务失败后自动重试
- 避免重复上传

### 实现 ###

```java
class LogUploadWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val database = AppDatabase.getInstance(applicationContext)
        val pendingLogs = database.logDao().getPendingLogs()

        if (pendingLogs.isEmpty()) {
            return Result.success()
        }

        return try {
            val api = RetrofitClient.create<LogApiService>()
            val response = api.uploadLogs(pendingLogs)

            if (response.isSuccessful) {
                database.logDao().markAsUploaded(pendingLogs.map { it.id })
                Result.success()
            } else {
                Result.retry()
            }
        } catch (e: Exception) {
            Result.retry()
        }
    }
}

// 提交周期任务
fun scheduleLogUpload(context: Context) {
    val constraints = Constraints.Builder()
        .setRequiredNetworkType(NetworkType.UNMETERED)
        .build()

    val uploadRequest = PeriodicWorkRequestBuilder<LogUploadWorker>(
        1, TimeUnit.HOURS
    )
        .setConstraints(constraints)
        .setBackoffCriteria(
            BackoffPolicy.EXPONENTIAL,
            15, TimeUnit.MINUTES
        )
        .build()

    WorkManager.getInstance(context).enqueueUniquePeriodicWork(
        "log_upload",
        ExistingPeriodicWorkPolicy.KEEP,
        uploadRequest
    )
}
```

## 调试技巧 ##

### 查看任务状态 ###

```java
WorkManager.getInstance(context)
    .getWorkInfosByTagLiveData("sync")
    .observe(lifecycleOwner) { workInfoList ->
        workInfoList.forEach { workInfo ->
            Log.d("Work", "ID: ${workInfo.id}, State: ${workInfo.state}")
        }
    }
```

### 启用日志 ###

在 `Application` 类中配置：

```java
class MyApp : Application(), Configuration.Provider {

    override fun getWorkManagerConfiguration() =
        Configuration.Builder()
            .setMinimumLoggingLevel(Log.DEBUG)
            .build()
}
```

记得在 AndroidManifest.xml 中禁用默认初始化：

```xml
<provider
    android:name="androidx.startup.InitializationProvider"
    android:authorities="${applicationId}.androidx-startup"
    tools:node="remove" />
```

## 常见问题 ##

### 任务为什么没有立即执行？ ###

WorkManager 不是实时任务调度器，系统会根据约束条件和设备状态决定执行时机。如果需要立即执行任务，使用 `setExpedited()` 标记为加急任务（API 23+）。

### 周期任务的实际间隔为什么大于设置值？ ###

系统为了省电会批量处理任务，实际执行时间可能晚于预期。如果需要精确定时，考虑使用 AlarmManager + BroadcastReceiver。

### 如何在 Worker 中访问 ViewModel 或 Repository？ ###

通过依赖注入（Hilt）或者自定义 WorkerFactory：

```java
class DaggerWorkerFactory @Inject constructor(
    private val repository: UserRepository
) : WorkerFactory() {

    override fun createWorker(
        appContext: Context,
        workerClassName: String,
        workerParameters: WorkerParameters
    ): ListenableWorker? {
        return when (workerClassName) {
            DataSyncWorker::class.java.name ->
                DataSyncWorker(appContext, workerParameters, repository)
            else -> null
        }
    }
}
```

## 小结 ##

WorkManager 是 Android 后台任务的推荐方案，适用于需要保证执行的场景。关键点：

- 一次性任务用 `OneTimeWorkRequest`，周期任务用 `PeriodicWorkRequest`
- 通过 `Constraints` 设置执行条件
- 链式任务可以串行或并行组合
- 唯一任务避免重复执行
- 根据业务需求选择重试策略和退避算法
- 对于需要立即执行、精确定时或需要前台服务的场景，WorkManager 可能不是最佳选择，需要结合 `Coroutines`、`AlarmManager` 或 Foreground Service 等方案。
