#!/usr/bin/env python3
# _sync-packages.py｜母版 -> 两包同步（布局裸名由本脚本唯一处理，勿手写 sed 复制）
# 布局差异只有一处根因：母版文件在 docs/prompts/ 下，两包按"包根平铺"放在包根。
# 同步时把母版正文里对这些文件的**路径引用**一并归一成裸名，否则包内读者按路径找不到文件。
# 用法：python3 scripts/_sync-packages.py [要同步的文件...]
import io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAIRS = [
    ("AGENTS.md", "AGENTS.md"),
    ("README.md", "README.md"),
    ("README.en.md", "README.en.md"),  # 2026-10-08：此前漏同步，两包 README 的英文链接全是死链
    ("USER_MODEL_OVERRIDE.md", "USER_MODEL_OVERRIDE.md"),
    ("ORCA治理体系说明.md", "ORCA治理体系说明.md"),
    ("GOVERNANCE_VERSION", "GOVERNANCE_VERSION"),
    ("CHANGELOG.md", "CHANGELOG.md"),  # 2026-10-09：变更说明正典随包分发
    ("经验一句话.md", "经验一句话.md"),
    ("docs/prompts/编排者提示词.md", "编排者提示词.md"),
    ("docs/prompts/外部开发者提示词.md", "外部开发者提示词.md"),
    ("docs/prompts/Orca 编排治理监督者提示词.md", "Orca 编排治理监督者提示词.md"),
    ("docs/prompts/Orca 通用编排者持续推进协议.md", "Orca 通用编排者持续推进协议.md"),
    ("docs/prompts/迁移整理提示词.md", "迁移整理提示词.md"),   # 仅老包有
    ("docs/templates/归位表.template.md", "归位表.template.md"),
]
# 全目录同步的（本来就只有规则/规范文件；docs/assets 是 README 用的示意图，按二进制拷贝）
DIRS = ["docs/roles", "docs/sop", "scripts/model", "docs/assets"]
# 只同步 *.template.md 的（这几个目录里混有母版自己的实例记录：BUGS-*.md / CODE_REVIEW-*.md /
#   GOVERNANCE_REVIEW-*.md / RESEARCH_REVIEW-*.md / PLAN-*.md / HANDOFF.md 等，**模板包不该带实例记录**）
TEMPLATE_DIRS = ["docs/pm", "docs/plan", "docs/qa", "docs/review", "docs/handoff"]
EXTRA = ["scripts/detect-client.sh", "scripts/model/check-ledger.mjs",
         "scripts/check-channel-preflight.sh",  # weekly-channel-check.sh 是母版 launchd 专用，不随包分发
         # 账本空壳（2026-10-07 补）：此前不在同步清单里，母版改动后 check-sync 报 SYNC-FAIL。
         # 母版只留 _example 模板行，真实行落各项目自己的账本；此处同步保证两包拿到同一份空壳。
         "docs/model/TASK-MODEL-LOG.jsonl",
         "docs/model/DISPATCH-LOG.jsonl",
         "docs/model/TASK-MANAGER-QUALIFICATION-EVENTS.jsonl",
"docs/model/JEV-DECISION-LOG.jsonl",
          "docs/sop/app-brand-assets.md",  # 2026-10-08：APP 品牌资产单一真源
          "docs/sop/app-navigation.md"]  # 2026-10-09：APP 导航与视觉方向单一真源（云端产品顾问 V1.3 对齐）
# 母版正文里的路径引用 -> 包内裸名
STRIP = ["docs/prompts/编排者提示词", "docs/prompts/外部开发者提示词",
         "docs/prompts/Orca 编排治理监督者提示词", "docs/prompts/Orca 通用编排者持续推进协议",
         "docs/prompts/迁移整理提示词", "docs/templates/归位表.template"]


def strip_paths(text):
    for s in STRIP:
        text = text.replace(s, s.split("/")[-1])
    return text


def collect():
    out = []
    for src, dst in PAIRS:
        if os.path.exists(os.path.join(ROOT, src)):
            out.append((src, dst))
    for d in TEMPLATE_DIRS:
        dd = os.path.join(ROOT, d)
        if not os.path.isdir(dd):
            continue
        for name in sorted(os.listdir(dd)):
            if name.endswith(".template.md"):
                out.append((os.path.join(d, name), os.path.join(d, name)))
    for d in DIRS:
        dd = os.path.join(ROOT, d)
        if not os.path.isdir(dd):
            continue
        for name in sorted(os.listdir(dd)):
            p = os.path.join(d, name)
            if os.path.isfile(os.path.join(ROOT, p)):
                out.append((p, p))
    for e in EXTRA:
        if os.path.exists(os.path.join(ROOT, e)):
            out.append((e, e))
    return out


def main():
    only = set(sys.argv[1:])
    pairs = collect()
    if only:
        pairs = [(s, d) for s, d in pairs if s in only or os.path.basename(s) in only]
        if not pairs:
            print("WARN: no matched files")
            return
    for pkg in ("新项目模板包", "老项目迁移模板包"):
        n = 0
        for src, dst in pairs:
            s = os.path.join(ROOT, src)
            if not os.path.exists(s):
                continue
            if pkg == "新项目模板包" and os.path.basename(src) == "迁移整理提示词.md":
                continue  # 迁移提示词仅老包有
            out = os.path.join(ROOT, pkg, dst)
            os.makedirs(os.path.dirname(out), exist_ok=True)
            if os.path.splitext(src)[1].lower() in (".png", ".jpg", ".jpeg", ".gif", ".webp"):
                with open(s, "rb") as fi, open(out, "wb") as fo:
                    fo.write(fi.read())
                n += 1
                continue  # 图片走二进制拷贝，不做路径归一化
            text = strip_paths(io.open(s, encoding="utf-8").read())
            io.open(out, "w", encoding="utf-8").write(text)
            if src.endswith(".sh"):
                os.chmod(out, 0o755)
            n += 1
        print("synced %d files -> %s" % (n, pkg))


def prune():
    """清掉两个包里多出来的母版实例记录（历史同步误带进来的）。"""
    removed = 0
    for pkg in ("新项目模板包", "老项目迁移模板包"):
        for d in TEMPLATE_DIRS + ["docs"]:
            dd = os.path.join(ROOT, pkg, d)
            if not os.path.isdir(dd):
                continue
            for name in os.listdir(dd):
                fp = os.path.join(dd, name)
                if os.path.isfile(fp) and name.endswith(".md") and not name.endswith(".template.md"):
                    # 提示词类平铺文件在包根，不在 docs/ 下，这里只清 docs/ 子目录里的实例记录
                    os.remove(fp)
                    removed += 1
    print("pruned %d stray instance docs from packages" % removed)


if __name__ == "__main__":
    main()
    if "--prune" in sys.argv:
        prune()