let fs = require("fs");
var prompt = require("prompt");

const targetHtmlFilePath = process.argv[2];
const prefix = process.argv[3];
const option = process.argv[4];
console.log("target Html File Path: ", targetHtmlFilePath);
console.log("prefix:", prefix);
const targetHtmlFile = fs.readFileSync(targetHtmlFilePath, {
  encoding: "UTF-8",
});

// matchea todo lo que esta entre tags
const matchInBetweenTagsRegex = />(?=[^<\s])((.|\s)*?)</g;
let matches = targetHtmlFile.match(matchInBetweenTagsRegex);
console.log("matches", matches);

const interploationRegex = /{{.+}}/g;
let counter = 0;
let keys = {};
let repleacedHtmlFile = targetHtmlFile.replace(
  matchInBetweenTagsRegex,
  (matched, p1) => {
    if (matched.search(interploationRegex) == -1) {
      counter++;
      //console.log("counter", counter);
      let newKey = `${prefix}KEY${counter}`;
      keys[newKey] = p1.replace(/\s+/g, " "); // si hay mucho white space lo cambio por uno solo espacio
      return `> {{ '${newKey}' | translate }} <`;
    } else {
      return matched;
    }
  }
);

// busca y reemplaza attributos
let replaceAttributes = ["placeholder", "title"];
const matchHtmlAttributes = /(?<=<\w+[\s\S]*)(?:([\w-]+)="(.*?)")/g;
repleacedHtmlFile = repleacedHtmlFile.replace(
  matchHtmlAttributes,
  (matched, p1, p2) => {
    if (
      matched.search(interploationRegex) == -1 &&
      replaceAttributes.includes(p1)
    ) {
      counter++;
      //console.log("counter", counter);
      let newKey = `${prefix}KEY${counter}`;
      keys[newKey] = p2.replace(/\s+/g, " "); // si hay mucho white space lo cambio por uno solo espacio
      return `${p1}="{{ '${newKey}' | translate }}"`;
    } else {
      return matched;
    }
  }
);

//console.log("keys", keys);
let schema = createSchemaForPrompt(keys);
//console.log("schema", schema);

prompt.start();

// busco input del usuario
prompt.get(schema, (err, result) => {
  //console.log("resultado de las preguntas");
  for (let key in result) {
    if (!result[key].startsWith(prefix)) result[key] = prefix + result[key];
  }
  //console.log("result", result);

  // REEMPLAZAR con los nuevos keys

  for (let key in result) {
    repleacedHtmlFile = repleacedHtmlFile.replace(key, result[key]);
  }

  // generar lo que va en el json
  let finalKeys = {};
  for (let key in result) {
    finalKeys[result[key]] = keys[key];
  }

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
  console.log("Translate Keys for translation file:");
  console.log(JSON.stringify(finalKeys, null, "  "));
});

//saca valores repetidos del array
function uniq(a) {
  var seen = {};
  return a.filter(function (item) {
    return seen.hasOwnProperty(item) ? false : (seen[item] = true);
  });
}

function createSchemaForPrompt(keys) {
  let schema = { properties: {} };
  for (let key in keys) {
    schema.properties[key] = {
      description: `Set property for "${keys[key]}"`,
      default: key,
      pattern: /^[\w._-]*$/,
      message: "Only alphanumeric characters, '-', '_' and '.' are allowed.",
    };
  }
  return schema;
}
