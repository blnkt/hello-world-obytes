#!/bin/bash

# create-hierarchical-issues.sh

# Usage: ./create-hierarchical-issues.sh path/to/tasks.md [--dry-run]

set -e

# Default values
REPO="blnkt/hello-world-obytes"
DRY_RUN=false
CONFIRM=false
PROJECT_NUMBER=1
ORG_OR_USER="blnkt"
ASSIGNEE="blnkt"
DEFAULT_STATUS="To Do"
CREATE_SUBTASK_ISSUES=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --confirm)
      CONFIRM=true
      shift
      ;;
    --project-number)
      PROJECT_NUMBER="$2"
      shift 2
      ;;
    --status)
      DEFAULT_STATUS="$2"
      shift 2
      ;;
    --assignee)
      ASSIGNEE="$2"
      shift 2
      ;;
    --subtask-issues)
      CREATE_SUBTASK_ISSUES=true
      shift
      ;;
    --help|-h)
      echo "Usage: $0 path/to/tasks.md [--dry-run] [--confirm] [--project-number N] [--status STATUS] [--assignee ASSIGNEE] [--subtask-issues]"
      echo ""
      echo "This script creates a hierarchical issue structure:"
      echo "  - Parent issues for main tasks (1.0, 2.0, etc.)"
      echo "  - Subtask checklists within parent issues"
      echo "  - Updates task file with GitHub issue numbers for parent tasks only"
      echo "  - Adds issues to project with 'To Do' status"
      echo ""
      echo "Options:"
      echo "  --subtask-issues    Also create individual issues for each subtask (not recommended)"
      exit 0
      ;;
    *)
      if [ -z "$TASKS_FILE" ]; then
        TASKS_FILE="$1"
      else
        echo "Error: Unknown argument $1"
        echo "Use --help for usage information"
        exit 1
      fi
      shift
      ;;
  esac
done

# Check if file is provided
if [ -z "$TASKS_FILE" ]; then
  echo "Error: No tasks file specified"
  echo "Usage: $0 path/to/tasks.md [--dry-run]"
  exit 1
fi

# Check if file exists
if [ ! -f "$TASKS_FILE" ]; then
  echo "Error: File $TASKS_FILE not found"
  exit 1
fi

# Check if gh CLI is installed and authenticated
if ! command -v gh &> /dev/null; then
  echo "Error: GitHub CLI (gh) is not installed"
  echo "Install from: https://cli.github.com/"
  exit 1
fi

if ! gh auth status &> /dev/null; then
  echo "Error: GitHub CLI is not authenticated"
  echo "Run: gh auth login"
  exit 1
fi

# Validate project exists
echo "Validating project access..."
if ! gh project view $PROJECT_NUMBER --owner "$ORG_OR_USER" &> /dev/null; then
  echo "Error: Project $PROJECT_NUMBER not found or not accessible"
  echo "Available projects:"
  gh project list --owner "$ORG_OR_USER"
  exit 1
fi

PROJECT_TITLE=$(gh project view $PROJECT_NUMBER --owner "$ORG_OR_USER" --format json | jq -r '.title')

# Check if the specified status field exists in the project
echo "Checking project fields..."
PROJECT_FIELDS=$(gh project field-list $PROJECT_NUMBER --owner "$ORG_OR_USER" --format json | jq -r '.fields[] | select(.name == "Status") | .options[] | .name' 2>/dev/null || echo "")

if [ ! -z "$PROJECT_FIELDS" ]; then
  if echo "$PROJECT_FIELDS" | grep -q "$DEFAULT_STATUS"; then
    echo "✓ Status field found with option: $DEFAULT_STATUS"
  else
    echo "⚠ Warning: Status '$DEFAULT_STATUS' not found in project fields"
    echo "Available status options:"
    echo "$PROJECT_FIELDS" | sed 's/^/  - /'
    echo ""
    echo "You can specify a different status using --status option"
  fi
else
  echo "⚠ Warning: No Status field found in project."
  echo "To enable status tracking:"
  echo "1. Go to your project: https://github.com/orgs/$ORG_OR_USER/projects/$PROJECT_NUMBER"
  echo "2. Add a custom field called 'Status' with options like 'To Do', 'In Progress', 'Done'"
  echo "3. Run this script again"
  echo ""
  echo "For now, issues will be added to the project without status."
fi

