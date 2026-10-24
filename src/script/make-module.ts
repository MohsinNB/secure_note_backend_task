// src/script/make-module.ts
import * as fs from "fs";
import * as path from "path";

// Retrieve module name from command line arguments
const moduleName: string | undefined = process.argv[2];

if (!moduleName) {
  console.error(
    "Error: Module name is required. Usage: npm run makeModule <module_name>",
  );
  process.exit(1);
}

const lowerName: string = moduleName.toLowerCase();
const PascalName: string =
  lowerName.charAt(0).toUpperCase() + lowerName.slice(1);

// Directory paths
const baseModuleDir: string = path.join(process.cwd(), "src", "modules");
const targetDir: string = path.join(baseModuleDir, lowerName);

// 1. Ensure the base module directory exists
if (!fs.existsSync(baseModuleDir)) {
  fs.mkdirSync(baseModuleDir, { recursive: true });
}

// 2. Prevent overwriting if module directory already exists
if (fs.existsSync(targetDir)) {
  console.error(`Error: Module "${lowerName}" already exists at: ${targetDir}`);
  process.exit(1);
}

// File templates
const templates: Record<string, string> = {
  [`${lowerName}.interface.ts`]: `export interface I${PascalName} {
  // Define interface properties
}
`,

  [`${lowerName}.model.ts`]: `import { Schema, model } from 'mongoose';
import { I${PascalName} } from './${lowerName}.interface';

const ${lowerName}Schema = new Schema<I${PascalName}>(
  {
    // Define schema fields
  },
  {
    timestamps: true,
  }
);

// Indexes
// ${lowerName}Schema.index({ ... });

export const ${PascalName} = model<I${PascalName}>('${PascalName}', ${lowerName}Schema);
`,

  [`${lowerName}.service.ts`]: `import { ${PascalName} } from './${lowerName}.model';
import { I${PascalName} } from './${lowerName}.interface';

const create${PascalName}IntoDB = async (payload: I${PascalName}) => {
  const result = await ${PascalName}.create(payload);
  return result;
};

export const ${PascalName}Services = {
  create${PascalName}IntoDB,
};
`,

  [`${lowerName}.controller.ts`]: `import { Request, Response } from 'express';
import { ${PascalName}Services } from './${lowerName}.service';

const create${PascalName} = async (req: Request, res: Response) => {
  try {
    const result = await ${PascalName}Services.create${PascalName}IntoDB(req.body);
    res.status(201).json({
      success: true,
      message: '${PascalName} created successfully!',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create ${lowerName}',
      error,
    });
  }
};

export const ${PascalName}Controllers = {
  create${PascalName},
};
,
`,

  [`${lowerName}.route.ts`]: `import express from 'express';
import { ${PascalName}Controllers } from './${lowerName}.controller';

const router = express.Router();

router.post('/create-${lowerName}', ${PascalName}Controllers.create${PascalName});

export const ${PascalName}Routes = router;
`,
};

// Create target directory and write files
try {
  fs.mkdirSync(targetDir, { recursive: true });

  Object.entries(templates).forEach(([fileName, content]) => {
    const filePath = path.join(targetDir, fileName);
    fs.writeFileSync(filePath, content.trim() + "\n", "utf8");
    console.log(`Created: ${fileName}`);
  });

  console.log(
    `\nSuccess: Module "${PascalName}" created successfully at src/module/${lowerName}`,
  );
} catch (error) {
  console.error("Error: Failed to create module files.", error);
  process.exit(1);
}
