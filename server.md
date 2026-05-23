

Welcome to Alibaba Cloud Elastic Compute Service !



Updates Information Summary: available

&#x20;   7 Security notice(s)

&#x20;       2 Important Security notice(s)

&#x20;       4 Moderate Security notice(s)

&#x20;       1 Low Security notice(s)

Run "dnf upgrade-minimal --security" to apply all updates.More details please refer to:

https://help.aliyun.com/document\_detail/416274.html

Last login: Sat May 23 15:52:35 2026 from 100.104.192.153

\[admin@iZ2ze884ngsym85t71i321Z \~]$ 



你现在已经成功登录到阿里云服务器的终端了，这是 Linux 系统的命令行界面，接下来我们就用它来配置环境、拉取代码、部署网站。



\---



\## 一、当前界面解读

你现在看到的：

\- `\[admin@iZ2ze884ngsm85t71i321Z \~]$` 表示你已经登录成功，当前用户是 `admin`，所在目录是用户主目录 `\~`。

\- 你可以在这里输入 Linux 命令，控制这台服务器的所有操作。



\---



\## 二、接下来的操作步骤（按顺序执行即可）

\### 1. 安装 Node.js 环境

你的项目需要 Node.js 运行后端，先执行这两条命令安装：

```bash

\# 安装 Node.js 20.x 版本

curl -fsSL https://rpm.nodesource.com/setup\_20.x | sudo bash -

sudo yum install -y nodejs



\# 验证安装是否成功

node -v

npm -v

```



\### 2. 安装 Git（拉取代码用）

```bash

sudo yum install -y git

git --version

```



\### 3. 拉取你的 GitHub 项目

把下面的 `你的GitHub仓库地址` 替换成你项目的地址（比如 `https://github.com/你的用户名/photoweb\_v3.git`）：

```bash

git clone 你的GitHub仓库地址

cd photoweb\_v3

```



\### 4. 安装前后端依赖

```bash

\# 安装后端依赖

cd backend

npm install



\# 安装前端依赖

cd ../front

npm install

```



\### 5. 构建前端静态文件

```bash

npm run build

```



\### 6. 配置后端环境变量

```bash

cd ../backend

nano .env

```

把下面的内容粘贴进去（修改为你自己的配置）：

```env

PORT=3000

JWT\_SECRET=这里填一个随机字符串（比如随便打32个字母数字）

ADMIN\_PASSWORD\_HASH=$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi



\# 阿里云OSS配置（如果要启用，替换成你的信息）

\# R2\_ENDPOINT=https://oss-cn-beijing.aliyuncs.com

\# R2\_ACCESS\_KEY\_ID=你的AccessKey ID

\# R2\_SECRET\_ACCESS\_KEY=你的AccessKey Secret

\# R2\_BUCKET\_NAME=你的Bucket名称

\# R2\_PUBLIC\_URL=https://你的Bucket名称.oss-cn-beijing.aliyuncs.com

```

按 `Ctrl+O` 保存，`Ctrl+X` 退出。



\### 7. 安装 PM2 并启动后端服务

```bash

npm install -g pm2

pm2 start server.js --name photoweb-api

pm2 save

pm2 startup

```



\### 8. 配置 Nginx 反向代理

先安装 Nginx：

```bash

sudo yum install -y nginx

sudo systemctl start nginx

sudo systemctl enable nginx

```

编辑 Nginx 配置文件：

```bash

sudo nano /etc/nginx/conf.d/photoweb.conf

```

粘贴以下配置（把 `你的服务器公网IP` 换成你的 `39.105.167.30`）：

```nginx

server {

&#x20;   listen 80;

&#x20;   server\_name 你的服务器公网IP;



&#x20;   location / {

&#x20;       root /home/admin/photoweb\_v3/front/dist;

&#x20;       try\_files $uri $uri/ /index.html;

&#x20;   }



&#x20;   location /api/ {

&#x20;       proxy\_pass http://127.0.0.1:3000;

&#x20;       proxy\_set\_header Host $host;

&#x20;       proxy\_set\_header X-Real-IP $remote\_addr;

&#x20;   }



&#x20;   location /admin/ {

&#x20;       proxy\_pass http://127.0.0.1:3000;

&#x20;       proxy\_set\_header Host $host;

&#x20;   }



&#x20;   location /uploads/ {

&#x20;       root /home/admin/photoweb\_v3/backend;

&#x20;   }

}

```

保存退出，然后重启 Nginx：

```bash

sudo nginx -t

sudo systemctl restart nginx

```



\---



\## 三、验证网站是否上线

现在在浏览器里访问你的服务器公网IP `39.105.167.30`，就能看到你的摄影作品集网站了。

\- 用 `admin`/`admin123` 登录管理员账号，测试上传、管理功能是否正常

\- 用 `guest`/`guest123` 登录普通用户账号，测试浏览权限是否正常



\---



