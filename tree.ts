import { join, resolve } from "https://deno.land/std@0.100.0/path/mod.ts";

const tree = async (root: string) => {
  for await (const entry of Deno.readDir(root)) {
      // readDirでは一階層したのファイルパスだけ
    console.log(join(root, entry.name));
  }
};

const dir = ".";
await tree(resolve(Deno.cwd(), String(dir)));
// Deno.cwd()でカレントパス取得
// String(dir)ってなんだ あってもなくても挙動変わらないけど
