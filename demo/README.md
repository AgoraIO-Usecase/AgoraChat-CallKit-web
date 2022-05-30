# 项目介绍

项目展示了怎样快速集成 AgoraChatCallKit，实现音视频通话。项目中 src/api/index 中的获取 token 接口需要用户自己去实现，src/webim 为集成 Agora Chat SDK。

# 运行项目

## 安装依赖

项目依赖 node 17.3.1 版本， node 版本过低会导致项目无法启动。

```bash
npm install
```

## 运行项目

```bash
HTTPS=true npm start
```

## 操作步骤

1、输入 userId 和 displayed profile name 点击登录。
3、再打开一个页面，登录另一个账号。
3、登录成功后，一方输入 target user id, 点击 startCall。
4、另一方会弹起呼叫页面，点击接听。
