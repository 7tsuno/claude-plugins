# Step 1: Analyze Current State

Target: {{TARGET_FILE}}
Goal: {{REFACTOR_GOAL}}

## Task

Understand the current code before making changes.

### Analysis Steps

1. **Read the target file(s)**
   - Understand the overall structure
   - Identify the code to be refactored

2. **Find dependencies**
   - What imports this code?
   - What does this code import?
   - Search for usages across the codebase

3. **Check for tests**
   - Are there existing tests?
   - What is the test coverage?

4. **Identify risks**
   - What could break?
   - Are there side effects?

## Output

- Current code structure summary
- List of files that use/depend on target
- Existing test coverage
- Risk assessment
