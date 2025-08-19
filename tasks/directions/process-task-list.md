# Task List Management

Guidelines for managing task lists in markdown files to track progress on completing a PRD

## File Naming Convention

- **PRD files:** `prd-[descriptive-feature-name].md` (input)
- **Task files:** `tasks-prd-[descriptive-feature-name].md` (this file)
- **Branch names:** `feature/prd-[prd-filename]`

**Example:**

- PRD: `prd-user-profile-editing.md`
- Tasks: `tasks-prd-user-profile-editing.md`
- Branch: `feature/prd-user-profile-editing`

## Related Workflows

This workflow is part of a larger development process:

1. **PRD Creation** (`@create-prd.md`) → Creates `prd-[feature-name].md`
2. **Task Generation** (`@generate-tasks.md`) → Creates `tasks-prd-[feature-name].md` from the PRD
3. **Task Implementation** (this workflow) → Implements the tasks using TDD workflow

**Prerequisites:** This workflow requires a task list file created using the `@generate-tasks.md` workflow.

## Branch Management

**Critical Requirement:** All work must be done on feature branches associated with PRDs.

### Branch Rules

- **Never work on main/master branch** for feature development
- **Each PRD gets its own feature branch:** `feature/[prd-filename]`
- **Branch naming:** Use the PRD filename as the branch name
  - Example: `prd-user-profile-editing.md` → `feature/prd-user-profile-editing`
- **Verify branch before starting work:**
  ```bash
  git branch --show-current
  # Should show: feature/[prd-filename]
  ```

### Branch Workflow

1. **Before starting any task:**

   - Ensure you're on the correct feature branch
   - If not, switch: `git checkout feature/[prd-filename]`
   - If branch doesn't exist, create it: `git checkout -b feature/[prd-filename]`

2. **During development:**

   - All commits must be on the feature branch
   - Never commit directly to main/master
   - Use descriptive commit messages with issue references

3. **When complete:**
   - Create pull request from feature branch to main
   - Include PRD reference in pull request description
   - Link related GitHub issues

## Task Implementation

- **One sub-task at a time:** Do **NOT** start the next sub‑task until you ask the user for permission and they say "yes" or "y"
- **TDD Workflow for each sub-task:**

  1. **Start with a failing test:**

     - Write a test that describes the expected behavior for the sub-task
     - The test should initially fail (red phase)
     - Run `pnpm test` to confirm the test fails as expected
     - Document what the test is verifying

  2. **Implement the minimal code to make the test pass:**

     - Write the minimal implementation needed to make the test pass (green phase)
     - Focus on the specific sub-task requirements
     - Run `pnpm test` to verify the test now passes

  3. **Refactor if needed (refactor phase):**
     - Clean up the implementation while keeping tests passing
     - Ensure code follows project conventions
     - Run `pnpm test` again to confirm tests still pass

- **Completion protocol:**

  1. When you finish a **sub-task**, follow this sequence:

  - **Verify branch:** Ensure you're on the correct feature branch
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

  2. **Self-verification checklist before proceeding:**

  Before asking to proceed to the next sub-task, the AI must self-verify:

  - [ ] Subtask is marked `[x]` in the task list
  - [ ] All linter errors are fixed or user has approved proceeding
  - [ ] All tests pass
  - [ ] Changes are committed with a descriptive, conventional commit message referencing the parent issue
  - [ ] User has given explicit go-ahead

  3. **Explicit pause and confirm:**

  After completing the above steps for a sub-task, the AI must explicitly pause and request user confirmation before proceeding to the next sub-task. Do not suggest or start the next subtask until the user has confirmed.

  4. Once all the subtasks are marked completed and changes have been committed, mark the **parent task** as completed.

- **No skipping steps:** The AI must not skip or reorder any steps in the completion protocol, even if the user prompt is ambiguous or suggests moving ahead.

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

1. **Verify branch before starting work:**

   - Check if user is on the correct feature branch
   - Ensure branch name matches PRD filename: `feature/[prd-filename]`
   - If not on correct branch, instruct user to switch before proceeding

2. **Follow TDD workflow for each sub-task:**

   - **Red phase:** Start by writing a failing test that describes the expected behavior
   - **Green phase:** Implement minimal code to make the test pass
   - **Refactor phase:** Clean up code while keeping tests passing
   - Run `pnpm test` at each phase to verify test status

3. Regularly update the task list file after finishing any significant work.

4. Follow the completion protocol:

   - Mark each finished **sub‑task** `[x]`.
   - Mark the **parent task** `[x]` once **all** its subtasks are `[x]`.

5. Add newly discovered tasks.

6. Keep "Relevant Files" accurate and up to date.

7. Before starting work, check which sub‑task is next.

8. After implementing a sub‑task, update the file and then pause for user approval.

9. **Extract GitHub issue numbers** from the parent task (format: `(#123)`) and include them in commit messages using `Related to #123`.

10. **Ensure all commits are on the feature branch** and never on main/master.

11. **Complete the self-verification checklist** before asking to proceed to the next sub-task.

12. **Explicitly pause and request confirmation** before proceeding to the next sub-task.
