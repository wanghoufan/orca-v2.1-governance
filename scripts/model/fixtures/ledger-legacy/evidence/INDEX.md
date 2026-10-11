# 历史兼容执行证据（持久化）

由 `node scripts/model/ledger-evidence.mjs` 生成。

每个子目录含：**实际输入副本**（input/，保留原项目目录名）、**基线副本**（baseline.json）、
**可执行复现命令与退出码**（command.txt）、**完整输出**（stdout.txt / stderr.txt）、
**argv/env/cwd/时间/代码哈希/基线哈希**（result.json）。

| 用例 | 说明 | 退出码 | 目录 |
|---|---|---|---|
| 01-approved-baseline | 已审批清单 + 原历史行 → 豁免生效（WARN），exit 0 | 0 | ./fixtures/ledger-legacy/evidence/01-approved-baseline |
| 02-pending-baseline | PENDING 清单 → 零授权，used 仍 FAIL，exit 1 | 1 | ./fixtures/ledger-legacy/evidence/02-pending-baseline |
| 03-duplicate-line | 已批行原样复制到第 2 行 → 第 1 行豁免、第 2 行 FAIL（防复制靠 line_no+sha，非消费集合） | 1 | ./fixtures/ledger-legacy/evidence/03-duplicate-line |
| 04-legal-append | 已批历史 + 合法新记录 → 豁免与新行并存，exit 0 | 0 | ./fixtures/ledger-legacy/evidence/04-legal-append |
| 05-no-source-file | 删除项目身份文件 GOVERNANCE-SOURCE.json → 来源不匹配，零豁免，exit 1 | 1 | ./fixtures/ledger-legacy/evidence/05-no-source-file |
| 06-result-null-still-hard | 同文件追加 result=null → 豁免不放宽结果硬错误，exit 1 | 1 | ./fixtures/ledger-legacy/evidence/06-result-null-still-hard |
| 07-two-fields-one-row | 同一物理行 used+runtime，只批 used → used 豁免、runtime 仍 FAIL，exit 1 | 1 | ./fixtures/ledger-legacy/evidence/07-two-fields-one-row |
| 08-self-made-cannot-authorize | 正式脚本 + 真实存在的自造清单（但不注入）→ 零豁免，exit 1；证明正式入口无签发能力 | 1 | ./fixtures/ledger-legacy/evidence/08-self-made-cannot-authorize |
