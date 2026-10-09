---
lastUpdated: true
commentabled: true
recommended: true
title: C# 源生成器使用方法
description: C# 源生成器使用方法
date: 2026-07-08 10:15:00
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

## 搭建项目环境

### 创建 Net Standard 2.0 项目

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>netstandard2.0</TargetFramework>
    <LangVersion>latest</LangVersion>
    <IsRoslynComponent>true</IsRoslynComponent>
    <!-- 关键：指定为生成器 -->
    <EnforceExtendedAnalyzerRules>true</EnforceExtendedAnalyzerRules>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.CodeAnalysis.CSharp" Version="4.9.2" />
    <PackageReference Include="Microsoft.CodeAnalysis.Analyzers" Version="3.3.4" />
  </ItemGroup>
</Project>
```

### 生成器完整结构示例

```C#
// 示例功能：自动将自定义类型的属性的内部属性展开为可直接访问的属性
[Generator]  // 生成器特性标记，同时继承 IIncrementalGenerator
internal class FlattenPropsGenerator : IIncrementalGenerator
{
    // 需要实现的方法，完成代码生成
    public override void Initialize(IncrementalGeneratorInitializationContext context)
    {
        // 创建语法提供者，查找带有 GenerateFlattenAttribute 的属性进行处理
        var propertyPipeline = context.SyntaxProvider
            .CreateSyntaxProvider(
                predicate: (node, _) => QuickCheckAttribute(node), // 快速筛选语义节点
                transform: (context, _) => TransformClass(context))  // 转换为特定对象便于后续操作
            .Where(classInfo => classInfo != null);

        // 注册生成代码输出
        context.RegisterSourceOutput(propertyPipeline, (spc, source) =>
        {
            if (source is ClassFlattenInfo classFlattenInfo)
                GenerateFlattenedProperties(spc, classFlattenInfo);
        });
    }

    /*-------------- 以下代码为具体业务实现 --------------*/
    // 仅处理特定特性标注的类及属性
    private static readonly string flattenPropsAttrFullName = typeof(GenerateFlattenPropsAttribute).FullName;
    private static readonly string flattenAttrFullName = typeof(GenerateFlattenAttribute).FullName;

    // 快速校验当前节点是否需要处理
    private static bool QuickCheckAttribute(SyntaxNode node)
    {
        // 检查是否为 record
        if (node is not RecordDeclarationSyntax typeDeclaration) return false;
        // 检查是否包含特性
        return typeDeclaration.AttributeLists.SelectMany(a => a.Attributes).Any(a => flattenPropsAttrFullName.Contains(a.Name.ToFullString()));
    }

    private static ClassFlattenInfo? TransformClass(GeneratorSyntaxContext context)
    {
        var typeDeclaration = (TypeDeclarationSyntax)context.Node;
        var semanticModel = context.SemanticModel;
        var compilation = semanticModel.Compilation;  // 获取 Compilation

        // 获取类型符号
        if (semanticModel.GetDeclaredSymbol(typeDeclaration) is not INamedTypeSymbol symbol)
            return null;

        // 检查是否有指定的特性
        var flattenPropsAttributeType = compilation.GetTypeByMetadataName(flattenPropsAttrFullName);
        var attribute = symbol.GetAttributes().FirstOrDefault(attr => SymbolEqualityComparer.Default.Equals(attr.AttributeClass, flattenPropsAttributeType));
        if (attribute == null) return null;

        // 查找所有带有特性的属性
        var properties = new List<PropertyTransformResult>();
        var attributeType = compilation.GetTypeByMetadataName(flattenAttrFullName);
        foreach (var property in typeDeclaration.Members.OfType<PropertyDeclarationSyntax>())
        {
            // 获取属性符号
            var propertySymbol = semanticModel.GetDeclaredSymbol(property);
            if (propertySymbol == null) continue;

            // 获取属性类型
            if (propertySymbol.Type is not INamedTypeSymbol propertyType)
                continue;

            // 检查是否有特性
            var attr = propertySymbol.GetAttributes().FirstOrDefault(attr => SymbolEqualityComparer.Default.Equals(attr.AttributeClass, attributeType));
            if (attr == null) continue;
            var attrConfig = AttrConfig.CreateFromAttr(attr, context.SemanticModel);

            // 获取需要展平的属性
            properties.Add(new PropertyTransformResult
            {
                PropertySymbol = propertySymbol,
                PropertyType = propertyType,
                PropertyName = property.Identifier.Text,
                PropertySyntax = property,
                PropertiesToFlatten = propertyType.GetAllProperties()
            });
        }
        return properties.Count == 0 ? null : new ClassFlattenInfo
        {
            ContainingType = symbol,
            Properties = properties,
            IsRecord = symbol.IsRecord
        };
    }

