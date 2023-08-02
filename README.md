<<<<<<< HEAD
[中文](#) | [English](https://github.com/hugo-next/hugo-theme-next-starter/blob/main/README.md)

# Hugo NexT 主题启动器

本启动器是为初学者所准备的，如果你正在准备搭建个人博客站，那么参考如下步骤便可快速完成。加油，祝你好运！:tada::tada::tada:

> **Note**
> 请确认你的电脑上已经安装有 [Git](https://git-scm.com/downloads) 和 [Hugo](https://github.com/gohugoio/hugo/releases/) 两款软件。


## Vercel部署

若想在 Vercel 平台上部署站点可直接点击右侧的按钮：[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fhugo-next%2Fhugo-theme-next-starter&env=HUGO_VERSION&envDescription=Enter%20latest%20version%20of%20Hugo%20engine.&envLink=https%3A%2F%2Fgithub.com%2Fgohugoio%2Fhugo%2Freleases%2F&project-name=my-blog&repo-name=my-blog&demo-title=Hugo%20NexT%20Theme&demo-description=Easily%20%26%20powerful%20theme%20of%20Hugo%20engine.&demo-url=https%3A%2F%2Fhugo-next.eu.org%2F&demo-image=https%3A%2F%2Fimgs.lisenhui.cn%2Fhugo-next%2Fhugo-next-demo.png&install-command=git%20submodule%20add%20https%3A%2F%2Fgithub.com%2Fhugo-next%2Fhugo-theme-next.git%20themes%2Fhugo-theme-next)

### ➕ 创建 Github 仓库

请使用 Github 账户授权登录，参考下面截图输入新仓库名字，点击 `Create` 按钮（注意确认否要创建私有仓库），接下来在 HUGO_VERSION 中输入 `Hugo` 的最新版本号并发布。

![deploy-with-vercel-01.png](https://imgs.lisenhui.cn/hugo-next/deploy-with-vercel-01.png)

### 🏗 调整框架

首次部署由于 Vercel 的问题站点无法直接访问，参考下面截图在设置中调整框架为 `Hugo` 并保存。

![deploy-with-vercel-02.png](https://imgs.lisenhui.cn/hugo-next/deploy-with-vercel-02.png)

### 🚧 重新部署

切换到 `Deployment` 标签页，参考下面截图操作，重新发布后站点就可以正常访问啦。

![deploy-with-vercel-03.png](https://imgs.lisenhui.cn/hugo-next/deploy-with-vercel-03.png)

## ⏬ 克隆主题

点击右上角的 `Use this template` 绿色按钮然后填写代码仓库的相关信息，参考如下：

![使用模板创建](https://imgs.lisenhui.cn/hugo-next/use-hugo-next-starter.png)

最后点击 `Create repository from template` 绿色按钮，会直接在你的空间中生成站点代码，再使用`git clone`命令把它克隆到本地进行创作。

记得首次完全克隆后，需要在根目录中使用如下的 `Git` 子模块更新命令拉取 `hugo-theme-next` 主题的最新版本。

```
# 首次初始化操作
$ git submodule update --init --recursive
# 后续更新操作
$ git submodule update --remote
```

> **Note**
> 注意：当你在中国境内，建议先将 `.gitmodules` 的仓库指向 `Gitee` 地址，再执行上述的命令速度会更快。

## 💻 本地预览

在站点根目录下，执行自带的 `startup.sh` 启动脚本，当看到输出信息中带有 `stop` 字样时便表示启动成功，此时打开浏览器输入默认地址[http://localhost:1414/](http://localhost:1414/)访问浏览效果。


```shell
$ sh startup.sh
========================================
  ███╗   ██╗███████╗██╗  ██╗████████╗
  ████╗  ██║██╔════╝╚██╗██╔╝╚══██╔══╝
  ██╔██╗ ██║█████╗   ╚███╔╝    ██║
  ██║╚██╗██║██╔══╝   ██╔██╗    ██║
  ██║ ╚████║███████╗██╔╝ ██╗   ██║
  ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝   ╚═╝
========================================
Hugo NexT version 4.3.1
Documentation: https://hugo-next.eu.org
========================================
Start building sites …
hugo v0.102.3-b76146b129d7caa52417f8e914fc5b9271bf56fc+extended windows/amd64 BuildDate=2022-09-01T10:16:19Z VendorInfo=gohugoio

                   | ZH-CN
-------------------+--------
  Pages            |    71
  Paginator pages  |     0
  Non-page files   |     0
  Static files     |    43
  Processed images |     0
  Aliases          |    26
  Sitemaps         |     1
  Cleaned          |     0

Built in 233 ms
Watching for changes in C:\xxx\hugo-theme-next-starter\{content,data,themes}
Watching for config changes in C:\xxx\hugo-theme-next-starter\config\_default
Environment: "development"
Serving pages from memory
Running in Fast Render Mode. For full rebuilds on change: hugo server --disableFastRender
Web Server is available at //localhost:1414/ (bind address 127.0.0.1)
Press Ctrl+C to stop
```

## 🎨 效果预览

![Hugo NexT Demo](https://imgs.lisenhui.cn/hugo-next/hugo-next-demo.png)

## 🎉 发布

执行 `hugo` 命令生成全站静态文件，并把文件部署到类似 `Nginx` 的 Web 服务器即可。若如自己没有服务器的话，也可以直接开启 `Github Pages` 功能，会在你推送本地文件到服务器时，自动生成站点的静态文件，使用详情可关注：[Github Pages](https://pages.github.com/)。

> **Note**
> 请将 `config/_default/params.yaml` 配置文件中相关参数调整为你自己的实际环境，比如 评论插件，统计功能，分享功能等。

## 📜 许可证

[MIT 许可证](LICENSE)

Copyright (c) 2022， hugo-next 团队
=======
# fengsixin.github.io
>>>>>>> 1ef5cef6c67a485134ec8e09d843023dcabbded5
