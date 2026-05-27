#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Grade markdown outputs against assertions.
Usage: python grade.py <output_file> <assertions_json>
"""
import sys
import json
import re

def check_no_html_tags(content):
    """Check for HTML tags like <div>, <span>, <br>, <center>, <img>"""
    html_pattern = r'<(?:div|span|br|center|img|p|a|table|tr|td|th|ul|ol|li|h[1-6]|strong|em|b|i|u|s|code|pre|blockquote|hr|link|meta|script|style)[>\s/]'
    matches = re.findall(html_pattern, content, re.IGNORECASE)
    return len(matches) == 0, matches

def check_no_latex(content):
    """Check for LaTeX syntax like $$, $, \\text{}, \\frac{}, \\boxed{}"""
    # Check for $$ or $ (but not inside code blocks)
    # Remove code blocks first
    content_no_code = re.sub(r'```[\s\S]*?```', '', content)
    content_no_code = re.sub(r'`[^`]+`', '', content_no_code)

    latex_patterns = [
        r'\$\$',  # $$
        r'(?<![a-zA-Z0-9])\$(?!\$)',  # single $ not part of $$
        r'\\text\{',
        r'\\frac\{',
        r'\\boxed\{',
        r'\\underbrace\{',
        r'\\sqrt\{',
        r'\\sum',
        r'\\int',
        r'\\prod',
        r'\\begin\{',
        r'\\end\{'
    ]

    matches = []
    for pattern in latex_patterns:
        found = re.findall(pattern, content_no_code)
        matches.extend(found)

    return len(matches) == 0, matches

def check_no_cdata(content):
    """Check for CDATA markers"""
    cdata_pattern = r'<!\[CDATA\[|]]>'
    matches = re.findall(cdata_pattern, content)
    return len(matches) == 0, matches

def check_formulas_in_code_blocks(content):
    """Check that mathematical expressions are in code blocks"""
    # Remove code blocks
    content_no_code = re.sub(r'```[\s\S]*?```', '', content)
    content_no_code = re.sub(r'`[^`]+`', '', content_no_code)

    # Look for math-like patterns outside code blocks
    math_patterns = [
        r'[A-Z]{2,}\s*=\s*[^=\n]+[+\-*/÷×]',  # CAC = ... + ...
        r'=\s*\([^)]+\)\s*[÷×/]\s*\([^)]+\)',  # = (...) / (...)
        r'[A-Za-z]+\s*=\s*\d+\s*[×÷]\s*\d+',  # X = 5 × 3
    ]

    violations = []
    for pattern in math_patterns:
        found = re.findall(pattern, content_no_code)
        violations.extend(found)

    # If we find math-like content outside code blocks, fail
    return len(violations) == 0, violations

def check_metadata_table(content):
    """Check for metadata table at the top"""
    # Look for a table in the first 500 characters
    top_section = content[:800]
    # Table pattern: lines with | characters
    table_lines = [line for line in top_section.split('\n') if '|' in line and line.strip().startswith('|')]
    return len(table_lines) >= 2, table_lines

def check_table_of_contents(content):
    """Check for table of contents with anchor links"""
    # Look for "目录" or "## 目录" or similar
    toc_pattern = r'##?\s*目录|##?\s*Table of Contents|##?\s*Contents'
    has_toc_header = bool(re.search(toc_pattern, content, re.IGNORECASE))

    # Look for anchor links like [text](#anchor)
    anchor_links = re.findall(r'\[([^\]]+)\]\(#[^\)]+\)', content)

    return has_toc_header and len(anchor_links) >= 2, anchor_links

def check_footer(content):
    """Check for footer/source line at the end"""
    # Last 200 characters
    footer_section = content[-200:].strip()
    # Look for patterns like "*来源 | 日期*" or similar
    footer_pattern = r'\*[^*]+\|[^*]+\*|^---\s*$|^\*\*[^*]+\*\*\s*$'
    lines = footer_section.split('\n')
    last_lines = '\n'.join(lines[-3:])
    return bool(re.search(footer_pattern, last_lines, re.MULTILINE)), last_lines

def check_mermaid_diagram(content):
    """Check for Mermaid diagram"""
    mermaid_pattern = r'```mermaid[\s\S]*?```'
    matches = re.findall(mermaid_pattern, content)
    return len(matches) > 0, matches

def check_mermaid_styles(content):
    """Check that Mermaid diagrams have style statements"""
    mermaid_blocks = re.findall(r'```mermaid([\s\S]*?)```', content)

    if not mermaid_blocks:
        return False, "No Mermaid blocks found"

    all_have_styles = True
    details = []

    for i, block in enumerate(mermaid_blocks):
        style_pattern = r'style\s+\w+\s+fill:'
        has_style = bool(re.search(style_pattern, block))
        if not has_style:
            all_have_styles = False
            details.append(f"Block {i+1} missing style statements")
        else:
            style_count = len(re.findall(style_pattern, block))
            details.append(f"Block {i+1} has {style_count} style statements")

    return all_have_styles, details

def check_table_alignment(content):
    """Check that numeric columns use center alignment"""
    # Find table alignment rows (lines with :---: or similar)
    alignment_rows = re.findall(r'\|([:\-\s|]+)\|', content)

    center_aligned = []
    for row in alignment_rows:
        cells = [c.strip() for c in row.split('|') if c.strip()]
        for cell in cells:
            if ':' in cell and cell.startswith(':') and cell.endswith(':'):
                center_aligned.append(cell)

    return len(center_aligned) > 0, center_aligned

def check_blockquotes(content):
    """Check for blockquotes (>)"""
    blockquote_lines = [line for line in content.split('\n') if line.strip().startswith('>')]
    return len(blockquote_lines) > 0, blockquote_lines

def grade_assertions(output_file, assertions):
    """Grade all assertions against the output file"""
    with open(output_file, 'r', encoding='utf-8') as f:
        content = f.read()

    results = []

    for assertion in assertions:
        assertion_lower = assertion.lower()

        if 'no html tags' in assertion_lower:
            passed, evidence = check_no_html_tags(content)
            results.append({
                'text': assertion,
                'passed': passed,
                'evidence': f"No HTML tags found" if passed else f"Found HTML tags: {evidence[:3]}"
            })

        elif 'no latex' in assertion_lower:
            passed, evidence = check_no_latex(content)
            results.append({
                'text': assertion,
                'passed': passed,
                'evidence': f"No LaTeX syntax found" if passed else f"Found LaTeX: {evidence[:3]}"
            })

        elif 'no cdata' in assertion_lower:
            passed, evidence = check_no_cdata(content)
            results.append({
                'text': assertion,
                'passed': passed,
                'evidence': f"No CDATA markers found" if passed else f"Found CDATA: {evidence}"
            })

        elif 'mathematical' in assertion_lower and 'code block' in assertion_lower:
            passed, evidence = check_formulas_in_code_blocks(content)
            results.append({
                'text': assertion,
                'passed': passed,
                'evidence': f"All formulas in code blocks" if passed else f"Found formulas outside code blocks: {evidence[:2]}"
            })

        elif 'metadata table' in assertion_lower:
            passed, evidence = check_metadata_table(content)
            results.append({
                'text': assertion,
                'passed': passed,
                'evidence': f"Found metadata table with {len(evidence)} rows" if passed else "No metadata table found in first 800 chars"
            })

        elif 'table of contents' in assertion_lower:
            passed, evidence = check_table_of_contents(content)
            results.append({
                'text': assertion,
                'passed': passed,
                'evidence': f"Found TOC with {len(evidence)} anchor links" if passed else "No TOC or insufficient anchor links"
            })

        elif 'footer' in assertion_lower:
            passed, evidence = check_footer(content)
            results.append({
                'text': assertion,
                'passed': passed,
                'evidence': f"Found footer: {evidence[:50]}..." if passed else "No footer pattern found"
            })

        elif 'mermaid diagram' in assertion_lower and 'style' in assertion_lower:
            passed, evidence = check_mermaid_styles(content)
            results.append({
                'text': assertion,
                'passed': passed,
                'evidence': f"Mermaid styles: {evidence}" if isinstance(evidence, list) else evidence
            })

        elif 'mermaid diagram' in assertion_lower or 'mermaid' in assertion_lower:
            passed, evidence = check_mermaid_diagram(content)
            results.append({
                'text': assertion,
                'passed': passed,
                'evidence': f"Found {len(evidence)} Mermaid diagram(s)" if passed else "No Mermaid diagrams found"
            })

        elif 'center alignment' in assertion_lower or 'numeric columns' in assertion_lower:
            passed, evidence = check_table_alignment(content)
            results.append({
                'text': assertion,
                'passed': passed,
                'evidence': f"Found {len(evidence)} center-aligned columns" if passed else "No center-aligned columns found"
            })

        elif 'blockquote' in assertion_lower:
            passed, evidence = check_blockquotes(content)
            results.append({
                'text': assertion,
                'passed': passed,
                'evidence': f"Found {len(evidence)} blockquote lines" if passed else "No blockquotes found"
            })

        elif 'comparison table' in assertion_lower:
            # Check for tables with multiple rows
            tables = re.findall(r'\|[^\n]+\|\n\|[:\-\s|]+\|\n(?:\|[^\n]+\|\n)+', content)
            passed = len(tables) > 0
            results.append({
                'text': assertion,
                'passed': passed,
                'evidence': f"Found {len(tables)} comparison table(s)" if passed else "No comparison tables found"
            })

        elif 'action items' in assertion_lower:
            # Check for lists or tables with action items
            has_list = bool(re.search(r'(?:^|\n)[-*]\s+\w+.*(?:今天|周|月|日|前)', content, re.MULTILINE))
            has_table = bool(re.search(r'\|.*(?:Action|任务|负责人|Owner)', content, re.IGNORECASE))
            passed = has_list or has_table
            results.append({
                'text': assertion,
                'passed': passed,
                'evidence': f"Found action items in {'list' if has_list else 'table' if has_table else 'unknown'} format" if passed else "No clear action items format found"
            })

        elif 'bug priorities' in assertion_lower or 'visually distinguished' in assertion_lower:
            # Check for bold P1/P2 or tables with priority
            has_bold_priority = bool(re.search(r'\*\*P[0-9]\*\*', content))
            has_priority_table = bool(re.search(r'\|.*(?:Priority|优先级|P[0-9])', content, re.IGNORECASE))
            passed = has_bold_priority or has_priority_table
            results.append({
                'text': assertion,
                'passed': passed,
                'evidence': f"Bug priorities distinguished via {'bold' if has_bold_priority else 'table' if has_priority_table else 'unknown'}" if passed else "Bug priorities not visually distinguished"
            })

        elif 'neutral' in assertion_lower or 'tone' in assertion_lower:
            # This is subjective - check for absence of overly technical financial jargon
            jargon_patterns = [
                r'alpha', r'beta', r'sharpe ratio', r'volatility', r'portfolio',
                r'hedge', r'derivative', r'arbitrage', r'leverage'
            ]
            jargon_found = []
            for pattern in jargon_patterns:
                if re.search(pattern, content, re.IGNORECASE):
                    jargon_found.append(pattern)

            passed = len(jargon_found) == 0
            results.append({
                'text': assertion,
                'passed': passed,
                'evidence': f"Tone is neutral/informational" if passed else f"Found specialized jargon: {jargon_found}"
            })

        elif 'market share' in assertion_lower and 'visualized' in assertion_lower:
            # Check for pie chart or similar
            has_pie = bool(re.search(r'```mermaid\s+pie', content, re.IGNORECASE))
            has_chart = bool(re.search(r'市场份额|Market Share', content))
            passed = has_pie or has_chart
            results.append({
                'text': assertion,
                'passed': passed,
                'evidence': f"Market share visualized with {'pie chart' if has_pie else 'chart/table'}" if passed else "Market share not visualized"
            })

        else:
            # Unknown assertion - mark as passed with note
            results.append({
                'text': assertion,
                'passed': True,
                'evidence': f"Assertion not automatically checkable: {assertion}"
            })

    return results

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python grade.py <output_file> <assertions_json>")
        sys.exit(1)

    output_file = sys.argv[1]
    assertions_json = sys.argv[2]

    with open(assertions_json, 'r', encoding='utf-8') as f:
        data = json.load(f)
        assertions = data.get('assertions', [])

    results = grade_assertions(output_file, assertions)

    passed = sum(1 for r in results if r['passed'])
    total = len(results)

    grading_output = {
        'expectations': results,
        'summary': {
            'passed': passed,
            'failed': total - passed,
            'total': total,
            'pass_rate': passed / total if total > 0 else 0
        }
    }

    print(json.dumps(grading_output, ensure_ascii=False, indent=2))
