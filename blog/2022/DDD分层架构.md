# DDD分层架构 #

---

- 架构是高层的设计，若设计有误和理解有误，必将在实现时带来问题。
- 结构是最稳定的，不存在具体技术的依赖。

## 三层模型与DDD对比 ##

![Docker Container](/images/4933701-a765829a0d2b784b.png)

## 设计方案1 ##

![Docker Container](/images/4933701-f81ebbfaafda0c6e.png)

### 搭建解决方案 ###

- DDD.UI 用户接口层 ASP.NET MVC空项目
- DDD.Application 应用层类库项目
- DDD.Domain 领域层类库项目
- DDD.Infrastructure 基础设施层类库项目
- DDD.Repository 仓储类库项目
- DDD分层架构

![Docker Container](/images/4933701-e67babb267007bdc.png)

### 项目间引用 ###

- DDD.UI 添加 DDD.Application、DDD.Domain、- DDD.Infrastructure、DDD.Repository的引用
- DDD.Application 添加 DDD.Domain、DDD.Infrastructure 的引用
- DDD.Domain 添加 DDD.Infrastructure 的引用
- DDD.Repository 添加 DDD.Domain、DDD.Infrastructure 引用

![Docker Container](/images/4933701-90df754b4701e927.png)

### 依赖注入 ###

- 为更彻底的解耦，对依赖注入的实现应用依赖倒置原则。
- 不依赖任何具体的IoC框架及其类和版本
- 在基础设施层中实现2中不同IoC框架
- 在使用时展示通过直接注入和通过反射两种方式
- 通过反射可将IoC的实现依赖通过配置文件管理

![Docker Container](/images/4933701-c19c0c0043b0c4d1.png)

	using System;
	
	namespace DDD.Infrastructure.IoC
	{
	    /// <summary>
	    /// IoC抽象接口
	    /// </summary>
	    interface IIoCContainer
	    {
	        object GetInstance(Type type);
	        T GetInstance<T>();
	        T[] GetInstances<T>();
	        void Init();
	        void Add();
	    }
	}
	namespace DDD.Infrastructure.IoC
	{
	    /// <summary>
	    /// IoC管理类
	    /// </summary>
	    class IoCEngine
	    {
	        private static IIoCContainer _container;
	        public static IIoCContainer Container
	        {
	            get
	            {
	                return _container;
	            }
	        }
	        public static void Init(IIoCContainer container)
	        {
	            container.Init();
	            _container = container;
	        }
	    }
	}

![Docker Container](/images/4933701-87c615bc16ade73b.png)

### 问题 ###

- 更像是以基础设施层为核心
- 仓储无法置于基础设施层
- 领域层对外有依赖
- 代码和架构无法对应

## 设计方案2 ##

![Docker Container](/images/4933701-9429c04233611647.png)

### 项目间引用 ###

- DDD.UI 展现层添加DDD.Application、DDD.Domain、DDD.Infrastructure的引用
- DDD.Application 添加 DDD.Domain、DDD.Infrastructure的引用
- DDD.Infrastructure 添加 DDD.Domain 的引用

### 改善 ###

- 领域层不再依赖基础设施层
- IEntity和IRepository接口定义在领域层
- Repository仓储真正在基础设施层实现

### 优势 ###

- 代码图和架构图完美对应
- 领域层为中心
- 不用为基础设施层无法引用领域层，而在领域层添加不必要的代码。

## 设计方案3 ##

![Docker Container](/images/4933701-cb1bed7a4b9dd856.png)

### 项目间引用关系 ###

- DDD.UI 添加 DDD.Application、DDD.Domain、DDD.Infrastrcutre的引用
- DDD.Application 添加 DDD.Domain 的引用
- DDD.Infrastrcutre 添加 DDD.Application 、DDD.Domain引用

### 优势 ###

- 将IService接口定义在应用层
- 进一步将所有依赖的接口定义在领域层和应用层，包括 依赖注入管理。