echo "=== Hierarchical Issue Creation Tool ==="
echo "Repository: $REPO"
echo "Project: $PROJECT_TITLE (#$PROJECT_NUMBER)"
echo "Status: $DEFAULT_STATUS"
echo "Create subtask issues: $CREATE_SUBTASK_ISSUES"
echo "Dry run: $DRY_RUN"
echo ""

# Function to check if issue already exists
check_issue_exists() {
  local task_title="$1"
  
  # Search for existing issues with the same title (exact match)
  local existing_issues=$(gh issue list --repo "$REPO" --search "is:issue is:open \"$task_title\"" --json number,title 2>/dev/null)
  
  if [ ! -z "$existing_issues" ] && [ "$existing_issues" != "[]" ]; then
    local issue_number=$(echo "$existing_issues" | jq -r '.[0].number')
    echo "$issue_number"
  else
    echo ""
  fi
}

# Function to create an issue and add to project
create_issue() {
  local title="$1"
  local body="$2"
  
  if [ "$DRY_RUN" = true ]; then
    echo "DRY RUN: Would create issue: $title"
    echo "DRY RUN: With body: $body"
    echo "DRY RUN: Would add to project #$PROJECT_NUMBER with status: $DEFAULT_STATUS"
    echo ""
    return 0
  fi
  
  echo "Creating issue: $title"
  
  local issue_url=$(gh issue create --title "$title" --repo "$REPO" --body "$body" --assignee "$ASSIGNEE")
  
  if [ $? -eq 0 ]; then
    local issue_number=$(echo "$issue_url" | grep -oE '[0-9]+$')
    echo "✓ Created issue #$issue_number: $title"
    
    # Add to project
    if gh project item-add $PROJECT_NUMBER --owner "$ORG_OR_USER" --url "$issue_url" &> /dev/null; then
      echo "  ✓ Added to project"
      
      # Try to set the status
      sleep 2
      
      local project_items=$(gh project item-list $PROJECT_NUMBER --owner "$ORG_OR_USER" --format json 2>/dev/null)
      local item_id=$(echo "$project_items" | jq -r --arg issue_num "$issue_number" '.items[] | select(.content.number == ($issue_num | tonumber)) | .id' 2>/dev/null)
      
      if [ ! -z "$item_id" ] && [ "$item_id" != "null" ]; then
        local status_field_id=$(gh project field-list $PROJECT_NUMBER --owner "$ORG_OR_USER" --format json | jq -r '.fields[] | select(.name == "Status") | .id' 2>/dev/null)
        local to_do_option_id=$(gh project field-list $PROJECT_NUMBER --owner "$ORG_OR_USER" --format json | jq -r '.fields[] | select(.name == "Status") | .options[] | select(.name == "To Do") | .id' 2>/dev/null)
        
        if [ ! -z "$status_field_id" ] && [ ! -z "$to_do_option_id" ]; then
          local project_graphql_id=$(gh project view $PROJECT_NUMBER --owner "$ORG_OR_USER" --format json | jq -r '.id' 2>/dev/null)
          
          if [ ! -z "$project_graphql_id" ]; then
            if gh project item-edit --id "$item_id" --field-id "$status_field_id" --project-id "$project_graphql_id" --single-select-option-id "$to_do_option_id" &> /dev/null; then
              echo "  ✓ Set status to: $DEFAULT_STATUS"
            else
              echo "  ⚠ Could not set status automatically"
            fi
          else
            echo "  ⚠ Could not get project ID"
          fi
        else
          echo "  ⚠ Could not find Status field or To Do option"
        fi
      else
        echo "  ⚠ Could not find item in project to set status"
      fi
    else
      echo "  ✗ Failed to add to project"
    fi
    
    echo "$issue_number"
  else
    echo "✗ Failed to create issue: $title"
    echo ""
    return 1
  fi
}

# Process the file and create parent issues
echo "Processing tasks from $TASKS_FILE..."
echo ""

# Extract parent tasks and their subtasks
parent_count=0
subtask_count=0
created_parent_count=0
skipped_count=0

# Create a temporary file to store the updated content
temp_file=$(mktemp)

