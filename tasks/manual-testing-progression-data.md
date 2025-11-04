# Manual Testing Instructions: Progression Data Persistence

## Overview

These instructions verify that progression data (all-time deepest depth, run counts) persists correctly when runs complete or bust, and that completed/busted runs are properly removed from the queue.

## Prerequisites

- App installed and running
- Access to device storage/debugging tools (optional, for verification)
- Ability to complete runs and bust runs

## Test Scenarios

### Test 1: Initial State - Fresh Install

**Purpose:** Verify progression data starts at zero

**Steps:**

1. If app has existing data, clear app data or use a fresh install
2. Navigate to Run History screen
3. Verify the following statistics:
   - All-Time Deepest Depth: **0**
   - Total Runs Completed: **0**
   - Total Runs Busted: **0**
   - Total Runs Attempted: **0**

**Expected Result:** All values should be 0

---

### Test 2: Complete a Run - Progression Data Updates

**Purpose:** Verify progression data updates when a run completes successfully

**Steps:**

1. Start a run with sufficient energy (e.g., 10,000+ steps)
2. Navigate through the dungeon:
   - Visit at least one node at depth 1
   - Optionally visit nodes at depth 2 or 3
3. Cash out the run successfully
4. Navigate to Run History screen
5. Verify the following statistics:
   - All-Time Deepest Depth: **Should match the deepest depth you reached** (e.g., 1, 2, or 3)
   - Total Runs Completed: **1**
   - Total Runs Busted: **0**
   - Total Runs Attempted: **1**

**Expected Result:**

- Deepest depth matches the maximum depth reached
- Completed count increments to 1
- Total attempts = completed + busted = 1

**Additional Verification:**

- Go to Run Queue screen
- Verify the completed run is **NOT** in the queue (no "Completed" section should appear)
- Only "Ready to Start" and "Active" sections should exist

---

### Test 3: Bust a Run - Progression Data Updates

**Purpose:** Verify progression data updates when a run busts

**Steps:**

1. Start a new run
2. Navigate through the dungeon:
   - Visit at least one node at depth 1
   - Optionally visit nodes at depth 2 (if energy allows)
3. Run out of energy or manually trigger a bust
4. Acknowledge the bust screen
5. Navigate to Run History screen
6. Verify the following statistics:
   - All-Time Deepest Depth: **Should be the maximum of all depths reached** (from both completed and busted runs)
   - Total Runs Completed: **Should remain the same as Test 2** (e.g., 1)
   - Total Runs Busted: **1**
   - Total Runs Attempted: **2** (completed 1 + busted 1)

**Expected Result:**

- Deepest depth is the maximum depth reached across all runs
- Busted count increments to 1
- Completed count remains unchanged
- Total attempts = completed + busted = 2

**Additional Verification:**

- Go to Run Queue screen
- Verify the busted run is **NOT** in the queue (no "Failed" section should appear)

---

### Test 4: Multiple Runs - Depth Tracking

**Purpose:** Verify deepest depth only updates when new record is reached

**Steps:**

1. Complete a run reaching depth 3
2. Check Run History:
   - All-Time Deepest Depth should be **3**
3. Complete another run reaching only depth 2
4. Check Run History:
   - All-Time Deepest Depth should **still be 3** (not updated)
5. Complete a run reaching depth 4
6. Check Run History:
   - All-Time Deepest Depth should be **4** (updated to new record)

**Expected Result:** Deepest depth only increases, never decreases

---

### Test 5: App Restart - Data Persistence

**Purpose:** Verify progression data persists across app restarts

**Steps:**

1. Complete a few runs (mix of completed and busted)
2. Note the current statistics:
   - All-Time Deepest Depth: **X**
   - Total Runs Completed: **Y**
   - Total Runs Busted: **Z**
   - Total Runs Attempted: **Y + Z**
3. **Close the app completely** (force quit if needed)
4. **Restart the app**
5. Navigate to Run History screen
6. Verify all statistics match the values from step 2

**Expected Result:** All values persist exactly as they were before restart

---

### Test 6: Run Queue Cleanup

**Purpose:** Verify completed/busted runs are removed from queue

**Steps:**

1. Start multiple runs:
   - Run 1: Complete it successfully
   - Run 2: Bust it
   - Run 3: Leave it queued
2. Go to Run Queue screen
3. Verify:
   - **Only** Run 3 appears in "Ready to Start" section
   - Run 1 does NOT appear anywhere
   - Run 2 does NOT appear anywhere
   - No "Completed" section exists
   - No "Failed" section exists

**Expected Result:** Only active/queued runs appear in the queue

---

### Test 7: Statistics Accuracy

**Purpose:** Verify run statistics are accurate

**Steps:**

1. Note starting statistics from Run History
2. Complete exactly 3 runs
3. Bust exactly 2 runs
4. Check Run History:
   - Total Runs Completed should increase by **3**
   - Total Runs Busted should increase by **2**
   - Total Runs Attempted should be **completed + busted**

**Expected Result:** Counts match exactly

---

### Test 8: Edge Cases

#### 8a: Zero Depth Run

**Steps:**

1. Start a run but don't visit any nodes
2. Cash out immediately
3. Check Run History:
   - All-Time Deepest Depth should be **0** (or previous max if higher)
   - Total Runs Completed should increment

#### 8b: Very Deep Run

**Steps:**

1. Complete a run reaching depth 10+
2. Check Run History:
   - All-Time Deepest Depth should reflect the actual depth reached
   - Value should be accurate

---

## Troubleshooting

### If progression data doesn't persist:

1. Check console logs for storage errors
2. Verify storage permissions are granted
3. Check if storage is full

### If runs still appear in queue after completion:

1. Verify the run status was actually updated to 'completed' or 'busted'
2. Check console logs for errors in `updateRunStatus`
3. Verify `ProgressionManager.processRunCompletion()` or `processRunBust()` was called

### If statistics are incorrect:

1. Verify you're looking at Run History (not Run Queue)
2. Check that the app wasn't reset/cleared
3. Verify the progression data key in storage: `delvers_descent_progression`

---

## Verification Checklist

- [ ] Initial state shows all zeros
- [ ] Completed runs update progression data correctly
- [ ] Busted runs update progression data correctly
- [ ] Deepest depth only increases (never decreases)
- [ ] Completed/busted runs are removed from queue
- [ ] Data persists across app restarts
- [ ] Run statistics are accurate
- [ ] Run History displays progression statistics
- [ ] Run Queue shows only queued/active runs

---

## Notes

- Progression data is stored under the key: `delvers_descent_progression`
- Individual run records are no longer archived
- Region unlocks, shortcuts, and collections are unaffected (use separate storage)
- The ProgressionManager uses a singleton pattern, so data is consistent across the app
