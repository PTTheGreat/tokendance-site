# every15min — Guideline 2.1 Information Needed 回复稿

> 用法：把下面 `--- 分隔线之间的英文正文` 整段粘进 App Store Connect 的 **Reply to App Review**，
> 同时把同样内容存一份到 **App Review Information → Notes**（Apple 明确要求以后每次提交都带上）。
>
> **测试设备**：iPhone Air · iOS 26.6（已填入正文第 2 段）。
>
> **本稿对应的是已提交的 v1.0.0 / build 1**，即仓库 commit `5d63392` 及之前的状态：
> 纯本地、零网络请求、6 套主题、命令里还有 `:prefix`。
> 之后 `abd7aa0`（build 2）才加了 CloudKit 同步，`22138bb` 才加了 4 套新主题——
> 这些都**不在**审核中的这个包里，所以稿子里一个字都没提。
> 将来提交 build 2 时，第 5 段和第 1 段必须改写（见文末第 3 条）。

---

Hello App Review Team,

Thank you for taking the time to review every15min. Below is the information you asked for, in the same order as your message. I have also added all of it to the App Review Information → Notes field for future submissions.

**1. Screen recording**

A screen recording captured on a physical iPhone Air running iOS 26.6 is attached to this submission. It begins by launching the app from the Home Screen and walks through the typical user flow and every core feature:

- Cold launch from the Home Screen into the main log view for today
- The header (rhythm interval, date, day-of-year counter) and the status line (countdown to the next slot, gap since the last entry, today's count, current streak)
- Typing and saving several entries in succession from the bottom prompt, each one appended to the day with its own timestamp
- Attaching a photo to an entry with the `+img` control and the system photo picker, and the resulting inline thumbnail in the log. Note that **no permission dialog appears**: SwiftUI's `PhotosPicker` runs out of process and requires no photo-library access or purpose string
- `:help` — the complete command list, which is the single entry point to every feature in the app
- `:theme` — switching between the six color palettes by tapping a row in the command output
- `:interval` — changing the capture rhythm, with the header and the next-slot countdown updating to match
- `:cal` — the month calendar with per-day density, tapping a day to open it, and `:today` to return
- `:find` — full-text search across all entries, grouped by day, then `:find` with no argument to clear the search
- `:stats` — lifetime totals
- `:export` — writing a JSON backup out through the system document picker. The destination is chosen by the user in the picker; in the recording that choice was iCloud Drive. This is the system Files app acting on the user's instruction — the app itself performs no upload and has no iCloud entitlement
- The 24-hour activity histogram at the bottom updating as entries accumulate
- Adding the Home Screen widget, which shows today's count and the next slot, and tapping it to jump straight back into the app with the prompt focused

The recording covers the app in full. The only commands not shown are `:import` (the mirror image of `:export`, reading a local file back in), `:tags` (browsing entries by hashtag), `:goto`, `:prefix`, `:cls`, `:about` and `:reset`, plus a few easter eggs. None of them involves an account, a purchase, a network request, or a permission prompt. I am glad to record any of them as well, or to provide a TestFlight build, if that would help.

Regarding the specific flows you listed:

- **Account registration, login, account deletion** — the app has none. every15min has no account system, no sign-in of any kind, and no user identity. There is therefore no such flow to record. Because no account is ever created, there is nothing for a user to delete beyond their own data: the `:reset --yes` command erases all locally stored entries, and deleting the app removes all of its data along with it.
- **Paid content, purchase or subscription flows** — every15min is a **paid-up-front app**. There is no In-App Purchase, no subscription, no auto-renewable content, and no StoreKit code in the binary. The entire app is unlocked for anyone who has downloaded it, so there is no purchase flow inside the app to record. Nothing in the app is gated behind a payment.
- **User-generated content** — entries are private, personal notes stored only on the user's own device. There is no server, no account, no feed, no sharing between users, no comments, no profiles, and no way for one user to see another user's content. Because no user can ever be exposed to content authored by another user, there is no reporting or blocking mechanism, and none is applicable.
- **Prompts requesting access to sensitive data or device capabilities** — the app requests **none**. It does not use location, contacts, camera, microphone, health data, notifications, or App Tracking Transparency, and it displays no permission dialogs at any point. Photo attachments use SwiftUI's `PhotosPicker`, which runs out of process and does not require photo-library access or a purpose string. This is why no permission prompt appears in the recording.

**2. Devices and operating systems tested**

- iPhone Air — iOS 26.6 (physical device; this is the device used for the attached recording)

The app is iPhone-only (`TARGETED_DEVICE_FAMILY = 1`), portrait-only, and its minimum deployment target is iOS 17.0. All pre-submission testing was performed on the physical device above, not in the Simulator.

**3. App functions and target audience**

*Problem it solves.* Conventional journaling and habit apps ask for commitment: a daily prompt, a streak to protect, a structured template to fill in. Most people abandon them within a week. every15min removes the commitment. It is a plain, append-only log of what just happened — one timestamped line at a time — with no prompts, no goals, no nagging, and no notifications.

*How it works.* The app presents the day as a stack of timestamped lines rendered in a terminal-inspired, monospaced interface. A rhythm interval (15 minutes by default, configurable to 5/10/30/60 or any minute count) marks the next slot and shows the elapsed gap since the last entry, giving a lightweight sense of the shape of the day without ever demanding an entry. A 24-hour sparkline histogram summarizes activity at a glance. The single input field at the bottom is dual-mode: typing plain text logs a moment; typing `:` opens a real command palette with tab completion and history for search, calendars, tags, themes, statistics, export and import.

*Core features.* Timestamped text entries with optional photo attachments (up to four per entry) and inline hashtags; day-by-day navigation and a density-colored month calendar; full-text search and a hashtag browser; lifetime statistics; six color themes; a Home Screen widget showing today's count and the next slot, with one-tap capture; and JSON export/import that can optionally be encrypted with a user-supplied passphrase (PBKDF2-SHA256 → AES-GCM-256 via Apple's CryptoKit).