while IFS= read -r line; do
  # Match parent tasks (1.0, 2.0, etc.)
  if [[ $line =~ ^[[:space:]]*-[[:space:]]*\[[[:space:]]\][[:space:]]*([0-9]+\.0[[:space:]]+[^[:space:]].*)$ ]]; then
    parent_task="${BASH_REMATCH[1]}"
    task_number=$(echo "$parent_task" | grep -oE '^[0-9]+')
    
    echo "Found parent task: $parent_task"
    
    # Check if parent issue already exists
    existing_parent_issue_number=$(check_issue_exists "$parent_task")
    
    if [ ! -z "$existing_parent_issue_number" ]; then
      echo "⚠ Parent issue already exists #$existing_parent_issue_number: $parent_task"
      echo "  Skipping creation to avoid duplicates"
      echo ""
      ((skipped_count++))
      # Update the line with the existing issue number
      echo "$line (#$existing_parent_issue_number)" >> "$temp_file"
    else
      # Create parent issue with subtask checklist
      # Collect subtasks for this parent (match '- [ ] <parent_number>.<digit>')
      subtasks=""
      while IFS= read -r subline; do
        if [[ $subline =~ ^[[:space:]]*-[[:space:]]*\[[[:space:]]\][[:space:]]*${task_number}\.([0-9]+)[[:space:]]+.*$ ]]; then
          subtasks+="$subline"$'\n'
          echo "  Found subtask: $subline"
        fi
      done < "$TASKS_FILE"
      
      # Create checklist from subtasks
      checklist=""
      while IFS= read -r subtask; do
        if [[ $subtask =~ ^[[:space:]]*-[[:space:]]*\[[[:space:]]\][[:space:]]*(.+)$ ]]; then
          subtask_text="${BASH_REMATCH[1]}"
          checklist+="- [ ] $subtask_text"$'\n'
        fi
      done <<< "$subtasks"
      
      parent_body="## Overview
$parent_task

## Subtasks
$checklist

## Notes
- Check off subtasks as they are completed
- Create individual issues for complex subtasks that need detailed tracking
- Link related issues in comments"

      parent_issue_number=$(create_issue "$parent_task" "$parent_body")
      
      if [ $? -eq 0 ] && [ ! -z "$parent_issue_number" ]; then
        ((created_parent_count++))
        # Update the line with the issue number
        echo "$line (#$parent_issue_number)" >> "$temp_file"
      else
        # Write the line as-is if creation failed
        echo "$line" >> "$temp_file"
      fi
    fi
    ((parent_count++))
    
  # Match subtasks (1.1, 1.2, etc.) - just count them, don't create individual issues
  elif [[ $line =~ ^[[:space:]]*-[[:space:]]*\[[[:space:]]\][[:space:]]*([0-9]+\.([0-9]+)[[:space:]]+[^[:space:]].*)$ ]]; then
    subtask="${BASH_REMATCH[1]}"
    subtask_number="${BASH_REMATCH[2]}"
    parent_task_number=$(echo "$subtask" | grep -oE '^[0-9]+')
    
    echo "  Found subtask: $subtask"
    
    # Write subtask lines as-is (no issue numbers for subtasks)
    echo "$line" >> "$temp_file"
    ((subtask_count++))
    
  else
    # Write all other lines as-is
    echo "$line" >> "$temp_file"
  fi
done < "$TASKS_FILE"

# Replace the original file with the updated content
if [ "$DRY_RUN" = false ]; then
  mv "$temp_file" "$TASKS_FILE"
  echo ""
  echo "✓ Updated $TASKS_FILE with GitHub issue numbers for parent tasks"
else
  rm "$temp_file"
  echo ""
  echo "DRY RUN: Would update $TASKS_FILE with GitHub issue numbers for parent tasks"
fi

echo ""
echo "=== Summary ==="
if [ "$DRY_RUN" = true ]; then
  echo "DRY RUN: Found $parent_count parent tasks"
  echo "DRY RUN: Found $subtask_count subtasks"
  echo "DRY RUN: Would create $parent_count parent issues with subtask checklists"
else
  echo "Found $parent_count parent tasks"
  echo "Found $subtask_count subtasks"
  if [ $created_parent_count -gt 0 ]; then
    echo "Created $created_parent_count new parent issues with subtask checklists"
  fi
  if [ $skipped_count -gt 0 ]; then
    echo "Skipped $skipped_count existing parent issues (already exist)"
  fi
fi

echo ""
echo "=== Next Steps ==="
echo "1. Review the created issues in GitHub"
echo "2. Use the issue numbers in your commit messages:"
echo "   git commit -m \"feat: implement task 1.0\" -m \"Related to #123\""
echo "3. Follow the completion protocol in process-task-list.md"
echo "4. Update task status as you complete subtasks" 