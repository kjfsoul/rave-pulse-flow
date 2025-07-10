import { exec } from "child_process";

export async function validateCode(filePath: string): Promise<boolean> {
  return new Promise((resolve) => {
    exec(
      `eslint "${filePath}" && tsc --noEmit "${filePath}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("Validation failed:", stderr);
          resolve(false);
        } else {
          console.log("Validation passed");
          resolve(true);
        }
      }
    );
  });
}
