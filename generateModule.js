const fs = require('fs');
const path = require('path');
const { upperFirst } = require('lodash');

function replacePlaceholders(content, moduleName) {
  const moduleTitleCase = upperFirst(moduleName);

  return content
    .replace(/template/g, moduleName)
    .replace(/Template/g, moduleTitleCase);
}

function generateModule(moduleName) {
  const templateDir = path.join(__dirname, 'src/modules/v1/template');
  const newModuleDir = path.join(__dirname, `src/modules/v1/${moduleName}`);

  fs.mkdirSync(newModuleDir);

  fs.readdirSync(templateDir).forEach((file) => {
    const filePath = path.join(templateDir, file);
    const fileStat = fs.statSync(filePath);

    if (fileStat.isFile()) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const modifiedContent = replacePlaceholders(fileContent, moduleName);
      const newFileName = replacePlaceholders(file, moduleName);
      fs.writeFileSync(path.join(newModuleDir, newFileName), modifiedContent);
    } else if (fileStat.isDirectory()) {
      const newDirectoryName = replacePlaceholders(file, moduleName);
      const newDirectoryPath = path.join(newModuleDir, newDirectoryName);
      fs.mkdirSync(newDirectoryPath);
      const filesInDirectory = fs.readdirSync(filePath);
      filesInDirectory.forEach((subFile) => {
        const subFilePath = path.join(filePath, subFile);
        const subFileStat = fs.statSync(subFilePath);
        if (subFileStat.isFile()) {
          const subFileContent = fs.readFileSync(subFilePath, 'utf-8');
          const modifiedSubFileContent = replacePlaceholders(
            subFileContent,
            moduleName,
          );
          const newSubFileName = replacePlaceholders(subFile, moduleName);
          fs.writeFileSync(
            path.join(newDirectoryPath, newSubFileName),
            modifiedSubFileContent,
          );
        }
      });
    }
  });

  console.log(`Module "${moduleName}" created successfully.`);
}

// Usage: node generateModule.ts moduleName
const moduleName = process.argv[2];
if (!moduleName) {
  console.error('Please provide a module name.');
  process.exit(1);
}

generateModule(moduleName);
