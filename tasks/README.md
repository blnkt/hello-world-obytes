## Workflow: From Idea to Implemented Feature 💡➡️💻

Here's the step-by-step process using the `.md` files in this repository:

### 1️⃣ Create a Product Requirement Document (PRD)

First, lay out the blueprint for your feature. A PRD clarifies what you're building, for whom, and why.

You can create a lightweight PRD directly within your AI tool of choice:

1. Ensure you have the `create-prd.md` file from this repository accessible.
2. In your AI tool, initiate PRD creation:

   ```text
   Use @create-prd.md
   Here's the feature I want to build: [Describe your feature in detail]
   Reference these files to help you: [Optional: @file1.py @file2.ts]
   ```

   ![Example of initiating PRD creation](https://pbs.twimg.com/media/Go6DDlyX0AAS7JE?format=jpg&name=large)

### 2️⃣ Generate Your Task List from the PRD

With your PRD drafted (e.g., `MyFeature-PRD.md`), the next step is to generate a detailed, step-by-step implementation plan for your AI Developer.

1. Ensure you have `generate-tasks.md` accessible.
2. In your AI tool, use the PRD to create tasks:

   ```text
   Now take @MyFeature-PRD.md and create tasks using @generate-tasks.md
   ```

   _(Note: Replace `@MyFeature-PRD.md` with the actual filename of the PRD you generated in step 1.)_

   ![Example of generating tasks from PRD](https://pbs.twimg.com/media/Go6FITbWkAA-RCT?format=jpg&name=medium)

### 3️⃣ Examine Your Task List

You'll now have a well-structured task list, often with tasks and sub-tasks, ready for the AI to start working on. This provides a clear roadmap for implementation.

![Example of a generated task list](https://pbs.twimg.com/media/Go6GNuOWsAEcSDm?format=jpg&name=medium)

### 4️⃣ Instruct the AI to Work Through Tasks (and Mark Completion)

To ensure methodical progress and allow for verification, we'll use `process-task-list.md`. This command instructs the AI to focus on one task at a time and wait for your go-ahead before moving to the next.

1. Create or ensure you have the `process-task-list.md` file accessible.
2. In your AI tool, tell the AI to start with the first task (e.g., `1.1`):

   ```text
   Please start on task 1.1 and use @process-task-list.md
   ```

   *(Important: You only need to reference `@process-task-list.md` for the *first* task. The instructions within it guide the AI for subsequent tasks.)*

   The AI will attempt the task and then prompt you to review.

   ![Example of starting on a task with process-task-list.md](https://pbs.twimg.com/media/Go6I41KWcAAAlHc?format=jpg&name=medium)

### 5️⃣ Review, Approve, and Progress ✅

As the AI completes each task, you review the changes.

- If the changes are good, simply reply with "yes" (or a similar affirmative) to instruct the AI to mark the task complete and move to the next one.
- If changes are needed, provide feedback to the AI to correct the current task before moving on.

You'll see a satisfying list of completed items grow, providing a clear visual of your feature coming to life!

![Example of a progressing task list with completed items](https://pbs.twimg.com/media/Go6KrXZWkAA_UuX?format=jpg&name=medium)

While it's not always perfect, this method has proven to be a very reliable way to build out larger features with AI assistance.

### Video Demonstration 🎥

If you'd like to see this in action, I demonstrated it on [Claire Vo's "How I AI" podcast](https://www.youtube.com/watch?v=fD4ktSkNCw4).

![Demonstration of AI Dev Tasks on How I AI Podcast](https://img.youtube.com/vi/fD4ktSkNCw4/maxresdefault.jpg)

### Cursor

Cursor users can follow the workflow described above, using the `.md` files directly in the Agent chat:

1. Ensure you have the files from this repository accessible
2. In Cursor's Agent chat, reference files with `@` (e.g., `@create-prd.md`)
3. Follow the 5-step workflow as outlined above
4. **MAX Mode for PRDs:** Using MAX mode in Cursor for PRD creation can yield more thorough results if your budget supports it

## 💡 Tips for Success

- **Be Specific:** The more context and clear instructions you provide (both in your initial feature description and any clarifications), the better the AI's output will be.
- **Use a Capable Model:** The free version of Cursor currently uses less capable AI models that often struggle to follow the structured instructions in this workflow. For best results, consider upgrading to the Pro plan to ensure consistent, accurate task execution.
- **MAX Mode for PRDs:** As mentioned, using MAX mode in Cursor for PRD creation (`create-prd.mdc`) can yield more thorough and higher-quality results if your budget supports it.
- **Correct File Tagging:** Always ensure you're accurately tagging the PRD filename (e.g., `@MyFeature-PRD.md`) when generating tasks.
- **Patience and Iteration:** AI is a powerful tool, but it's not magic. Be prepared to guide, correct, and iterate. This workflow is designed to make that iteration process smoother.
