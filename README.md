# Sea Trading OS v7.4.1 — Deploy Visible Fix

Build marker: `SEA TRADING OS v7.4.1 · deploy visible fix`

## 修复点
- 修正 `index.html` 残留旧版本标识：原来 meta 还是 v7.1、title 还是 v7.3.2。
- 修正 `package.json` description 残留 v7.2 文案。
- 全站加入 no-store headers，避免 Vercel/浏览器继续显示旧入口。
- 保留 v7.4 visual upgrade 页面内容。
- 压缩包采用“根目录平铺结构”，上传 GitHub 时不会多套一层 `sea-trading-os-v7.4/` 文件夹。

## 部署验证
部署后页面底部应显示：

```txt
SEA TRADING OS v7.4.1 · deploy visible fix · visual upgrade
```

如果仍显示旧版，说明 GitHub/Vercel 部署的不是这次提交，或上传时没有覆盖仓库根目录。
