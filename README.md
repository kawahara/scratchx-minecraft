# ScratchX extension for MineCraft

[SpongeVanilla](https://www.spongepowered.org/) と [webapi mod](https://ore.spongepowered.org/Valandur/Web-API)
を利用して、ScratchX から、MineCraft を制御するためのプログラムです。

## 導入

- webapi mod をインストールした、SpongeVanilla サーバーを起動します。
- このフォルダにある、 extension.js と crossdomain.xml をWebサーバで公開します。

検証時には [node.js](https://nodejs.org/ja/) がインストールされている前提で、以下のようにするとよいです。

SpongeVanilla 側が、8080ポートを利用するため、8082ポートで実行します。

```
npm install -g http-server
PORT=8082 http-server
```
 

## 実際の利用の際の注意

- API Key については、デフォルトの `ADMIN` を設定しています。必要であれば、extension.js の apiKey の値を変更してください。
- ローカルで実行する前提となっています。必要であれば、extension.js の endpoint の値を書き換えてください。