    // 根据配置信息生成对应的代码
    private static void GenerateFlattenedProperties(SourceProductionContext context, ClassFlattenInfo classFlattenInfo)
    {
        var classInfo = classFlattenInfo.ContainingType;
        try
        {
            // 生成扁平化属性代码
            var code = GenerateFlattenPropertiesCode(classFlattenInfo, context);
            // 添加源文件
            var fileName = $"{classInfo.Name}_FlattenProps.g.cs";
            context.AddSource(fileName, SourceText.From(code, Encoding.UTF8));
        }
        catch (Exception ex)
        {
            // 报告诊断信息
            var descriptor = new DiagnosticDescriptor("FLATTEN001", "Error generating flattened properties", "Error: {0}", "Generation", DiagnosticSeverity.Error, true);
            var diagnostic = Diagnostic.Create(descriptor, classInfo.DeclaringSyntaxReferences.First().GetSyntax().GetLocation(), ex.Message);
            context.ReportDiagnostic(diagnostic);
        }
    }

    // 生成扁平化属性代码
    private static string GenerateFlattenPropertiesCode(ClassFlattenInfo classFlattenInfo, SourceProductionContext context)
    {
        var sb = new StringBuilder();
        var clsInfo = classFlattenInfo.ContainingType;

        AddGenerateInfo(sb);

        // 收集所有需要 using 的命名空间
        AddUsings(sb, classFlattenInfo);

        // 添加命名空间
        var namespaceName = clsInfo.ContainingNamespace.ToDisplayString();
        if (!string.IsNullOrEmpty(namespaceName))
            sb.AppendLine($"namespace {namespaceName};");

        // 添加类型声明
        AddTypeDeclaration(sb, clsInfo);

        // 添加扁平化属性
        AddFlattenedProperties(sb, classFlattenInfo, context);

        sb.AppendLine("}"); // 结束类型声明

        return sb.ToString();
    }

