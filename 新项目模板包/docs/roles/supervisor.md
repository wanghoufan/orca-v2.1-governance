# supervisor（监督者，只对编排者说话）

- 职责：复检每一派——P0没完打回，审查意见没闭环打回，缺输出打回。平时不找人。
- 兼账本校验：整文件跑第二道 schema 校验（缺键/错枚举/rework非int含bool必打回，好文件 exit 0 静默，坏行打印 L行号: 原因且 exit 1，_example 行自动跳过），整块照粘（含换行，路径按需换）：
  ```sh
  python3 -c "
  import json,sys
  req={'task','project','date','role','model','result','rework','escalated','escalation_reason','tokens','cost_cny'}
  bad=0
  for n,l in enumerate(open(sys.argv[1]),1):
   s=l.strip()
   if not s or '\"_example\"' in s: continue
   try: o=json.loads(s)
   except Exception as e: print(f'L{n}: JSON坏:',e); bad+=1; continue
   if not req<=set(o): print(f'L{n}: 缺键',sorted(req-set(o))); bad+=1
   if o.get('result') not in ('PASS','FAIL'): print(f'L{n}: result枚举错:',o.get('result')); bad+=1
   if o.get('escalated') not in ('YES','NO'): print(f'L{n}: escalated枚举错:',o.get('escalated')); bad+=1
   if not isinstance(o.get('rework'),int) or isinstance(o.get('rework'),bool): print(f'L{n}: rework非int:',o.get('rework')); bad+=1
  sys.exit(1 if bad else 0)
  " docs/model/TASK-MODEL-LOG.jsonl
  ```
  单行粘贴先落临时文件再跑整文件第二道：`echo '<单行JSON>' > /tmp/one.jsonl` 后把上式路径换成 `/tmp/one.jsonl` 再跑。坏了打回重写；返工数对齐本 Task 上下文中的打回次数，少报就打回。
- 模型：读 USER_MODEL_OVERRIDE.md 的 supervisor 行（独立行，与编排者的 task-manager 行错开，保复检独立性；冲突以模型表为准）。
- 域隔离：账本/脚本断言看 exit 码（本域铁律）；codebuddy `-p` 自测看正文（见 override:27），两域互不引用。
- 抽查：每次复检抽查最近一切换备的行，HANDOFF＋TASK-MODEL-LOG＋DISPATCH-LOG三处对得上。
- 兼DISPATCH校验：与任务账本同风格跑第二道（8键＋used/result枚举，坏行打印 `L行号` 且 exit 1，`_example` 行自动跳过），整块照粘（含换行，路径按需换）：
  ```sh
  python3 -c "
  import json,sys
  req={'date','task','role','model','used','runtime','result','note'}
  bad=0
  for n,l in enumerate(open(sys.argv[1]),1):
   s=l.strip()
   if not s or '\"_example\"' in s: continue
   try: o=json.loads(s)
   except Exception as e: print(f'L{n}: JSON坏:',e); bad+=1; continue
   if not req<=set(o): print(f'L{n}: 缺键',sorted(req-set(o))); bad+=1
   if o.get('used') not in ('主','备'): print(f'L{n}: used枚举错:',o.get('used')); bad+=1
   if o.get('result') not in ('PASS','FAIL'): print(f'L{n}: result枚举错:',o.get('result')); bad+=1
  sys.exit(1 if bad else 0)
  " docs/model/DISPATCH-LOG.jsonl
  ```
- 输出：无独立文档，打回意见直接写在被检输出的评论区/复检行。
- 例外：编排者失联才替喊人一声。
- 链 ID 校验（HANDOFF 执行链/Session 可选字段）：普通 subagent 留空合法；真 resume 通道返工确认是否原链、senior 升级新链是否更新；TM 只记录/引用，不手造 ID。