*Target audience.* Adults who want a frictionless personal log — developers, writers, researchers, and anyone who has bounced off structured journaling apps. The interface deliberately borrows the density and keyboard-first conventions of a terminal, which is the aesthetic this audience is fluent in. The app contains no objectionable content and is suitable for a general audience.

*Value it provides.* A personal record you will actually keep, because logging costs one line and nothing is ever demanded of you — and a record that stays entirely under your control, on your own device, with no account, no server, no ads, no analytics and no tracking.

**4. Setup and access instructions**

No setup is required and no credentials are needed. There is no account, no login, no demo account, no activation code, no server-side configuration, and no sample file to import. Every feature is reachable immediately on first launch:

1. Launch the app. The log view for today appears directly after the splash screen.
2. Tap the prompt at the bottom, type any text, and press return to save your first entry.
3. Tap the `[+img]` control next to the prompt to attach photos to an entry.
4. Type `:` in the same prompt to enter command mode, then `help` (or press tab) to see every available command. `:help` is the single entry point to the entire feature set.
5. From there, every feature is one command away: `:cal`, `:find <query>`, `:tags`, `:stats`, `:theme`, `:interval <min>`, `:prefix`, `:goto <YYYY-MM-DD>`, `:j` / `:k` / `:today`, `:export`, `:import`, `:about`, `:cls`, `:reset --yes`.
6. To see the widget, long-press the Home Screen, add the every15min widget, and tap it to jump straight into capture.

The app ships with no seeded data, so a fresh install starts on an empty day. If it is useful for the review, adding two or three entries and then running `:cal` and `:stats` will populate the calendar and statistics views immediately.

**5. External services, tools and platforms**

every15min uses **no external services of any kind, and makes no network requests at all**.

- There is no backend server operated by us, and no server the app communicates with. The app has no networking code and performs no HTTP requests, no sockets, and no background transfers.
- There is no authentication service, no payment processor, no data provider, no AI or machine-learning service, no advertising network, and no analytics or crash-reporting SDK.
- There is no cloud sync and no cloud backup in this version. The app declares no iCloud or CloudKit entitlement and no background modes.
- The app links against no third-party libraries whatsoever. It is built entirely on Apple's own frameworks: SwiftUI, SwiftData, WidgetKit, PhotosUI, and CryptoKit.

All entries are stored in a SwiftData database inside an App Group container on the device — the App Group exists solely so the Home Screen widget can read today's summary from the same on-device file. Nothing ever leaves the device unless the user explicitly runs `:export`, which hands a file to the system document picker; the destination is the user's own choice there. In the attached recording that choice was iCloud Drive — that is the system Files app saving a file on the user's instruction, not the app syncing or uploading anything. The optional export encryption is performed entirely on device with Apple's CryptoKit; no key or passphrase is ever transmitted anywhere. `:import` likewise reads a local file the user picks.

