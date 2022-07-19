// este script busca filtros de angular translate, le agrega un prefijo,
// los extrae para poder pegarlos en el archivo de traducciones
// y agrega el prefijo en el html.
// Importante: usar node v16
// uso:
// node extractTranslateFilter.js PATH_TO_HTML PREFIX [OPTION]
// OPTION
// p = prints html to console
// w = writes html file

let fs = require("fs");
const targetHtmlFilePath = process.argv[2];
const prefix = process.argv[3];
const option = process.argv[4];
console.log("targetHtmlFilePath", targetHtmlFilePath);
console.log("prefix", prefix);
const targetHtmlFile = fs.readFileSync(targetHtmlFilePath, {
  encoding: "UTF-8",
});
const matchTranslateKeyRegex =
  /(?<={{\s*['"])[\w.]+(?=['"]\s*\|\s*translate.*}})/g;
let matches = targetHtmlFile.match(matchTranslateKeyRegex);
console.log("matches", matches);

//sacar los que ya tienen el prefix

matches = matches.filter((value) => !value.startsWith(prefix));
console.log("matches filtardo", matches);

matches = matches.map((value) => `"${prefix}${value}": "@:${value}",`);

// aca imprimo lo que vamos a poner en el archivo de traduccion
console.log(
  "matches filtrado con el prefijo nuevo\n",
  uniq(matches).sort().join("\n")
);

const repleacedHtmlFile = targetHtmlFile.replace(
  matchTranslateKeyRegex,
  (matched) => {
    return matched.startsWith(prefix) ? matched : `${prefix}${matched}`;
  }
);

//escribo al html si option es w
if (option === "w") {
  console.log("Writing to file: " + targetHtmlFilePath);
  fs.writeFileSync(targetHtmlFilePath, repleacedHtmlFile, {
    encoding: "UTF-8",
  });
} else if (option === "p") {
  console.log("output:");
  console.log(repleacedHtmlFile);
} else {
  console.log("File not written.");
}

//saca valores repetidos del array
function uniq(a) {
  var seen = {};
  return a.filter(function (item) {
    return seen.hasOwnProperty(item) ? false : (seen[item] = true);
  });
}
