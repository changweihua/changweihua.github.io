---
lastUpdated: true
commentabled: true
recommended: true
title: 别再让你的SpringBoot包"虚胖"了！
description: 这份瘦身攻略请收好
date: 2026-03-23 09:45:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 一、什么是缩小打包体积 ##

缩小打包体积是指通过各种优化手段，减少Spring Boot应用最终部署包（通常是JAR文件）的大小。这在微服务架构和云原生部署场景中尤为重要，主要体现在以下几个方面：

### 核心概念 ###

- 原始问题：Spring Boot默认采用"胖JAR"打包方式，将所有依赖（Spring框架、业务代码、嵌入式服务器、第三方库）全部打成一个可执行JAR，体积通常在50MB-200MB之间
- 优化目标：通过分离依赖、精简内容、分层构建等方式，将部署包体积缩小30%-80%

### 为什么重要 ###

- 部署效率：更小的包意味着更快的上传、下载和部署速度
- 存储成本：减少镜像仓库和服务器存储空间占用
- 启动速度：精简后的包加载类文件更快，减少启动时间
- CI/CD效率：缩短构建和发布流水线时间
- 网络传输：特别是在带宽有限的环境下，小体积包优势明显
- 容器化部署：更小的镜像体积意味着更快的拉取和扩展速度

## 二、缩小打包体积的详细步骤 ##

### 依赖优化 ###

#### 步骤1：分析和精简依赖 ####

```xml
<!-- pom.xml -->
<project>
    <!-- 使用Maven依赖分析插件 -->
    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-dependency-plugin</artifactId>
                <version>3.5.0</version>
                <executions>
                    <execution>
                        <id>analyze</id>
                        <goals>
                            <goal>analyze</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

#### 步骤2：排除不必要的依赖 ####

```xml
<!-- 排除Tomcat（如果使用Jetty或Undertow） -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-tomcat</artifactId>
        </exclusion>
    </exclusions>
</dependency>

<!-- 添加轻量级的Undertow替代 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-undertow</artifactId>
</dependency>
```

### 使用Spring Boot分层JAR ###

#### 步骤3：配置分层JAR ####

```xml
<!-- pom.xml - 使用Spring Boot 2.3+的分层特性 -->
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <layers>
                    <enabled>true</enabled>
                    <configuration>${project.basedir}/layers.xml</configuration>
                </layers>
            </configuration>
        </plugin>
    </plugins>
</build>
```

创建自定义分层配置 layers.xml：

```xml
<layers xmlns="http://www.springframework.org/schema/boot/layers"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.springframework.org/schema/boot/layers
                          https://www.springframework.org/schema/boot/layers/layers-2.3.xsd">
    <application>
        <into layer="spring-boot-loader">
            <include>org/springframework/boot/loader/**</include>
        </into>
        <into layer="application" />
    </application>
    <dependencies>
        <into layer="snapshot-dependencies">
            <include>*:*:*SNAPSHOT</include>
        </into>
        <into layer="internal-dependencies">
            <include>com.yourcompany:*</include>
        </into>
        <into layer="dependencies" />
    </dependencies>
    <layerOrder>
        <layer>dependencies</layer>
        <layer>spring-boot-loader</layer>
        <layer>snapshot-dependencies</layer>
        <layer>internal-dependencies</layer>
        <layer>application</layer>
    </layerOrder>
</layers>
```

### 构建Docker镜像优化 ###

#### 步骤4：创建优化的Dockerfile ####

```bash
# 使用多阶段构建
# 构建阶段
FROM maven:3.8.4-openjdk-11-slim AS builder
WORKDIR /app
COPY pom.xml .
# 下载依赖（利用Docker缓存）
RUN mvn dependency:go-offline
COPY src ./src
# 打包应用
RUN mvn clean package -DskipTests

# 运行阶段
FROM openjdk:11-jre-slim
WORKDIR /app

# 创建非root用户
RUN addgroup --system --gid 1001 appuser && \
    adduser --system --uid 1001 --gid 1001 appuser

# 从构建阶段复制JAR
COPY --from=builder --chown=appuser:appuser /app/target/*.jar app.jar

# 提取分层JAR
RUN java -Djarmode=layertools -jar app.jar extract

# 复制分层内容
COPY --from=builder --chown=appuser:appuser /app/dependencies/ ./
COPY --from=builder --chown=appuser:appuser /app/spring-boot-loader/ ./
COPY --from=builder --chown=appuser:appuser /app/snapshot-dependencies/ ./
COPY --from=builder --chown=appuser:appuser /app/application/ ./

USER appuser

# 优化JVM参数
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-XX:+UseG1GC", "-XX:+OptimizeStringConcat", "-XX:+UseStringDeduplication", "org.springframework.boot.loader.JarLauncher"]
```

### 资源文件优化 ###

#### 步骤5：优化静态资源和配置文件 ####

```xml
<!-- 在pom.xml中配置资源过滤和压缩 -->
<build>
    <resources>
        <resource>
            <directory>src/main/resources</directory>
            <filtering>true</filtering>
            <excludes>
                <exclude>**/*.psd</exclude>
                <exclude>**/*.ai</exclude>
                <exclude>**/*.xcf</exclude>
            </excludes>
        </resource>
    </resources>
    <plugins>
        <!-- 压缩CSS/JS -->
        <plugin>
            <groupId>com.github.eirslett</groupId>
            <artifactId>frontend-maven-plugin</artifactId>
            <version>1.12.1</version>
            <executions>
                <execution>
                    <id>compress-resources</id>
                    <goals>
                        <goal>yarn</goal>
                    </goals>
                    <configuration>
                        <arguments>build</arguments>
                    </configuration>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

