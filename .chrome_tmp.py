#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""v4：导航去掉“案例”，页脚去掉重复电话，头部+热线条幂等替换（可反复运行）"""
import os, re
ROOT='/data/anchor1566.github.io-main'
NAV=[('','首页'),('products/','产品'),('news/','新闻'),('about/','关于')]

def active_index(rel):
    top=rel.split('/')[0]
    if rel=='index.html': return 0
    if top=='products': return 1
    if top in ('news','archives','tags','page','2023','2024','gallery'): return 2
    if top=='about': return 3
    return -1

def build_header(active):
    items=[]
    for i,(h,l) in enumerate(NAV):
        cls=' class="active"' if i==active else ''
        items.append('        <li%s><a href="/jingda/%s">%s</a></li>'%(cls,h,l))
    return '''<header id="header" class="header jd-header">
  <div class="container">
    <nav class="navbar jd-navbar">
      <a class="brand" href="/jingda/"><img class="logo" src="/jingda/images/logo2.png" alt="山东靖达智能装备有限公司"></a>
      <ul class="jd-nav">
%s
      </ul>
    </nav>
  </div>
</header>

<div class="jd-topline">
  <div class="container"><span>服务热线：15688666804</span></div>
</div>''' % '\n'.join(items)

FOOTER='''<footer class="jd-footer">
  <div class="container">
    <div class="jd-footer-grid">
      <div class="jd-footer-col">
        <h5>联系我们</h5>
        <p>联系人：陈经理</p>
        <p>邮箱：cyzghysy@163.com</p>
        <p>地址：山东省威海临港经济技术开发区江苏东路碳纤维产业研究院大楼509室</p>
      </div>
      <div class="jd-footer-col">
        <h5>快速导航</h5>
        <ul>
          <li><a href="/jingda/">首页</a></li>
          <li><a href="/jingda/products/">产品服务</a></li>
          <li><a href="/jingda/news/">新闻动态</a></li>
          <li><a href="/jingda/about/">关于我们</a></li>
        </ul>
      </div>
      <div class="jd-footer-col">
        <h5>产品分类</h5>
        <ul>
          <li><a href="/jingda/products/">检测系统</a></li>
          <li><a href="/jingda/products/">植入设备</a></li>
          <li><a href="/jingda/products/">粘接设备</a></li>
          <li><a href="/jingda/products/">打磨机器人</a></li>
          <li><a href="/jingda/products/">水下机器人</a></li>
        </ul>
      </div>
    </div>
    <div class="jd-footer-bottom">
      <p>© 2026 山东靖达智能装备有限公司 &nbsp; <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">鲁ICP备2023009339号-1</a></p>
    </div>
  </div>
</footer>'''

# 头部 + 任意条重复热线条，一起吃掉后重写为“头部 + 1 条”
HEAD_RE = re.compile(
    r'<header id="header".*?</header>\s*(?:<div class="jd-topline">\s*<div class="container"><span>服务热线：[^<]*</span></div>\s*</div>\s*)*',
    re.S)

def net_divs(s): return len(re.findall(r'<div\b',s))-len(re.findall(r'</div>',s))
def compensate(b):
    n=net_divs(b)
    return '</div>\n'*(-n) if n<0 else ('<div>\n'*n if n>0 else '')

report=[]
for dp,dn,fns in os.walk(ROOT):
    dn[:]=[d for d in dn if d not in ('.git','.vercel','.vercel-tmp','libs','images')]
    for fn in sorted(fns):
        if not fn.endswith('.html'): continue
        p=os.path.join(dp,fn); rel=os.path.relpath(p,ROOT)
        t=open(p,encoding='utf-8').read(); orig=t
        m=HEAD_RE.search(t)
        if m:
            comp=compensate(m.group(0).replace(build_header(active_index(rel)),''))  # 只对旧块净差补偿
            t=t[:m.start()]+build_header(active_index(rel))+comp+t[m.end():]
        for f in re.finditer(r'<footer class="jd-footer">.*?</footer>',t,re.S):
            t=t[:f.start()]+FOOTER+t[f.end():]; break
        if t!=orig:
            open(p,'w',encoding='utf-8').write(t); report.append(rel)
print('更新文件数:',len(report))