    private static void AddUsings(StringBuilder sb, ClassFlattenInfo classFlattenInfo)
    {
        // 收集所有需要 using 的命名空间
        var usings = new HashSet<string>();
        var clsNsp = classFlattenInfo.ContainingType.ContainingNamespace;
        Stack<ITypeSymbol> stack = new(classFlattenInfo.Properties.Select(p => p.PropertySymbol.Type)
            .Concat(classFlattenInfo.Properties.SelectMany(prop => prop.PropertiesToFlatten
            .SelectMany(x => x.GetAttributes().Select(a => a.AttributeClass))).OfType<ITypeSymbol>()));
        while (stack.Count > 0)
        {
            var _tsym = stack.Pop();
            // 1. 添加属性类型的命名空间
            if (_tsym.ContainingNamespace is { } ns && !SymbolEqualityComparer.Default.Equals(ns, clsNsp))
                usings.Add(ns.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat));
            // 2. 添加属性类型中泛型参数的命名空间
            if (_tsym is INamedTypeSymbol namedType && namedType.IsGenericType)
                foreach (var typeArg in namedType.TypeArguments)
                    stack.Push(typeArg);
        }
        foreach (var s in usings)
            sb.AppendLine($"using {s};");
        sb.AppendLine();
    }

    private static void AddTypeDeclaration(StringBuilder sb, INamedTypeSymbol clsInfo)
    {
        sb.AppendLine($"{clsInfo.DeclaredAccessibility.ToCodeString()} {clsInfo.GetTypeModifiers()} partial {clsInfo.GetTypeKindString()} {clsInfo.Name}");
        sb.AppendLine("{");
    }

    private static void AddFlattenedProperties(StringBuilder sb, ClassFlattenInfo classFlattenInfo, SourceProductionContext context)
    {
        // 收集所有需要扁平化的属性，避免重复
        var flattenedProperties = new Dictionary<string, (IPropertySymbol, PropertyTransformResult)>();
        var conflicts = new List<(string msg, PropertyTransformResult prop)>();
        // 现有类的属性
        var existingProperty = new HashSet<string>(classFlattenInfo.ContainingType.GetMembers().OfType<IPropertySymbol>().Select(x => x.Name));
        foreach (var propertyInfo in classFlattenInfo.Properties)
        {
            foreach (var prop in propertyInfo.PropertiesToFlatten)
            {
                var propertyName = prop.Name;
                var msg = flattenedProperties.ContainsKey(propertyName) ? $"{propertyInfo.PropertyName}.{propertyName}" : "";
                if (msg == "" && existingProperty.Contains(propertyName))
                    msg = $"{propertyInfo.PropertyName}.{propertyName} (已存在于类中)";
                if (msg != "")
                {
                    conflicts.Add((msg, propertyInfo));
                    continue;
                }
                flattenedProperties[propertyName] = (prop, propertyInfo);
            }
        }

        // 报告冲突
        if (conflicts.Count > 0)
        {
            const string descId = "FLATTEN002";
            const string msgFmt = "检测到属性名称冲突: {0}";
            foreach (var (msg, prop) in conflicts)
            {
                var _msg = string.Format(msgFmt, msg);
                // 控制生成文件提示
                sb.AppendLine($"{indent}// {DiagnosticSeverity.Warning} {descId}: {_msg}");
                // 报告诊断信息
                var desc = new DiagnosticDescriptor(descId, "扁平化属性冲突", _msg, "CodeGeneration", DiagnosticSeverity.Error, true);
                context.ReportDiagnostic(Diagnostic.Create(desc, prop.PropertySyntax.GetLocation()));
            }
            sb.AppendLine();
        }

        // 生成属性代码
        foreach (var (prop, propertyInfo) in flattenedProperties.Values)
        {
            GenerateFlattenedPropertyCode(sb, prop, propertyInfo.PropertyName);
            sb.AppendLine();
        }
    }

    private static void GenerateFlattenedPropertyCode(StringBuilder sb, IPropertySymbol sourceProperty, string sourcePropertyName)
    {
        var propertyName = sourceProperty.Name;
        var propertyType = sourceProperty.Type.ToDisplayString(SymbolDisplayFormat.MinimallyQualifiedFormat);
        var accessibility = sourceProperty.DeclaredAccessibility.ToCodeString();

        // 添加 XML 注释
        sb.AppendLine($"{indent}/// <summary>");
        sb.AppendLine($"{indent}/// 从 {sourcePropertyName}.{propertyName} 扁平化的属性");
        sb.AppendLine($"{indent}/// </summary>");

        // 生成属性
        var hasGetter = sourceProperty.GetMethod != null;
        var hasSetter = sourceProperty.SetMethod != null && !sourceProperty.SetMethod.IsInitOnly;

        // 处理 required 修饰符
        var isRequired = sourceProperty.IsRequired ? "required " : "";

        if (hasGetter && hasSetter)
        {
            // 获取访问器的可访问性
            var getterAccess = sourceProperty.GetMethod!.DeclaredAccessibility.ToCodeString();
            var setterAccess = sourceProperty.SetMethod!.DeclaredAccessibility.ToCodeString();

            var getterMod = getterAccess != accessibility ? $"{getterAccess} " : "";
            var setterMod = setterAccess != accessibility ? $"{setterAccess} " : "";
            sb.AppendLine($"{indent}{accessibility} {isRequired}{propertyType} {propertyName}");
            sb.AppendLine($"{indent}{{");
            sb.AppendLine($"{indent}{indent}{getterMod}get => {sourcePropertyName}.{propertyName};");
            sb.AppendLine($"{indent}{indent}{setterMod}set => {sourcePropertyName}.{propertyName} = value;");
            sb.Append($"{indent}}}");
        }
        else if (hasGetter)
        {
            sb.AppendLine($"{indent}{accessibility} {isRequired}{propertyType} {propertyName} => {sourcePropertyName}.{propertyName};");
        }
        else if (hasSetter)
        {
            var setterAccess = sourceProperty.SetMethod!.DeclaredAccessibility.ToCodeString();
            var setterMod = setterAccess != accessibility ? $"{setterAccess} " : "";

            sb.AppendLine($"{indent}{accessibility} {isRequired}{propertyType} {propertyName}");
            sb.AppendLine($"{indent}{{");
            sb.AppendLine($"{indent}{indent}{setterMod}set => {sourcePropertyName}.{propertyName} = value;");
            sb.Append($"{indent}}}");
        }
    }

    /// <summary>
    /// 属性转换结果
    /// </summary>
    struct PropertyTransformResult
    {
        public IPropertySymbol PropertySymbol { get; set; }
        public INamedTypeSymbol PropertyType { get; set; }
        public string PropertyName { get; set; }
        public PropertyDeclarationSyntax PropertySyntax { get; set; }
        // 获取源类型的所有公共实例属性（非索引器）
        public IReadOnlyList<IPropertySymbol> PropertiesToFlatten { get; set; }
    }

    struct ClassFlattenInfo
    {
        public INamedTypeSymbol ContainingType { get; set; }
        public List<PropertyTransformResult> Properties { get; set; }
        public bool IsRecord { get; set; }
    }
}