### 自定义ClassLoader和数据压缩 ###

#### 步骤6：实现自定义类加载器 ####

```java
// 自定义类加载器实现懒加载
public class LazyLoadingClassLoader extends ClassLoader {
    
    private Map<String, byte[]> classBytesMap = new ConcurrentHashMap<>();
    
    public void registerClassBytes(String className, byte[] bytes) {
        classBytesMap.put(className, bytes);
    }
    
    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        byte[] bytes = classBytesMap.remove(name);
        if (bytes == null) {
            return super.findClass(name);
        }
        return defineClass(name, bytes, 0, bytes.length);
    }
}
```

#### 步骤7：配置文件压缩 ####

```java
@Configuration
@PropertySource(value = "classpath:application.properties", 
                encoding = "UTF-8")
public class CompressedConfig {
    
    @Bean
    public static PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer() {
        PropertySourcesPlaceholderConfigurer configurer = 
            new PropertySourcesPlaceholderConfigurer();
        
        // 启用压缩属性文件
        configurer.setIgnoreUnresolvablePlaceholders(true);
        configurer.setFileEncoding("UTF-8");
        
        return configurer;
    }
}
```

### 使用GraalVM Native Image ###

#### 步骤8：配置GraalVM原生编译 ####

```xml
<!-- 添加native-image插件 -->
<plugin>
    <groupId>org.graalvm.buildtools</groupId>
    <artifactId>native-maven-plugin</artifactId>
    <version>0.9.20</version>
    <extensions>true</extensions>
    <configuration>
        <buildArgs>
            <buildArg>-H:+ReportExceptionStackTraces</buildArg>
            <buildArg>--initialize-at-build-time=org.springframework.util.unit.DataSize</buildArg>
            <buildArg>--initialize-at-build-time=org.slf4j</buildArg>
        </buildArgs>
    </configuration>
    <executions>
        <execution>
            <id>build-native</id>
            <goals>
                <goal>compile-no-fork</goal>
            </goals>
            <phase>package</phase>
        </execution>
    </executions>
</plugin>
```

### 自动化瘦身脚本 ###

#### 步骤9：创建自动化瘦身脚本 ####

```bash
#!/bin/bash
# slim-down.sh - 自动化瘦身脚本

echo "开始Spring Boot应用瘦身..."

# 1. 分析当前JAR大小
JAR_FILE=$(ls target/*.jar | head -1)
ORIGINAL_SIZE=$(du -h $JAR_FILE | cut -f1)
echo "原始JAR大小: $ORIGINAL_SIZE"

# 2. 提取并分析依赖
mkdir -p tmp/unpacked
cd tmp/unpacked
jar -xf ../../$JAR_FILE
cd BOOT-INF/lib

# 3. 找出大文件依赖
echo "前10大依赖:"
ls -lhS | head -10

# 4. 分析可移除的依赖
cd ../../..
rm -rf tmp

# 5. 重新打包（使用分层JAR）
echo "执行分层JAR打包..."
mvn clean package -Dspring-boot.thin.jar=true

# 6. 构建优化后的Docker镜像
echo "构建优化镜像..."
docker build -t optimized-app:latest -f Dockerfile.multistage .

NEW_JAR=$(ls target/*.jar | head -1)
NEW_SIZE=$(du -h $NEW_JAR | cut -f1)
REDUCTION=$(echo "scale=2; ($(du -b $JAR_FILE | cut -f1) - $(du -b $NEW_JAR | cut -f1)) / $(du -b $JAR_FILE | cut -f1) * 100" | bc)

echo "优化完成!"
echo "原始大小: $ORIGINAL_SIZE"
echo "优化后大小: $NEW_SIZE"
echo "体积减少: $REDUCTION%"
```

### 使用Thin Launcher ###

#### 步骤10：配置Thin Launcher ####

```xml
<!-- 使用Spring Boot Thin Launcher -->
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot.experimental</groupId>
            <artifactId>spring-boot-thin-maven-plugin</artifactId>
            <version>1.0.29.RELEASE</version>
            <executions>
                <execution>
                    <id>resolve</id>
                    <goals>
                        <goal>resolve</goal>
                    </goals>
                    <inherited>false</inherited>
                </execution>
            </executions>
        </plugin>
        
        <!-- 修改默认打包插件 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-jar-plugin</artifactId>
            <configuration>
                <archive>
                    <manifest>
                        <mainClass>${start-class}</mainClass>
                    </manifest>
                    <manifestEntries>
                        <Spring-Boot-Version>${spring-boot.version}</Spring-Boot-Version>
                        <Spring-Boot-Lib>lib/</Spring-Boot-Lib>
                    </manifestEntries>
                </archive>
            </configuration>
        </plugin>
    </plugins>
</build>
```

