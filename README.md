# 五十音図记忆闪卡 — 微信小程序

## 使用前准备

1. 去 https://mp.weixin.qq.com 注册小程序账号（选「个人」类型即可）
2. 登录后在「开发」→「开发管理」→「开发设置」找到你的 **AppID**
3. 下载微信开发者工具：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

## 导入项目

1. 打开微信开发者工具 → 「导入项目」
2. 项目目录选择本文件夹
3. 把 `project.config.json` 里的 `YOUR_APPID_HERE` 替换成你的真实 AppID
4. 点击「导入」

## 项目结构

```
gojuuon-miniprogram/
├── app.js              # 全局入口
├── app.json            # 全局配置（页面路由）
├── app.wxss            # 全局样式
├── sitemap.json
├── project.config.json # 开发者工具配置（填入AppID）
├── utils/
│   └── gojuuon.js      # 五十音数据 + 洗牌工具
└── pages/
    ├── index/          # 首页（选模式）
    ├── study/          # 学习页（翻牌核心逻辑）
    └── complete/       # 完成页
```

## 功能说明

- 3 种模式：片假名→平假名 / 平假名→片假名 / 假名→罗马字读音
- 翻牌后：记住了→移出牌堆，没记住→放牌底
- 每轮结束显示剩余数量，可进入下一轮
- 全部记住后跳转完成页，可再来一轮巩固
- 触觉反馈（vibrateShort）

## 上线流程

1. 开发者工具右上角 → 「上传」
2. 填写版本号和备注
3. 去 mp.weixin.qq.com → 「版本管理」→ 提交审核
4. 等待 1-3 天审核通过
