import * as glob from 'glob';
import fs from 'fs';

const treg = /\bt\('([^']*?)'\)/g;

let substrLen = './src/editor/'.length;

let sharedKeys = new Map<string, string>();
let allFiles = new Map<string, string[]>();

function main() {
  let files: string[] = glob.sync(`./src/editor/**/*.{ts,tsx}`);
  for (let path of files) {
    let data = fs.readFileSync(path, 'utf8');
    if (data.includes('translateEditor as t')) {
      let comment = path.substring(substrLen);
      let keys: string[] = [];
      for (let match of data.matchAll(treg)) {
        let key = match[1];
        if (sharedKeys.has(key)) {
          let previousComment = sharedKeys.get(key);
          if (!previousComment.includes(comment)) {
            sharedKeys.set(key, `${previousComment} & ${comment}`);
          }
        } else {
          sharedKeys.set(key, comment);
          keys.push(key);
        }
      }
      if (keys.length) {
        allFiles.set(comment, keys);
      }
    }
  }
  let out: string[] = [];
  for (let [key, comment] of sharedKeys) {
    if (comment.includes(' & ')) {
      out.push(
        `# ${comment
          .split(' & ')
          .map((str: string) => str.split('/').pop())
          .join(' & ')}\n'${key}': '${key}'`
      );
    } else {
      // remove it from shared keys
      sharedKeys.delete(key);
    }
  }
  for (let [comment, keys] of allFiles) {
    let uniqueKeys = keys.filter((key: string) => !sharedKeys.has(key));
    if (uniqueKeys.length) {
      out.push(`\n# ${comment}`);
      for (let key of uniqueKeys) {
        out.push(`'${key}': '${key}'`);
      }
    }
  }

  fs.writeFileSync('./src/editor/i18n/en.yaml', out.join('\n'));
}

main();
