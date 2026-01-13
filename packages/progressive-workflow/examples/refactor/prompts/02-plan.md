# Step 2: Create Refactoring Plan

Goal: {{REFACTOR_GOAL}}

## Task

Create a detailed plan before making changes.

### Planning Steps

1. **Define the end state**
   - What should the code look like after refactoring?
   - What improvements will this bring?

2. **List all changes**
   - Changes to the target file
   - Changes to dependent files
   - Changes to tests

3. **Order of operations**
   - In what order should changes be made?
   - Can we do this incrementally?

4. **Rollback strategy**
   - How can we revert if something goes wrong?

## Output

Numbered list of changes to make:

```
1. In file X:
   - Change A to B
   - Add function C

2. In file Y:
   - Update import
   - Change call from A to B

3. In tests:
   - Update test for A
   - Add test for C
```
