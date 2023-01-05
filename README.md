# GBF_filter_summon
* 召喚石選択時に特定の石があるかどうか検索し、存在しない場合にはトライアルバトルの石選択へリダイレクトします
* 戦闘終了時にデスクトップへ通知を行います
* トライアルバトル開始時にクエストページに遷移することで、撤退処理を簡単にします。
* バトル終了時に自動でリロードします。
* 拡張機能クリック時のポップアップから制御フラグを操作できます。
* 対象の召喚石に自動でスクロールします。
* トライアルバトルの石選択では一番下の石へスクロールします。
## 実装予定
## フィルターの設定
### bless_rank
* 1または2が最低レベルの加護効果です。(石によって違います)
* 3がレベル2, 4がレベル3, 5がレベル4です。
### attribute
* 0がその他
* 1-6が順に火、水、土、風、光、闇です。
## 注意
* f12キーを押下して開発者ツールを起動してください。

* 通知機能を利用する場合、アドレスバーに下記リンクを入力し、<http://game.granbluefantasy.jp/>を追加してください。
```
chrome://flags/#unsafely-treat-insecure-origin-as-secure
```
