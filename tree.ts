// vim: set shiftwidth=2:
//
// Usage
// $ deno run --allow-read % -a -L2

import { join, resolve } from "https://deno.land/std@0.100.0/path/mod.ts";
import { parse } from "https://deno.land/std@0.100.0/flags/mod.ts";

// tree 表示を調整するオプションのインタ―フェース
export interface TreeOptions {
  maxDepth?: number; // -L
  includeFiles?: boolean; // -d
  skip?: RegExp[]; // -a -u
}

function include(path: string, skip?: RegExp[]): boolean {
  // skipには-aおよび-uオプションの有無に応じて
  // スキップ対象の正規表を格納し
  // それとマッチした場合表示をスキップ
  if (skip && skip.some((pattern): boolean => !!path.match(pattern))) {
    return false;
  }
  return true;
}

// 連結したパスをオブジクトに含め、配列の順序を辞書順に直しておく
export interface TreeEntry extends Deno.DirEntry {
  path: string;
}

const tree = async (
  root: string,
  prefix = "",
  // コマンド引数のオブジェクト
  {
    maxDepth = Infinity,
    includeFiles = true,
    skip = undefined,
  }: TreeOptions = {},
) => {
  // depth が0またはスキップ対象なら終了
  if (maxDepth < 1 || !include(root, skip)) {
    return;
  }

  const entries: TreeEntry[] = [];
  for await (const entry of Deno.readDir(root)) {
    // readDirでは一階層したのファイルパスだけ
    // console.log(join(root, entry.name));
    // const treeEntry = { ...entry, path: join(root, entry.name) };
    //                  ^^^ ...entryとは？
    if (entry.isFile && !includeFiles) {
      continue;
    }
    // entries.push(treeEntry);
    entries.push({ ...entry, path: join(root, entry.name) });
  }

  if (entries.length == 0) {
    return;
  }

  const sortedEntries = entries.sort((a, b) =>
    a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
  );
  const lastOne = sortedEntries[entries.length - 1];

  for await (const entry of sortedEntries) {
    const branch = entry === lastOne ? "└── " : "├── "; // ディレクトリ内の最後の項目だったら左の枝
    const suffix = (entry.isDirectory) ? "/" : ""; // ディレクトリなら末尾に"/"

    // console.log(prefix + entry.path)
    // console.log(prefix + entry.name)  // フルパスではなく、ファイル名だけ表示
    // console.log(prefix + branch + entry.name);
    if (include(entry.path, skip)) {
      console.log(prefix + branch + entry.name + suffix);
    }

    // entryがディレクトリだったら再帰的にtree呼び出し
    if (entry.isDirectory) { // ignore .git directory
      // await tree(entry.path)
      // await tree(entry.path, prefix+"  ")  // 再帰的処理をするときに、prefixのスペースが増えていく
      const indent = entry === lastOne ? "  " : "| "; // 再帰処理をするときにディレクトリ内の最後の項目だったら左のindent
      await tree(entry.path, prefix + indent, {
        maxDepth: maxDepth - 1,
        includeFiles,
        skip,
      });
    }
  }
};

// main
// -----
// const dir = ".";
// Options
const {
  a,
  d,
  L,
  _: [dir = "."],
} = parse(Deno.args);

// a=falseのとき、頭文字が.のファイルをskipのリストに追加(=表示しない)
const skip = []
if (!a){
  skip.push(/(^|\/)\./)
}

await tree(resolve(Deno.cwd(), String(dir)), "",{
    maxDepth:L,
    includeFiles:!d,
    skip,
  });
// Deno.cwd()でカレントパス取得
// String(dir)ってなんだ あってもなくても挙動変わらないけど