The app's `PrivacyInfo.xcprivacy` accordingly declares no tracking, no tracking domains, and no collected data types.

**6. Regional differences**

The app is functionally identical in every region and in every storefront. There is no geofencing, no region-gated content, no region-specific pricing tier beyond the standard App Store price for the storefront, no localized content library, and no feature that is enabled or disabled based on country, IP address, or carrier. The interface is currently English-only, and all entry text is stored verbatim as the user types it, so it supports any language and script the system keyboard can produce, including CJK and right-to-left text.

**7. Regulated industry and third-party material**

every15min does not operate in a regulated industry and contains no protected third-party material. It is a personal note-taking utility. It provides no financial, medical, legal, gambling, cryptocurrency, dating, or other regulated service. It does not connect to any regulated provider, does not process payments, and does not require licensing or authorization of any kind. All content in the app — the interface, the icon, the color themes, and the copy — is original work created by us. The app contains no third-party trademarks, no licensed data sets, and no user-facing content sourced from anyone else.

Please let me know if anything above needs more detail, or if there is a specific flow you would like recorded in more depth. I am happy to provide an additional recording or a TestFlight build right away.

Kind regards,
Tony
TokenDance

---

## 提交前请自己核一遍（中文，不要粘给 Apple）

1. **设备与系统已填好**：iPhone Air / iOS 26.6。Apple 明确要 "latest operating system"，
   确认录屏就是在这台真机、这个系统上录的，别用模拟器。
2. **第 1 段已按补录的那条录屏写好**，逐条对应分镜：冷启动 → 顶栏与状态行 → 连续输入 →
   `+img` 配图（并点明不弹权限）→ `:help` → `:theme` → `:interval` → `:cal` + `:today` →
   `:find` + 清除 → `:stats` → `:export` 存到本机 → 直方图 → 加小组件并点回 App。

   **发之前拿录屏对一遍这 13 行**，哪一步实际没拍到就删掉那行。Apple 会照着清单看视频，
   写了没演比少写更扣分。末尾那句「可以再补录 / 给 TestFlight」保留着，留一个缓冲。

   `:import` `:tags` `:goto` `:prefix` `:cls` `:about` `:reset` 和彩蛋都明确写了没演，这样交代反而干净。

   注：`:tags` 我归到「没演」那一侧了（脚本里它是可选步骤，取决于你有没有打 `#标签`）。
   如果你实际演了，把它从「not shown」那句里删掉、加进上面的清单即可。

3. **别把 main 分支的现状当成审核中的包**。这是这份稿子最容易出错的地方：
   - `abd7aa0`（8/16 16:31，build 2）才加了 CloudKit 同步 + iCloud entitlement + `remote-notification` 后台模式；
   - `22138bb` 才加了 nord / rose-pine / vesper / oled 四套主题（build 1 只有 6 套）；
   - `0dd8383` 才把 `:help` 改成独立面板、并把 prefix 固定成 `:`（build 1 里 `:prefix` 还能改）。

   你提交的是这些之前的 v1.0.0 / build 1，所以稿子第 5 段写的是"零网络请求、无 iCloud entitlement"，
   这和 build 1 的 entitlements（只有 App Group）完全一致。
   **等哪天提交 build 2，第 5 段必须重写**成"通过 SwiftData CloudKit mirroring 同步到用户自己的
   iCloud 私有库"，同时说明 `remote-notification` 只用于静默同步推送、不弹通知权限。
4. **隐私标签（Privacy Nutrition Label）保持"不收集任何数据"**。build 1 纯本地，
   `PrivacyInfo.xcprivacy` 里 `NSPrivacyCollectedDataTypes` 为空数组是对的，不用改。
   同样地，上架 build 2 时这里也不用改（CloudKit 私有库不算开发者收集数据），
   但商店文案要从"数据完全不离开设备"改成"只存在你的设备和你自己的 iCloud"。
5. **2.3.3 截图**：Apple 在信里顺带提醒了截图规则。确认商店截图是真实运行界面
   （日志页、日历、搜索、统计），不要用启动页或纯标题图。
6. **付费方式**：稿子里写的是"paid-up-front app, no IAP"。如果你其实是免费下载 + 内购解锁，
   第 1 条和第 5 条要改，告诉我我来改。