### 配置排除和瘦身优化 ###

#### 步骤11：完整的pom.xml优化配置 ####

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <groupId>com.example</groupId>
    <artifactId>slim-app</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.0</version>
    </parent>
    
    <properties>
        <java.version>11</java.version>
        <!-- 启用瘦身模式 -->
        <spring-boot.thin.jar>true</spring-boot.thin.jar>
        <!-- 排除devtools -->
        <spring-boot.devtools.exclude>true</spring-boot.devtools.exclude>
    </properties>
    
    <dependencies>
        <!-- 核心依赖，排除不必要的传递依赖 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <exclusions>
                <exclusion>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-starter-tomcat</artifactId>
                </exclusion>
                <exclusion>
                    <groupId>org.hibernate.validator</groupId>
                    <artifactId>hibernate-validator</artifactId>
                </exclusion>
                <exclusion>
                    <groupId>org.springframework</groupId>
                    <artifactId>spring-webmvc</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
        
        <!-- 使用轻量级服务器 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-jetty</artifactId>
        </dependency>
        
        <!-- 条件化引入依赖 -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
            <scope>provided</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <!-- 启用分层JAR -->
                    <layers>
                        <enabled>true</enabled>
                    </layers>
                    <!-- 排除devtools -->
                    <excludeDevtools>true</excludeDevtools>
                    <!-- 配置需要排除的依赖 -->
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
            
            <!-- 依赖分析插件 -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-dependency-plugin</artifactId>
                <version>3.5.0</version>
                <executions>
                    <execution>
                        <id>analyze-dependencies</id>
                        <goals>
                            <goal>analyze-only</goal>
                        </goals>
                        <configuration>
                            <failOnWarning>false</failOnWarning>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
            
            <!-- 资源优化插件 -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-resources-plugin</artifactId>
                <version>3.3.1</version>
                <configuration>
                    <encoding>UTF-8</encoding>
                    <nonFilteredFileExtensions>
                        <nonFilteredFileExtension>pdf</nonFilteredFileExtension>
                        <nonFilteredFileExtension>png</nonFilteredFileExtension>
                        <nonFilteredFileExtension>jpg</nonFilteredFileExtension>
                    </nonFilteredFileExtensions>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

## 三、详细总结 ##

### 优化效果对比 ###

|  优化策略   |    原始体积  |   优化后体积  |  缩减比例  |   适用场景  |
| :-----------: | :-----------: | :-----------: | :-----------: | :-----------: |
| 基础依赖精简 | 80MB | 60MB |  25%  |   所有项目  |
| 分层JAR + 多阶段构建 | 80MB | 45MB |  44%  |   容器部署  |
| Thin Launcher | 80MB | 15MB |  81%  |   微服务  |
| GraalVM Native | 80MB | 25MB |  69%  |   高性能场景  |
| 综合优化 | 80MB | 18MB |  78%  |   云原生部署  |

### 最佳实践总结 ###

优先级策略：

- 第一优先级（立即实施）

  - 使用spring-boot-maven-plugin的分层JAR功能
  - 排除不必要的传递依赖
  - 使用多阶段Docker构建

- 第二优先级（推荐实施）

  - 替换为轻量级嵌入式服务器（Undertow/Jetty）
  - 配置资源过滤和排除
  - 使用maven-dependency-plugin分析并移除无用依赖

第三优先级（可选实施）

- 采用Thin Launcher方案
- 使用GraalVM Native Image
- 实现自定义类加载器

### 关键注意事项 ###

#### 兼容性考量 ####

- Native Image对反射、动态代理支持有限
- Thin Launcher可能需要调整类加载逻辑
- 分层JAR需要Spring Boot 2.3+

#### 性能权衡 ####

- Native Image启动快但构建慢
- Thin Launcher首次启动需要下载依赖
- 过度精简可能影响功能完整性

#### 监控与维护 ####

- 建立体积监控基准
- 在CI/CD流程中自动检查JAR大小
- 定期review依赖使用情况

### 实施建议路线图 ###

```mermaid

```

### 最后 ###

缩小Spring Boot打包体积是一个持续优化的过程，建议：

- 从简单开始：先实施基础依赖优化和分层JAR
- 测量驱动：每次优化前后都要测量体积变化
- 平衡取舍：在体积、性能、开发效率之间找到平衡点
- 自动化集成：将体积检查集成到CI/CD流程中
- 文档记录：记录优化决策和效果，便于团队协作

通过系统性地实施上述优化策略，大多数Spring Boot应用可以将部署体积缩减50%以上，显著提升部署效率和运行时性能。
