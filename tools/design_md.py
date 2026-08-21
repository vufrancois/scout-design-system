#!/usr/bin/env python3
"""Regenerate docs/design.md from design-system/design-doc.html (the normative source).
Usage: python3 tools/design_md.py
"""
import re, os
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'design-system', 'design-doc.html')
OUT = os.path.join(ROOT, 'docs', 'design.md')

src = open(SRC).read()
start = src.index('<h1>')
end = src.index('<script>', start) if '<script>' in src[start:] else len(src)
body = src[start:end]

class MD(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out, self.buf, self.stack = [], '', []
        self.in_table, self.table_rows, self.cur_row, self.cell_buf = False, [], None, None
        self.skip, self.li_depth = 0, 0
    def flush_para(self, prefix=''):
        t = re.sub(r'\s+', ' ', self.buf).strip(); self.buf = ''
        if t: self.out.append(prefix + t)
    def handle_starttag(self, tag, attrs):
        if tag in ('svg', 'style'): self.skip += 1; return
        if self.skip: return
        if tag in ('h1','h2','h3'): self.flush_para(); self.stack.append('#' * int(tag[1]) + ' ')
        elif tag == 'p': self.flush_para()
        elif tag == 'ul': self.flush_para(); self.li_depth += 1
        elif tag == 'li': self.flush_para()
        elif tag in ('strong','b'): self.add('**')
        elif tag in ('em','i'): self.add('*')
        elif tag == 'code': self.add('`')
        elif tag == 'table': self.flush_para(); self.in_table = True; self.table_rows = []
        elif tag == 'tr' and self.in_table: self.cur_row = []
        elif tag in ('td','th') and self.in_table: self.cell_buf = ''
        elif tag == 'br': self.add(' ')
    def handle_endtag(self, tag):
        if tag in ('svg','style'): self.skip -= 1; return
        if self.skip: return
        if tag in ('h1','h2','h3'): self.flush_para(self.stack.pop()); self.out.append('')
        elif tag == 'p': self.flush_para(); self.out.append('')
        elif tag == 'ul':
            self.li_depth -= 1
            if self.li_depth == 0: self.out.append('')
        elif tag == 'li': self.flush_para('  ' * (self.li_depth - 1) + '- ')
        elif tag in ('strong','b'): self.add('**')
        elif tag in ('em','i'): self.add('*')
        elif tag == 'code': self.add('`')
        elif tag in ('td','th') and self.in_table:
            self.cur_row.append(re.sub(r'\s+',' ', self.cell_buf).strip()); self.cell_buf = None
        elif tag == 'tr' and self.in_table:
            if self.cur_row and any(self.cur_row): self.table_rows.append(self.cur_row)
            self.cur_row = None
        elif tag == 'table':
            self.in_table = False
            if self.table_rows:
                w = max(len(r) for r in self.table_rows)
                rows = [r + ['']*(w-len(r)) for r in self.table_rows]
                self.out.append('| ' + ' | '.join(rows[0]) + ' |'); self.out.append('|' + '---|'*w)
                for r in rows[1:]: self.out.append('| ' + ' | '.join(r) + ' |')
                self.out.append('')
    def add(self, s):
        if self.cell_buf is not None: self.cell_buf += s
        else: self.buf += s
    def handle_data(self, data):
        if not self.skip: self.add(data)

p = MD(); p.feed(body)
md = '\n'.join(p.out)
md = re.sub(r'\n{3,}', '\n\n', md).strip() + '\n'
md = md.replace('Usage rules, token reference, and implementation guidance for the Scout Design System.\n\nOverview Apps Colors Typography Spacing Radius Shadows Theming Icons Formatting Charts Components Patterns\n',
                'Usage rules, token reference, and implementation guidance for the Scout Design System. Generated from `design-system/design-doc.html` (the normative source) by `tools/design_md.py`.\n')
open(OUT, 'w').write(md)
print(f'wrote {OUT} ({len(md)} chars)')
