# Step 2: Detailed Review

## Task

Perform detailed code review on each changed file.

### Review Checklist

For each file, check:

1. **Correctness**
   - Does the code work as intended?
   - Are there edge cases not handled?
   - Are there potential bugs?

2. **Security**
   - Input validation
   - SQL injection, XSS vulnerabilities
   - Sensitive data exposure
   - Authentication/authorization issues

3. **Performance**
   - Inefficient algorithms
   - Unnecessary loops or database calls
   - Memory leaks

4. **Maintainability**
   - Code readability
   - Naming conventions
   - Code duplication
   - Proper error handling

5. **Testing**
   - Are there tests for new functionality?
   - Do existing tests need updating?

## Output

For each issue found:
- File and line number
- Severity (Critical / Major / Minor / Suggestion)
- Description of the issue
- Suggested fix
