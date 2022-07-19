const fs = require("fs");
// todos los tags de html
const htmlTags = [
  "a",
  "abbr",
  "acronym",
  "address",
  "applet",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "basefont",
  "bdi",
  "bdo",
  "bgsound",
  "big",
  "blink",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "center",
  "cite",
  "code",
  "col",
  "colgroup",
  "content",
  "data",
  "datalist",
  "dd",
  "decorator",
  "del",
  "details",
  "dfn",
  "dir",
  "div",
  "dl",
  "dt",
  "element",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "font",
  "footer",
  "form",
  "frame",
  "frameset",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "isindex",
  "kbd",
  "keygen",
  "label",
  "legend",
  "li",
  "link",
  "listing",
  "main",
  "map",
  "mark",
  "marquee",
  "menu",
  "menuitem",
  "meta",
  "meter",
  "nav",
  "nobr",
  "noframes",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "plaintext",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "shadow",
  "small",
  "source",
  "spacer",
  "span",
  "strike",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "tt",
  "u",
  "ul",
  "var",
  "video",
  "wbr",
  "xmp",
];

const targetHtmlFilePath = process.argv[2];
const option = process.argv[3];
const targetHtmlFile = fs.readFileSync(targetHtmlFilePath, {
  encoding: "UTF-8",
});
// esto matchea los tags de html que solo adentro tienen {{"KEY" | translate}}
const matchTranslateKeyRegex =
  /(<\s*)([\w-]*)(\s*[^<]*)(>\s*){{\s*['"]([\w.]+)['"]\s*\|\s*translate\s*}}(\s*<\/[^>]*>)/g;
let matches = targetHtmlFile.match(matchTranslateKeyRegex);
console.log("matches", matches);
let replacementsDone = 0;
console.log("Non HTML tags found:");
const repleacedHtmlFile = targetHtmlFile.replace(
  matchTranslateKeyRegex,
  (match, p1, p2, p3, p4, p5, p6) => {
    let tag = p2;
    // si es un tag estandar de html lo reemplazamos sino lo dejamos como estaba
    if (htmlTags.includes(tag)) {
      replacementsDone++;
      return `${p1}${p2}${p3} translate${p4}${p5}${p6}`;
    } else {
      console.log(tag);
      return match;
    }
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
console.log("Matches: ", matches.length);
console.log("Repleacements done: ", replacementsDone);
