# Evaluation Framework

This directory contains the testing and evaluation infrastructure for the md-format skill.

## Structure

```
evals/
├── evals.json          # Test case definitions (version controlled)
├── grade.py            # Automated assertion checker (version controlled)
└── iteration-N/        # Test run outputs (gitignored)
    ├── benchmark.json
    ├── EVALUATION_REPORT.md
    ├── feedback.json
    └── eval-{id}-{name}/
        ├── with_skill/
        │   ├── outputs/
        │   ├── grading.json
        │   └── timing.json
        └── without_skill/
            ├── outputs/
            ├── grading.json
            └── timing.json
```

## Files

### `evals.json`
Defines test cases with:
- `prompt`: User task to execute
- `expected_output`: Description of desired result
- `expectations`: List of assertions to check

### `grade.py`
Python script that checks assertions programmatically:
- No HTML/LaTeX/CDATA markers
- Mermaid diagrams with styles
- Metadata tables, TOC, footers
- Table alignment
- Formula placement

Usage:
```bash
python3 grade.py <output_file> <eval_metadata.json>
```

### `iteration-N/`
Each iteration contains:
- Test outputs (with_skill vs without_skill)
- Grading results
- Benchmark summary
- Evaluation report

## Running Evaluations

Use the skill-creator skill:
```bash
/skill-creator 测试并优化 md-format skill
```

Or manually:
1. Create iteration directory: `mkdir -p evals/iteration-N`
2. Run test cases with and without skill
3. Grade outputs: `python3 evals/grade.py ...`
4. Generate benchmark and review

## Iteration History

- **iteration-1** (2026-05-27): Initial evaluation, v1.3.0 → v1.4.0
  - Pass rate: 94% (with skill) vs 63% (baseline)
  - Fixed: formula leakage, Mermaid pie chart styles, priority marking
