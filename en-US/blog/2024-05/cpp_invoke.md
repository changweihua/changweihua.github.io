---
lastUpdated: true
commentabled: true
recommended: true
title: C# 调用C/C++ DLL，传入返回结构体以及指针数组
description: C# 调用C/C++ DLL，传入返回结构体以及指针数组(指针指向自定义的结构体)
date: 2024-05-31 09:18:00
pageClass: blog-page-class
---

# C# 调用C/C++ DLL，传入返回结构体以及指针数组 #

## 1.定义结构体 ##

### C++代码 ###

```c++
struct DetectInfo {
	int x; //!< x coordinate of the top-left corner
	int y; //!< y coordinate of the top-left corner
	int width; //!< width of the rectangle
	int height; //!< height of the rectangle;
	float conf;
	int class_id;
};
```

### C# 代码 ###


```C#
 [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
 public struct DetectInfo
 {
     // [MarshalAs(UnmanagedType.LPStr)]
     public int x; //!< x coordinate of the top-left corner
     public int y;  //!< y coordinate of the top-left corner
     public int width; //!< width of the rectangle
     public int height; //!< height of the rectangle;
     public float conf; // confidence score 
     public int class_id; // class id
 }
```

## 2.返回结构体 ##

### C++代码 ###

**头文件声明**

```C++
extern "C" APPEARANCEDETECTALG_EXPORTS struct DetectInfo simpleStruct();
```

**函数实现**

```C++
ALG_EXPORTS struct DetectInfo simpleStruct() {
	DetectInfo dInfo;
	dInfo.x = 1;
	dInfo.y = 2;
	dInfo.width = 3;
	dInfo.height = 4;
	dInfo.conf = 0.56;
	dInfo.class_id = 7;

	return dInfo;
}
```

### C# 代码 ###

```C#
[DllImport("APPEARANCEDETECTALGDLL.dll", CallingConvention = CallingConvention.Cdecl)]
extern static DetectInfo simpleStruct();

 // 返回 结构体
DetectInfo ddInfo = simpleStruct();
Console.WriteLine("{0}, {1}, {2}, {3}, {4}, {5}", ddInfo.x, ddInfo.y, ddInfo.width, ddInfo.height, ddInfo.conf, ddInfo.class_id);

Console.ReadLine();
```

## 3.传入返回指针数组 ##

### C++代码 ###

**头文件声明**

```C++
extern "C" ALG_EXPORTS int simpleStructList(int num, DetectInfo* dInfoList);
```

**函数实现**

```C++
ALG_EXPORTS int simpleStructList(int num, DetectInfo* dInfoList) {
	DetectInfo dInfo;
	for (int i = 0; i < 10; ++i)
	{
		dInfo.x = i;
		dInfo.y = i;
		dInfo.width = i;
		dInfo.height = i;
		dInfo.conf = 0.56 / i;
		dInfo.class_id = i;
		*(dInfoList + i) = dInfo;
	}
	return 0;
}
```

### C# 代码 ###

```C#
[DllImport("ALGDLL.dll", CallingConvention = CallingConvention.Cdecl)]
extern static int simpleStructList(int num, [In, Out] DetectInfo[] dInfoList);


// 传入和返回 结构体
const int nCount = 100;
DetectInfo[] dInfoList = new DetectInfo[nCount];

int rst = simpleStructList(nCount, dInfoList);

for (int i = 0; i < rst; i++)
{
    Console.WriteLine("{0}, {1}, {2}, {3}, {4}, {5}", dInfoList[i].x, dInfoList[i].y, dInfoList[i].width, dInfoList[i].height, 
        dInfoList[i].conf, dInfoList[i].class_id);
}
Console.ReadLine();
```
