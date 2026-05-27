const fs = require('fs');
const path = require('path');
let c = fs.readFileSync('/opt/vi-smart-api/index.js', 'utf8');

c = c.replace(
  "const destPath = path.join(batchDir, file.filename);\n        fs.renameSync(file.path, destPath);\n        material.file_path = destPath;\n      } catch (moveErr) {\n        console.error(\"Failed to move material file:\", moveErr.message);",
  "const destPath = path.join(batchDir, path.basename(file.path));\n        fs.copyFileSync(file.path, destPath);\n        try { fs.unlinkSync(file.path); } catch {}\n        material.file_path = destPath;\n      } catch (moveErr) {\n        console.error(\"Failed to move material file:\", moveErr.message);"
);

fs.writeFileSync('/opt/vi-smart-api/index.js', c);
console.log('Fix v2 applied');
