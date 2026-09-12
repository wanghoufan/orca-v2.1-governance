# HANDOFF｜L3 Watchdog 部署测试（交接给 Orca 编排者）

- Stage ID：watchdog-deploy-test（2026-09-12）
- 项目：ORCA V2.1 治理模板分发版（本仓库根）
- 交接人：前序编排者（Trae 窗口）｜接手人：Orca 编排者

## 0. 读盘顺序（照 ORCA 全体系唯一顺序）

`AGENTS.md`（根）→ `docs/roles/supervisor.md`（如需复检）→ 根 `USER_MODEL_OVERRIDE.md` → `docs/handoff/HANDOFF.md`（重点 §7/§8）→ 根 `经验一句话.md` → 本文件任务目标（最后读）。

## 1. 任务目标（P0）

把已收编的 L3 watchdog 在本机部署起来并验证三件事，产出部署记录。

- 背景：`scripts/orchestration/coordinator-watchdog-standalone.sh` 已收编（HANDOFF §8），部署 README 就在 `scripts/orchestration/README.md`，但**尚未在任何项目安装**（仅 0907懒得打字有一个项目级旧部署，状态码 2 待查）。
- 本任务只做"部署＋验证"，不要求构造真实编排漂移（那需要活 Run，属后续任务）。

## 2. 执行步骤

1. 读 `scripts/orchestration/README.md`（部署法、验证三件事、env 表、边界全在里面）。
2. 按其"部署"节执行：拷脚本到 `~/bin/` → 写 launchd plist（`com.orca.coordinator-watchdog`，120s 间隔）→ `launchctl load`。
3. 执行其"部署验证三件事"，逐条记录结果：
   - ① `launchctl list | grep coordinator-watchdog` 可见；
   - ② `launchctl kickstart -k gui/$(id -u)/com.orca.coordinator-watchdog` 手动触发成功（exit 0）；
   - ③ `tail -5 /tmp/coordinator-watchdog.log` 出现评估记录（`ok: no runs`/`ok: no runs discovered` 均算正常——当前没有活动编排）。
4. 顺手查旧部署：`launchctl list | grep watchdog` 若见 `0907懒得打字` 相关条目，记录其状态码与 plist 路径，判断是否与本部署冲突（同 Label 才冲突；项目级旧 Label 不同则共存，记一笔即可，不卸载）。
5. 写部署记录到 `docs/handoff/HANDOFF.md` §8 追加一行（日期＋三件事结果＋旧部署共存情况）。

## 3. 验收标准（机器可查）

- `launchctl list | grep coordinator-watchdog` 非空；
- `~/Library/LaunchAgents/com.orca.coordinator-watchdog.plist` 存在且 `plutil -lint` 通过；
- `/tmp/coordinator-watchdog.log` 存在且含至少一条本次触发的时间戳记录；
- HANDOFF §8 有部署记录行。

## 4. 红线（违反即打回）

- 不 commit、不 push（本次改动只落工作区，用户未授权提交）。
- 不碰 `1.Active/` 下任何业务项目；不卸载既有的 0907 项目级 watchdog。
- watchdog 本身只唤醒不代做：本任务也不得为"制造漂移"去启动任何编排 Run。
- 不改 V1.10/V2.0 封存；不动 `docs/history/` 未决文件。
- 每轮末三行心跳：目标/剩 P0/下一步。
- 分歧：技术分歧听 code-reviewer，范围分歧报用户。
