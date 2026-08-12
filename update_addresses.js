const fs = require('fs');
const path = require('path');

const OLD_TOKEN = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const OLD_AMM = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

const NEW_TOKEN = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
const NEW_AMM = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";

const DIRS_TO_SCAN = ['server', 'client', 'blockchain/scripts'];

function walkAndReplace(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.next')) {
        walkAndReplace(fullPath);
      }
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx') || fullPath.endsWith('.sol')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(OLD_TOKEN) || content.includes(OLD_AMM)) {
        content = content.replace(new RegExp(OLD_TOKEN, 'gi'), NEW_TOKEN);
        content = content.replace(new RegExp(OLD_AMM, 'gi'), NEW_AMM);
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

for (const dir of DIRS_TO_SCAN) {
  walkAndReplace(path.join(__dirname, dir));
}
console.log("Done.");
