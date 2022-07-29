const fs = require("fs");
const prompt = require("prompt");
const { v4: uuidv4 } = require("uuid");

const targetHtmlFilePath = process.argv[2];
const prefix = process.argv[3];
const option = process.argv[4];
const skipCode = "Q";
console.log("target Html File Path: ", targetHtmlFilePath);
console.log("prefix:", prefix);
const targetHtmlFile = fs.readFileSync(targetHtmlFilePath, {
  encoding: "UTF-8",
});

// machea todo lo que esta entre tags
const matchInBetweenTagsRegex = />\s*(?=[^<\s])([^>]*?)</g;
let matches = targetHtmlFile.match(matchInBetweenTagsRegex);
console.log("matches", matches);

const interpolationRegex = /{{.+}}/g;
let counter = 0;
let keys = {};
let replacedHtmlFile = targetHtmlFile.replace(
  matchInBetweenTagsRegex,
  (matched, p1) => {
    if (matched.search(interpolationRegex) == -1) {
      counter++;
      //console.log("counter", counter);
      let newKey = uuidv4();
      keys[newKey] = { value: p1.replace(/\s+/g, " "), type: "HTML" }; // si hay mucho white space lo cambio por uno solo espacio y lo meto el el objeto
      return `>${newKey}<`; // lo reemplazo en el archivo por un uuid
    } else {
      // si tiene una interpolación no lo tocamos
      return matched;
    }
  }
);

// busca y reemplaza atributos
let replaceAttributes = ["placeholder", "title"];
const matchHtmlAttributes = /(?<=<\w+[\s\S]*)(?:([\w-]+)="(.*?)")/g;
replacedHtmlFile = replacedHtmlFile.replace(
  matchHtmlAttributes,
  (matched, p1, p2) => {
    if (
      matched.search(interpolationRegex) == -1 &&
      replaceAttributes.includes(p1)
    ) {
      counter++;
      //console.log("counter", counter);
      let newKey = uuidv4();
      keys[newKey] = { value: p2.replace(/\s+/g, " "), type: "ATTRIBUTE" }; // si hay mucho white space lo cambio por uno solo espacio
      return `${p1}="${newKey}"`;
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
    // si no tiene el prefijo y no es skipCode se lo agregamos
    if (!result[key].startsWith(prefix) && result[key] !== skipCode)
      result[key] = prefix + result[key];
  }
  console.log("result", result);
  // REEMPLAZAR en el archivo

  for (let key in result) {
    // reemplazo con lo original si era skip code
    if (result[key] === skipCode) {
      replacedHtmlFile = replacedHtmlFile.replace(key, keys[key].value); // podríamos usar mejores nombres
    } else {
      let replaceVale = "";
      switch (keys[key].type) {
        case "HTML":
          replaceVale = `{{ '${result[key]}' | translate }}`;
          break;
        case "ATTRIBUTE":
          replaceVale = `{{ '${result[key]}' | translate }}`;
          break;
        default:
          replaceVale = `{{ '${result[key]}' | translate }}`;
          break;
      }
      replacedHtmlFile = replacedHtmlFile.replace(key, replaceVale);
    }
  }

  // generar lo que va en el json
  let finalKeys = {};
  for (let key in result) {
    finalKeys[result[key]] = keys[key].value;
  }

  //escribo al html si option es w
  if (option === "w") {
    console.log("Writing to file: " + targetHtmlFilePath);
    fs.writeFileSync(targetHtmlFilePath, replacedHtmlFile, {
      encoding: "UTF-8",
    });
  } else if (option === "p") {
    console.log("output:");
    console.log(replacedHtmlFile);
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
  let count = 0;
  let length = Object.getOwnPropertyNames(keys).length;
  for (let key in keys) {
    count++;
    schema.properties[key] = {
      description: `[${count}/${length}] Set property for "${keys[key].value}"\nNew Key (Enter ${skipCode} to skip)`,
      default: key,
      pattern: /^[\w._-]*$/,
      message: "Only alphanumeric characters, '-', '_' and '.' are allowed.",
    };
  }
  return schema;
}
