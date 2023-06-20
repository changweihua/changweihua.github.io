# Docker：容器网络互联 #

----


## 虚拟IP ##

首先思考被隔离的容器进程，该如何跟其他 Network Namespace 里的容器进程进行通信？

Docker 项目会默认在宿主机上创建一个名叫 docker0 的网桥，凡是连接在 docker0 网桥上的容器，就可以通过它来进行通信。

![Docker Container](/images/1477786-20201126221054363-950687804.png)

我们又该如何把这些容器“连接”到 docker0 网桥上呢？这时候，我们就需要使用一种名叫 Veth Pair 的虚拟设备了。

Veth Pair 设备的特点是：它被创建出来后，总是以两张虚拟网卡（Veth Peer）的形式成对出现的。并且，从其中一个“网卡”发出的数据包，可以直接出现在与它对应的另一张“网卡”上，哪怕这两个“网卡”在不同的 Network Namespace 里。

每一个运行的容器的 Veth Pair 设备的一端会在宿主机上。你可以通过查看宿主机的网络设备看到它。

![Docker Container](/images/1477786-20201126221307076-878872428.png)

创建的容器里也会有一张叫作 eth0 的网卡，它正是一个 Veth Pair 设备在容器里的这一端。

假设现在创建两个容器，他们的虚拟ip为172.17.0.2、172.17.0.3，宿主机的ip为10.168.0.2

那么构建的网络模型如图所示：

![Docker Container](/images/1477786-20201126222005361-1165208720.png)

在此基础上，容器之间的互联和容器与宿主机之间的互联是这样的：

宿主机访问容器：通过虚拟ip
容器访问宿主机：通过宿主机ip
容器互相访问：通过虚拟ip
这种方式有什么问题？

在容器中的应用代码对IP做了硬编码，如果容器重启，Docker会改变容器的ip地址，则会出错。

## link ##

运行容器的时候加上参数link

运行第一个容器：

	docker run -it --name centos-1 docker.io/centos:latest

运行第二个容器：

	docker run -it --name centos-2 --link centos-1:centos-1 docker.io/centos:latest

–link：参数中第一个centos-1是容器名，第二个centos-1是定义的容器别名（使用别名访问容器），为了方便使用，一般别名默认容器名。

测试结果如下：

	[root@e0841aa13c5b /]# ping centos-1
	PING centos-1 (172.17.0.7) 56(84) bytes of data.
	64 bytes from centos-1 (172.17.0.7): icmp_seq=1 ttl=64 time=0.210 ms
	64 bytes from centos-1 (172.17.0.7): icmp_seq=2 ttl=64 time=0.116 ms
	64 bytes from centos-1 (172.17.0.7): icmp_seq=3 ttl=64 time=0.112 ms
	64 bytes from centos-1 (172.17.0.7): icmp_seq=4 ttl=64 time=0.114 ms

此方法对容器创建的顺序有要求，如果集群内部多个容器要互访，使用就不太方便。

## bridge网络 ##

创建bridge网络：

	docker network create testnet

查询到新创建的bridge：

	docker network ls

运行容器连接到testnet网络。
使用方法：

	docker run -it --name <容器名> —network --network-alias <网络别名> <镜像名>
	docker run -it --name centos-1 --network testnet --network-alias centos-1 docker.io/centos:latest
	docker run -it --name centos-2 --network testnet --network-alias centos-2 docker.io/centos:latest

3.从一个容器ping另外一个容器，测试结果如下：

	ping centos-1
	PING centos-1 (172.20.0.2) 56(84) bytes of data.
	64 bytes from centos-1.testnet (172.20.0.2): icmp_seq=1 ttl=64 time=0.158 ms
	64 bytes from centos-1.testnet (172.20.0.2): icmp_seq=2 ttl=64 time=0.108 ms
	64 bytes from centos-1.testnet (172.20.0.2): icmp_seq=3 ttl=64 time=0.112 ms
	64 bytes from centos-1.testnet (172.20.0.2): icmp_seq=4 ttl=64 time=0.113 ms

推荐使用这种方法，自定义网络，因为使用的是网络别名，可以不用顾虑ip是否变动，只要连接到docker内部bright网络即可互访。bridge也可以建立多个，隔离在不同的网段。

若访问容器中服务，可以使用这用方式访问 <网络别名>:<服务端口号>。