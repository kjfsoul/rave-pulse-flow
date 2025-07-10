import path from 'path';
import { getNextPendingTask, updateTaskStatus, requeueTask } from './supabaseClient';
import { submitPromptToClaude } from './claudeClient';
import { validateCode } from './validation';
import { deployCode } from './deploy';
import { error } from 'console';

const MAX_RETRIES = 3;

async function runAgentLoop() {
  while (true) {
    const task = await getNextPendingTask();

    if (!task) {
      console.log('No pending tasks. Sleeping for 1 minute...');
      await new Promise((r) => setTimeout(r, 60000));
      continue;
    }

    console.log(`Processing task: ${task.id} - ${task.description}`);

    await updateTaskStatus(task.id, 'in_progress');

    // Fill prompt template
    const prompt = task.promptTemplate
      .replace(/{{description}}/g, task.description)
      .replace(/{{lastResult}}/g, task.lastResult ?? '');

    let response: string;

    try {
      response = await submitPromptToClaude(prompt);
    } catch (error: any) {
      await updateTaskStatus(task.id, 'failed', `API error: ${error.message || error}`);
      continue;
    }

    // Extract code block(s) from response (support multiple code blocks)
    // This regex matches all code blocks with optional language specifier
    const codeBlocks = [...response.matchAll(/```
(?:ts|typescript)?\n([\s\S]*?)
```/gi)];
    const code = codeBlocks.length > 0 ? codeBlocks.map(m => m[1]).join('\n\n') : response;

    // Save code temporarily
    const tempFilePath = path.resolve(__dirname, 'generatedCode.ts');
    await deployCode('generatedCode.ts', code);

    const isValid = await validateCode(tempFilePath);

    if (isValid) {
      await updateTaskStatus(task.id, 'completed', response);
      console.log(`Task ${task.id} completed.`);
    } else {
      task.lastResult = response;
      task.retries++;

      if (task.retries >= MAX_RETRIES) {
        await updateTaskStatus(task.id, 'failed', response);
        console.error(`Task ${task.id} failed after ${MAX_RETRIES} retries.`);
        // TODO: Notify human via email/slack here
      } else {
        await requeueTask(task);
        console.log(`Task ${task.id} requeued for retry #${task.retries}.`);
      }
    }
  }
}

runAgentLoop();import path from 'path';
import { getNextPendingTask, updateTaskStatus, requeueTask } from './supabaseClient';
import { submitPromptToClaude } from './claudeClient';
import { validateCode } from './validation';
import { deployCode } from './deploy';

const MAX_RETRIES = 3;

async function runAgentLoop() {
  while (true) {
    const task = await getNextPendingTask();

    if (!task) {
      console.log('No pending tasks. Sleeping for 1 minute...');
      await new Promise((r) => setTimeout(r, 60000));
      continue;
    }

    console.log(`Processing task: ${task.id} - ${task.description}`);

    await updateTaskStatus(task.id, 'in_progress');

    // Fill prompt template
    const prompt = task.promptTemplate
      .replace(/{{description}}/g, task.description)
      .replace(/{{lastResult}}/g, task.lastResult ?? '');

    let response: string;

    try {
      response = await submitPromptToClaude(prompt);
    } catch (error: any) {
      await updateTaskStatus(task.id, 'failed', `API error: ${error.message || error}`);
      continue;
    }

    // Extract code block(s) from response (support multiple code blocks)
    // This regex matches all code blocks with optional language specifier
    const codeBlocks = [...response.matchAll(/```(?:ts|typescript)?\n([\s\S]*?)```/gi)];
    const code = codeBlocks.length > 0 ? codeBlocks.map(m => m[1]).join('\n\n') : response;

    // Save code temporarily
    const tempFilePath = path.resolve(__dirname, 'generatedCode.ts');
    await deployCode('generatedCode.ts', code);

    const isValid = await validateCode(tempFilePath);

    if (isValid) {
      await updateTaskStatus(task.id, 'completed', response);
      console.log(`Task ${task.id} completed.`);
    } else {
      task.lastResult = response;
      task.retries++;

      if (task.retries >= MAX_RETRIES) {
        await updateTaskStatus(task.id, 'failed', response);
        console.error(`Task ${task.id} failed after ${MAX_RETRIES} retries.`);
        // TODO: Notify human via email/slack here
      } else {
        await requeueTask(task);
        console.log(`Task ${task.id} requeued for retry #${task.retries}.`);
      }
    }
  }
}

runAgentLoop();
