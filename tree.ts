// vim: set shiftwidth=2:
import { join, resolve } from "https://deno.land/std@0.100.0/path/mod.ts";

// 連結したパスをオブジクトに含め、配列の順序を辞書順に直しておく
export interface TreeEntry extends Deno.DirEntry{
    path:string;
}

const tree = async (root: string) => {
  const entries: TreeEntry[] = [];
  for await (const entry of Deno.readDir(root)) {
    // readDirでは一階層したのファイルパスだけ
    // console.log(join(root, entry.name));
    const treeEntry = { ...entry, path: join(root, entry.name) }
    //                  ^^^ ...entryとは？
    entries.push(treeEntry)
  }

  const sortedEntries = entries.sort((a,b)=>
    a.name.toLowerCase() > b.name.toLowerCase() ? 1:-1
  );

  for await (const entry of sortedEntries) {
    console.log(entry.path)
    // entryがディレクトリだったら再帰的にtree呼び出し
    if (entry.isDirectory && entry.name !== ".git"){ // ignore .git directory
      await tree(entry.path)
    }
  }
};

const dir = ".";
await tree(resolve(Deno.cwd(), String(dir)));
// Deno.cwd()でカレントパス取得
// String(dir)ってなんだ あってもなくても挙動変わらないけど