[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
public sealed class GenerateFlattenAttribute : Attribute{}
```

### 使用示例

```C#
public record Person
{
    public string? Name { get; set; }
}
[GenerateFlattenProps]
public partial record Student
{
    [GenerateFlatten]
    Person Person { get; set; } = new Person();
}
```

## 如何利用 nuget 方便使用

- 生成器项目无法直接被其他项目作为依赖项目引用，需要借助 nuget
- 修改项目配置文件使生成器项目为 nuget 项目
- 每次修改生成器项目后重新生成，然后在测试项目中重新安装或更新 nuget

```xml
<!-- 开发版配置 -->
<PropertyGroup Condition="'$(Configuration)' == 'Debug'">
	<VersionSuffix>alpha</VersionSuffix>
</PropertyGroup>

<!-- 预览版配置 -->
<PropertyGroup Condition="'$(Configuration)' == 'Preview'">
	<VersionSuffix>beta</VersionSuffix>
</PropertyGroup>

<!-- 正式版配置（无后缀） -->
<PropertyGroup Condition="'$(Configuration)' == 'Release'">
	<VersionSuffix></VersionSuffix>
</PropertyGroup>

<PropertyGroup>
	<IncludeBuildOutput>false</IncludeBuildOutput>
	<IsAnalyzer>true</IsAnalyzer>
	<EnforceExtendedAnalyzerRules>true</EnforceExtendedAnalyzerRules>

	<!-- 每次构建自动递增版本号 -->
	<GeneratePackageOnBuild>true</GeneratePackageOnBuild>
	<PackageOutputPath>$(SolutionDir)local-packages</PackageOutputPath>
	<PackageId>Arch.CodeGenerator</PackageId>
	<Version>1.2.3</Version>
	<Version Condition="'$(VersionSuffix)' != ''">$(Version)-$(VersionSuffix)</Version>
	<PackageVersion>$(Version)</PackageVersion>
	<Authors>会写代码的建筑师</Authors>
	<Description>一个源码生成器</Description>

	<!-- 不包含构建输出 -->
	<IncludeBuildOutput>false</IncludeBuildOutput>

	<!-- 包类型 -->
	<PackageType>Dependency</PackageType>
	<NoPackageAnalysis>true</NoPackageAnalysis>
	<IncludeSourceGeneratorInPackage>true</IncludeSourceGeneratorInPackage>

	<!-- 生成符号包 -->
	<IncludeSymbols>true</IncludeSymbols>
	<SymbolPackageFormat>snupkg</SymbolPackageFormat>
	<!-- 包含源码便于调试 -->
	<IncludeSource>true</IncludeSource>
	<PublishRepositoryUrl>true</PublishRepositoryUrl>
	<EmbedUntrackedSources>true</EmbedUntrackedSources>

</PropertyGroup>
```

## 如何让生成器项目同时作为 dll 项目

- 其他引用项目可与生成器共享本项目中定义的类
- 使用生成器的项目可直接从 `nuget` 安装即可使用本项目定义的类型
- 比如 `GenerateFlattenAttribute` 可直接定义在当前项目，便于统一管理

```xml
<!-- 在打包前复制一份用于 analyzers  -->
<Target Name="CopyForPackage" BeforeTargets="GenerateNuspec">
        <Copy SourceFiles="$(OutputPath)$(AssemblyName).dll"
              DestinationFiles="$(OutputPath)analyzers/$(AssemblyName).dll"
              SkipUnchangedFiles="true" />
</Target>

<ItemGroup>
        <PackageReference Include="Microsoft.CodeAnalysis.CSharp.Workspaces" Version="4.6.0" />
        <!-- 作为普通程序集打包 -->
        <None Include="$(OutputPath)$(AssemblyName).dll" Pack="true" PackagePath="lib/netstandard2.0" />
        <!-- 使用复制后的文件打包到 analyzers -->
        <None Include="$(OutputPath)analyzers/$(AssemblyName).dll" Pack="true" PackagePath="analyzers/dotnet/cs" Visible="false" />
</ItemGroup>
```

_可能遇到的问题_：

首次引入源生成器项目时报错，需要重启 vs 并重新生成解决方案；
