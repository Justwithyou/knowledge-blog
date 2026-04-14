---
title: Nginx 静态资源部署完全指南
published: 2025-01-20
description: 从零开始学习如何使用 Nginx 部署静态网站，包括基础配置、HTTPS、性能优化等实用技巧。
tags: [Nginx, DevOps, 部署]
category: DevOps
draft: false
---

# Nginx 静态资源部署完全指南

## 前言

Nginx 是目前最流行的 Web 服务器之一，以其高性能、低资源占用和丰富的功能而闻名。对于静态网站来说，Nginx 是最理想的部署方案。

## 基础配置

### 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx

# 启动服务
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 最小化配置示例

```nginx
server {
    listen 80;
    server_name example.com;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

## 关键配置说明

### 1. 监听端口

```nginx
# 监听 HTTP 默认端口
listen 80;

# 监听自定义端口
listen 10101;

# 监听 HTTPS
listen 443 ssl;
```

### 2. 静态资源缓存

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff2)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 3. Gzip 压缩

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml;
gzip_min_length 256;
```

### 4. 错误页面定制

```nginx
error_page 404 /404.html;
error_page 500 502 503 504 /50x.html;
```

## HTTPS 配置

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}

# HTTP 强制跳转 HTTPS
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}
```

## 性能优化技巧

| 优化项 | 说明 | 预期效果 |
|--------|------|----------|
| Gzip 压缩 | 减少传输体积 | 60-80% 体积缩减 |
| 静态缓存 | 减少重复请求 | 大幅提升二次访问速度 |
| HTTP/2 | 多路复用 | 降低延迟 |
| 连接复用 | keepalive 设置 | 减少 TCP 握手开销 |

## 常见问题排查

```bash
# 测试配置文件语法
nginx -t

# 重新加载配置（不中断服务）
nginx -s reload

# 查看错误日志
tail -f /var/log/nginx/error.log
```

## 总结

Nginx 作为静态资源服务器，配置简单、性能出色。通过合理的缓存策略和压缩配置，可以让你的网站获得极致的访问体验。
