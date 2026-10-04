# Contributing to Common CTF Challenges

Thank you for your interest in contributing to this CTF reference repository!

## How to Contribute

### Adding New Content

#### Scripts
1. Place scripts in the appropriate `category/src/` directory
2. Include a module-level docstring (see template below)
3. Test your script before submitting

#### Documentation
1. Update or create README.md files in the relevant category
2. Follow the existing format:
   - Quick wins section (fastest solutions)
   - Examples with code blocks
   - Links to external tools
3. Use fenced code blocks with language hints (```python, ```bash, etc.)
4. Prefer runnable examples over long explanations

### Docstring Template

All Python scripts should include a docstring at the top:

```python
"""
Brief one-line description.

Category: <category> > <subcategory>

Description:
    2-3 sentences explaining what this script does,
    when to use it, and any important notes.

Usage:
    python script_name.py [arguments]

Dependencies:
    - dependency1
    - dependency2

Example:
    Brief example of usage or expected output (optional)
"""
```

### Code Style

- **Python**: Use meaningful variable names; add type hints where helpful
- **Comments**: Only add comments where the logic isn't self-evident
- **Keep scripts self-contained**: Minimize external dependencies when possible
- **No hardcoded secrets**: Use placeholders like `0xDEADBEEF` or `CHANGEME`

### File Organization

```
category/
├── README.md           # Category cheatsheet
└── src/
    └── script.py       # Exploit/tool scripts
```

### Naming Conventions

- Scripts: `snake_case.py` (e.g., `wiener_attack.py`, `mysql_blind_get_version.py`)
- READMEs: Uppercase `README.md`
- Directories: lowercase with hyphens (e.g., `asymmetric-cipher/`)

## Pull Request Process

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/add-heap-exploitation
   ```
3. **Make your changes**
   - Add scripts with docstrings
   - Update relevant READMEs
   - Test your additions
4. **Commit with clear messages**
   ```bash
   git commit -m "Add tcache poisoning exploit template"
   ```
5. **Push and create PR**
   ```bash
   git push origin feature/add-heap-exploitation
   ```
6. **Describe your changes** in the PR:
   - What was added/changed
   - Why it helps CTF players
   - Any testing done

## What We're Looking For

### High Priority
- Working exploit templates for common vulnerabilities
- New attack techniques with examples
- Improvements to existing documentation
- Bug fixes in scripts

### Medium Priority
- Additional tool references
- Edge case payloads
- Platform-specific variations

### Nice to Have
- Writeup links (from public CTFs)
- Alternative approaches to existing techniques
- Performance improvements

## Quality Standards

Before submitting:

- [ ] Scripts run without errors
- [ ] Docstrings explain usage
- [ ] Examples use safe placeholder values
- [ ] No sensitive information included
- [ ] Tested on target platform (if applicable)

## Code of Conduct

- Use these materials ethically
- Only in CTF competitions or authorized environments
- Respect intellectual property
- Be helpful and constructive in discussions

## Questions?

If you're unsure whether your contribution fits:
1. Check existing content for patterns
2. Open an issue to discuss before implementing
3. Start with a small addition to test the process

Thank you for helping make this repository better for the CTF community!
