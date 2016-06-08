# TategakiEditor
ブラウザから縦書きで表示し、サーバーにテキストファイルを保存、編集できるプログラムです。
また、ショートカットキーや簡易的なコマンドモード(後述)もあり、MSワードでは上下にページがスクロールするのに対し、このプログラムでは。左右にページがスクロールします。

※コピーアンドペースト、検索、アンドゥ機能は未実装

## Requirements
TomcatとMySQLを利用します。

## Installation
1. MySQLでデータベースの設定

     `mysql -u root -p`

     `create database tategaki_editor;`
       
     `grant all on tategaki_editor.* to serveruser@localhost identified by 'digk473';` ※ユーザー名及びパスワードを変更する場合は、コードの該当箇所を適宜変更すること

     `mysql -u serveruser -p`

     `pass: digk473`

     `create table edit_users(
      id int not null auto_increment primary key,
       name varchar(255) unique not null,
       email varchar(255) unique,
       password varchar(32) not null,
		 root_file_id int,
       registered datetime
       );`

     `create table file_table(
      id int not null auto_increment primary key,
      filename varchar(255),
		type enum('root','dir','file') default 'file',
		parent_dir int,
      user_id int not null,
      saved datetime
      );`

     また、MySQL用のJDBCドライバを取得してクラスパスを通しておく

2. tategakiディレクトリを作成し、Tomcatのディレクトリ/conf/Catalina/localhost/tategaki.xmlに以下を記述

     `<Context path="/tategaki"`

     `docBase="tategakiディレクトリを作成したディレクトリのパス/tategaki" />`

3. tategakiディレクトリにソースコードを配置し、WEB-INF/classes/にある各JavaファイルをTomcatのディレクトリ/lib/servlet-api.jarにクラスパスを通してコンパイル ※WriteFile.javaのみgson-master/gson.2.2.2.jarにもクラスパスを通す必要あり

4. Tomcatを起動し、webブラウザからURLにhttp://localhost:8080/tategakiを指定してアクセス　※localhost、8080の部分は設定や利用方法により異なる

5. ログイン画面下部にある新規登録からアカウントを作成して利用してください

## Usage
* ショートカットキー
　　　　
       * \<CTL-J\>  カーソル移動[Down]
       * \<CTL-K\>  カーソル移動[Up]
       * \<CTL-L\>  カーソル移動[Right]
       * \<CTL-H\>  カーソル移動[Left]
       * \<CTL-D\>  カーソルの前にある文字を１文字削除[BackSpace]
       * \<CTL-S\>  ファイルを上書き保存
       * \<CTL-I\>  同じディレクトリ内の次のファイルを開く
       * \<CTL-O\>  同じディレクトリ内の前のファイルを開く

* コマンドモード（「：」キーで開始）
       * \<:(w|s|save)\>                            ファイルを上書き保存
       * \<:(w|s|save) ファイル名\>                  名前をつけて保存
       * \<:(o|open|e|n(ew)?)\>                    「newfile」という名前でファイルを新規作成する
       * \<:(o|open|e) ファイル名\>                  ファイルを開く
       * \<:n(ew)? ファイル名\>                    「ファイル名」という名前でファイルを新規作成する
       * \<:(jr|jumpr|jumprow) [1-9]+[0-9]*\>       (指定した数値)行目にジャンプする
       * \<:(jp|jumpp|jumppage) [1-9]+[0-9]*\>     （指定した数値)ページ目の１行目にジャンプする
       * \<:(d|del|delete)\>                         今開いているファイルを削除する
       * \<:(d|del|delete) ファイル名\>            「ファイル名」という名前のファイルを削除する
       * \<:next\>                                   次のファイルを開く
       * \<:prev\>                                   前のファイルを開く
       * \<:(t|title|name) ファイル名\>              現在開いているファイルの名前を「ファイル名」に変更する(これだけでは保存されません)
       * \<:mkdir ディレクトリ名\>                 「ディレクトリ名」という名前でディレクトリを作成する
       * \<:mv ファイル名 ディレクトリ名\>         「ファイル名」を「ディレクトリ名」の中に移動する
       * \<:deldir ディレクトリ名\>                  ディレクトリ「ディレクトリ名」を削除する
