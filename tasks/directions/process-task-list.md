# Task List Management

Guidelines for managing task lists in markdown files to track progress on completing a PRD

## Task Implementation

- **One sub-task at a time:** Do **NOT** start the next sub‑task until you ask the user for permission and they say "yes" or "y"
- **Completion protocol:**

  1. When you finish a **sub-task**, follow this sequence:

  - Immediately mark it as completed by changing `[ ]` to `[x]`.
  - Run `pnpm lint --fix` on any files that have changed and try to fix any errors that are not auto-fixed
  - If **linter errors** remain, tell the user, and wait for their go-ahead
  - Run the full suite of unit tests (`pnpm test`)
  - If there are **failing tests**, tell the user why the test is failing and help them to appropriately update the test to pass, then wait for the user's go-ahead
  - **Only if all tests pass**: Stage changes (`git add .`)
  - **Clean up**: Remove any temporary files and temporary code before committing
  - **Commit**: Use a descriptive commit message that:

    - Uses conventional commit format (`feat:`, `fix:`, `refactor:`, etc.)
    - Summarizes what was accomplished in the parent task
    - Lists key changes and additions
    - References the subtask number, parent task number, and PRD context
    - **References the Github Issue number** (found in the parent task description, e.g., `(#123)`)
    - **Formats the message as a single-line command using `-m` flags**, e.g.:

      ```
      git commit -m "feat: add payment validation logic" -m "- Validates card type and expiry" -m "- Adds unit tests for edge cases" -m "Related to #123"
      ```

      **Note:** The issue number `#123` should be taken from the parent task where it appears as `(#123)` after the task description.

  2. Once all the subtasks are marked completed and changes have been committed, mark the **parent task** as completed.

- Stop after each sub‑task and wait for the user's go‑ahead.

## Task List Maintenance

1. **Update the task list as you work:**

   - Mark tasks and subtasks as completed (`[x]`) per the protocol above.
   - Add new tasks as they emerge.

2. **Maintain the "Relevant Files" section:**

   - List every file created or modified.
   - Give each file a one‑line description of its purpose.

3. **GitHub Issue Numbers:**
   - Issue numbers are automatically added to parent task files by the `create-hierarchical-issues.sh` script
   - They appear in the format: `- [ ] 1.0 Parent task description (#123)`
   - Use these numbers in commit messages to reference the parent issue
   - The format `Related to #123` in commit messages will link to the corresponding GitHub issue
   - Only parent tasks get issue numbers; subtasks are tracked within the parent issue

## AI Instructions

When working with task lists, the AI must:

1. Regularly update the task list file after finishing any significant work.
2. Follow the completion protocol:
   - Mark each finished **sub‑task** `[x]`.
   - Mark the **parent task** `[x]` once **all** its subtasks are `[x]`.
3. Add newly discovered tasks.
4. Keep "Relevant Files" accurate and up to date.
5. Before starting work, check which sub‑task is next.
6. After implementing a sub‑task, update the file and then pause for user approval.
7. **Extract GitHub issue numbers** from the parent task (format: `(#123)`) and include them in commit messages using `Related to #123`.
