---
lastUpdated: true
commentabled: true
recommended: false 
---

# 从 Docker 安装 Gitea #

## Gitea安装 ##

我们在 Docker Hub 的 Gitea 组织中提供了自动更新的 Docker 镜像，它会保持最新的稳定版。你也可以用其它 Docker 服务来更新。首先你需要pull镜像：

```bash

docker pull gitea/gitea:latest

```

如果要将git和其它数据持久化，你需要创建一个目录来作为数据存储的地方：

```bash

sudo mkdir -p /var/lib/gitea

```

然后就可以运行 docker 容器了，这很简单。 当然你需要定义端口数数据目录：

```bash

docker run --privileged=true -d --restart=always --name=gitea -p 3022:22 -p 3000:3000 -v /var/lib/gitea:/data gitea/gitea:latest

```

---

然后 容器已经运行成功.

![Docker Container](/images/20201126111430.png){data-zoomable}

在浏览器中访问 http://localhost:3000 就可以看到界面了。

![Docker Container](/images/20201126111149.png){data-zoomable}

你可以尝试在上面创建项目，clone操作 

```bash

git clone ssh://git@hostname:3022/username/repo.git
git clone http://localhost:3000/username/repo.git

```

注意：目前端口改为非3000时，需要修改配置文件 `LOCAL_ROOT_URL = http://localhost:3000/`。


## 仓库迁移 ##


不仅将所有代码移植到新的仓库，而且要保留所有的 commit 记录

随便找个文件夹，从原地址克隆一份裸版本库

```bash

git clone --bare 旧的git地址

```

会在当前目录下产生一个 xxx.git 的文件夹. 这个步骤，就是克隆 git 每一次的提交信息. 和本地的代码没有关系，只要线上的代码是最新的，这个 git 版本就是完整的.

推送裸版本库到新的地址

```bash

cd xxx.git
git push --mirror 新的git地址

```

删掉 xxx.git 文件夹
删不删无所谓，只是说明它没有用了而已。

代码迁移就成功了，接下来就可以使用新的地址了

```bash

git clone 新的git地址

```
