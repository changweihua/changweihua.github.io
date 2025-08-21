---
lastUpdated: true
commentabled: true
recommended: true
title: Docker Compose部署 Milvus向量数据库
description: Docker Compose部署 Milvus向量数据库
date: 2025-08-21 09:45:00 
pageClass: blog-page-class
cover: /covers/docker.svg
---

```yml
version: '3.5'
 
services:
  etcd:
    container_name: milvus-etcd
    image: quay.io/coreos/etcd:v3.5.18
    environment:
      - ETCD_AUTO_COMPACTION_MODE=revision
      - ETCD_AUTO_COMPACTION_RETENTION=1000
      - ETCD_QUOTA_BACKEND_BYTES=4294967296
      - ETCD_SNAPSHOT_COUNT=50000
    volumes:
      - /home/servers/docker/milvus/volumes/etcd:/etcd
    command: etcd -advertise-client-urls=http://etcd:2379 -listen-client-urls http://0.0.0.0:2379 --data-dir /etcd
    healthcheck:
      test: ["CMD", "etcdctl", "endpoint", "health"]
      interval: 30s
      timeout: 20s
      retries: 3
 
  minio:
    container_name: milvus-minio
    image: minio/minio:RELEASE.2024-12-18T13-15-44Z
    environment:
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin
    ports:
      - "9001:9001"
      - "9000:9000"
    volumes:
      - /home/servers/docker/milvus/volumes/minio:/minio_data
    command: minio server /minio_data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3
 
  standalone:
    container_name: milvus-standalone
    image: milvusdb/milvus:v2.6.0
    command: ["milvus", "run", "standalone"]
    security_opt:
    - seccomp:unconfined
    environment:
      ETCD_ENDPOINTS: etcd:2379
      MINIO_ADDRESS: minio:9000
      MQ_TYPE: woodpecker
    volumes:
      - /home/servers/docker/milvus/volumes/milvus:/var/lib/milvus
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9091/healthz"]
      interval: 30s
      start_period: 90s
      timeout: 20s
      retries: 3
    ports:
      - "19530:19530"
      - "9091:9091"
    depends_on:
      - "etcd"
      - "minio"
# 图形界面管理
  attu:
    container_name: milvus-attu
    image: zilliz/attu:latest
    environment:
      MILVUS_URL: standalone:19530
    ports:
      - "8000:3000"
    depends_on:
     - "standalone"
 
networks:
  default:
    name: milvus
```

## 安装 ##

运行命令 `docker-compose up -d`

## 访问界面 ##

### 自带 WebUI ###

`v2.5.0` 开始可以访问访问 `http://192.168.1.33:9091` 使用自带 `UI`

### attu图形化界面 ###

访问地址 `http://192.168.1.33:8000`
