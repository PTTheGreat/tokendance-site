# every15min 补录脚本（build 1 / v1.0.0）

目标：让 Apple 一眼看到「核心功能都在、都能跑」。总时长 90～120 秒即可，不用剪辑。
下面每一步都按 build 1（commit `5d63392`）的真实行为核过，不会有跑不通的步骤。

---

## 录之前（30 秒准备）

- 真机 iPhone Air / iOS 26.6，竖屏，**不要用模拟器**
- 打开勿扰，避免横幅弹进画面（你上次那条已经是勿扰状态，保持）
- **把 App 从后台划掉**——Apple 明确要求「begin with launching the app」，必须从桌面图标点进去
- 桌面留一屏干净的，结尾要加小组件
- 输入内容用无所谓的英文短句，别带私人信息
- 建议先 `:reset --yes` 清空，从空白的一天开始录，"从无到有"最好看

---

## 分镜（照着做，括号里是预计秒数）

**① 冷启动（0:00–0:08）**
从桌面点 every15min 图标 → 启动屏 → 停在今天的日志页。
让顶栏、状态行、空的日志区各停 2 秒，别急着划走。

**② 连续记三条（0:08–0:30）**
点底部输入框，依次输入并回车：
```
morning coffee
pushed the export fix
call with mom, 12 min
```
每条回车后停一下，让时间戳和 `today N` 计数变化被看清。

**③ 配图（0:30–0:45）**
再输一条 `light on the way home`，**回车前**先点 `+img` → 系统相册选一张风景图 → 回车。
镜头停 2 秒，让缩略图和底部 24h 直方图的变化看清楚。

> 这一步很关键：它同时证明了「有照片附件功能」和「不需要相册权限弹窗」（`PhotosPicker` 是跨进程的）。

**④ `:help`（0:45–1:00）**
输入 `:help` 回车。这是**性价比最高的一镜**——一屏把全部命令交代完。
慢慢往上滑一遍，让命令列表整个露出来。

**⑤ 切主题 + 切节奏（1:00–1:15）**
```
:theme
```
回车 → 出现 6 个主题带色块 → **点其中一行**（比如 tokyo-night），界面整体变色。
接着：
```
:interval 15
```
回车 → 顶栏从 `30m` 变回 `15m`，状态行的 next 时间跟着变。

> 你上次录屏切了主题和节奏，这次照做，只是把它放在 `:help` 之后，逻辑更顺。

**⑥ 日历（1:15–1:30）**
```
:cal
```
回车 → 月历接管日志区，今天带密度色 → **点今天那一格**跳回去 → 再输 `:today`。

**⑦ 搜索 + 标签（1:30–1:45）**
```
:find coffee
```
回车 → 结果按天分组接管视图 → 再输 `:find` 回车清除搜索（不带参数就是清除）。
如果记的时候带了 `#tag`，再演一下 `:tags`；没带就跳过这步。

**⑧ 统计（1:45–1:52）**
```
:stats
```
回车 → 总计数字出来，停 2 秒。

**⑨ 导出（1:52–2:05）**
```
:export
```
回车 → 系统「存储到文件」面板弹出 → **存到「我的 iPhone」**（别存 iCloud Drive，
免得和申诉稿里"无网络请求"的说法产生歧义）→ 看到保存成功。

> 这一镜证明数据可携出、且全程是系统文件面板，没有任何服务器参与。

**⑩ 小组件（2:05–2:20）**
回桌面 → 长按空白处 → 加号 → 找到 every15min → 添加小组件 →
小组件上显示今天的条数和下一格时间 → **点一下小组件**，跳回 App 并自动聚焦输入框。

录完。不用演 `:reset`、`:import`、`:goto`、`:prefix`，也不用演彩蛋（`:sl` `:cowsay` `:fortune`）。

---

## 录完之后

把申诉稿第 1 段整段换成下面这版（已按上面分镜写好），
或者直接告诉我"录好了"，我来替你换掉 `every15min-REPLY-PASTE.txt`。

```
1. Screen recording

A screen recording captured on a physical iPhone Air running iOS 26.6 is attached to
this submission. It begins by launching the app from the Home Screen and walks through
the typical user flow and every core feature:

- Cold launch from the Home Screen into the main log view for today
- The header (rhythm interval, date, day-of-year counter) and the status line
  (countdown to the next slot, gap since the last entry, today's count, current streak)
- Typing and saving several entries in succession, each appended with its own timestamp
- Attaching a photo to an entry with the +img control and the system photo picker, and
  the resulting inline thumbnail — note that no permission dialog appears, because
  SwiftUI's PhotosPicker runs out of process and requires no photo-library access
- :help — the complete command list, which is the single entry point to every feature
- :theme — switching between the six color palettes by tapping a row in the output
- :interval 15 — changing the capture rhythm, and the header and countdown updating
- :cal — the month calendar with per-day density, tapping a day to open it, and :today
  to return
- :find coffee — full-text search across all entries, grouped by day, then :find with no
  argument to clear the search
- :stats — lifetime totals
- :export — writing a JSON backup out through the system document picker and saving it
  to On My iPhone. This is a local file operation; no server is involved
- Adding the Home Screen widget, which shows today's count and the next slot, and
  tapping it to jump straight back into the app with the prompt focused

The recording covers the app in full. The only commands not shown are :import (the
mirror image of :export, reading a local file back), :goto, :prefix, :cls, :about and
:reset, plus a few easter eggs; none of them involves an account, a purchase, a network
request, or a permission prompt.
```

---

## 顺带确认

- **`:interval` 这次要写进去了**。你说 30m 是录屏里切的——上一版稿子没写，现在这版第 ⑤ 步和
  上面的英文都补上了。
- **`:export` 存到「我的 iPhone」而不是 iCloud Drive**。build 1 没有任何 iCloud entitlement，
  申诉稿第 5 段写的是"零网络请求"。存 iCloud Drive 虽然是系统行为、和 App 无关，
  但画面上出现 iCloud 字样容易让审核多问一句，避开更省事。
