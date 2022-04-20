import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parseMarkdown } from "../utils/markdown.mjs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentsDir = path.join(
  __dirname,
  "../../../polaris-react/src/components"
);
const examplesDir = path.join(__dirname, "../pages/generated-examples");

let components = [];

const componentDirectories = fs.readdirSync(componentsDir, "utf-8");

// Loop through the components directory
for (let i = 0; i < componentDirectories.length; i++) {
  const componentDirectoryName = componentDirectories[i];
  const componentDirectoryPath = path.join(
    componentsDir,
    componentDirectoryName
  );
  const isDir = fs.lstatSync(componentDirectoryPath).isDirectory();

  if (isDir) {
    // Attempt to find the readme file
    const readmePath = path.join(componentDirectoryPath, "README.md");
    const readmeExists = fs.existsSync(readmePath);

    if (readmeExists) {
      // Parse the file's markdown content
      const readmeFileContent = fs.readFileSync(readmePath, "utf-8");
      const markdownFile = parseMarkdown(readmeFileContent);

      // Hide the iOS and Android examples for now
      markdownFile.readme = markdownFile.readme.replaceAll(
        /<!-- content-for: (android|ios) -->[^<]+<!-- \/content-for -->/gm,
        () => ""
      );

      let i = 1;
      markdownFile.readme = markdownFile.readme
        // This is a bit bananas, but it makes regexing much easier.
        // Replace code ticks with an emoji...
        .replace(/```/g, "🔥")
        // Extract any content (=code) between emojis
        .replaceAll(/🔥[^🔥]+🔥/gim, (match) => {
          // If the code contains custom imports (like react-router)
          // or something, we actually don't want to render it, so
          // we just undo the above and return the code as it was.
          if (match.includes("import")) {
            return match.replace(/🔥/g, "```");
          }

          // Generate a friendly id for the example
          const exampleId = `${componentDirectoryName}-${i}`;
          i++;

          // Remove some content from the beginning and end of the example
          let code = match.slice(4).slice(1, -2).trim();

          // Create a list of all the components in the code.
          let componentsInCode = {};
          const componentsRegex = /<([A-Z][A-Za-z]+)/g;
          while ((match = componentsRegex.exec(code)) !== null) {
            if (match[1] !== "AppProvider") {
              componentsInCode[match[1]] = true;
            }
          }

          // Create a list of all the polaris icons in the code.
          let iconsInCode = {};
          const iconsRegex = /[A-Za-z]+(Minor|Major)/g;
          while ((match = iconsRegex.exec(code)) !== null) {
            iconsInCode[match[0]] = true;
          }

          // Create a list of all the react hooks in the code.
          let reactHooksInCode = {};
          const callbacksRegex = / use[A-Z][a-z]+/g;
          while ((match = callbacksRegex.exec(code)) !== null) {
            reactHooksInCode[match[0].trim()] = true;
          }

          // Before we continue, add wrapper elements around the
          // code so that it works correctly.
          code = decorateExample(code);

          // Add import statements at the top of the file
          if (!code.includes("import ")) {
            const importStatements = [];

            if (Object.keys(componentsInCode).length > 0) {
              importStatements.push(
                `import { AppProvider, ${Object.keys(
                  componentsInCode
                )} } from "@shopify/polaris";`
              );
            }

            if (Object.keys(iconsInCode).length > 0) {
              importStatements.push(
                `import { ${Object.keys(
                  iconsInCode
                )} } from "@shopify/polaris-icons";`
              );
            }

            if (Object.keys(reactHooksInCode).length > 0) {
              importStatements.push(
                `import { ${Object.keys(reactHooksInCode)} } from "react";`
              );
            }

            importStatements.push(
              `import '@shopify/polaris/build/esm/styles.css';`
            );

            importStatements.push(
              `import translations from '@shopify/polaris/locales/en.json';`
            );

            code = `${importStatements.join("\n")}
${code}`;
          }

          // Write the resulting code to a file
          const exampleFilePath = `${examplesDir}/${exampleId}.jsx`;
          fs.writeFileSync(exampleFilePath, code);

          // Inject an iframe into the returned markdown
          return `<iframe src="/generated-examples/${exampleId}" style="width: 100%; height: 400px;" loading="lazy"></iframe>`;
        });

      components.push(markdownFile);
    }
  }
}

// Write meta file (can be included in next.js bundle)
const metaFilePath = path.join(__dirname, "../data/components.json");
fs.writeFileSync(
  metaFilePath,
  JSON.stringify(
    components.map(({ readme, ...rest }) => rest),
    null,
    2
  )
);

// Write readme file (only used in getStaticProps)
const readmes = {};
components.forEach(
  ({ frontMatter, readme }) => (readmes[frontMatter.name] = readme)
);
const readmeFilePath = path.join(__dirname, "../data/components.readme.json");
fs.writeFileSync(readmeFilePath, JSON.stringify(readmes, null, 2));

// The code examples in the markdown files doesn't work
// by themselves. They need some additional wrapper code
// to run. This function provides that code.
function decorateExample(code) {
  // Extract the name of the function that wrap's the component
  const functionName = code.match(/function ([A-Z][A-Za-z]+)/);

  // Add some styles to the examples
  const styles = `
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "0 50px",
  `.replace(/\n\t/g, "");

  // Some examples only contain a component function. Add some code
  // that actually renders that component.
  if (code.startsWith("function")) {
    return `${code}

function Example() {
  return (
    <AppProvider i18n={translations}>
      <div
        style={{${styles}}}
      >
        <${functionName[1]} />
      </div>
    </AppProvider>
  );
}

export default Example;
    `;
  }
  // Some examples contain an JSX element. Wrap that
  // element in a function and export it.
  else {
    return `
function Example() {
  return (
    <AppProvider i18n={translations}>
      <div
        style={{${styles}}}
      >
        ${code}
      </div>
    </AppProvider>
  );
}

export default Example;
    `;
  }
}