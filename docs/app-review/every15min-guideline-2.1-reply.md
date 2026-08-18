# every15min — Guideline 2.1 Information Needed 回复稿

> 用法：把下面 `--- 分隔线之间的英文正文` 整段粘进 App Store Connect 的 **Reply to App Review**，
> 同时把同样内容存一份到 **App Review Information → Notes**（Apple 明确要求以后每次提交都带上）。
>
> **提交前必须替换的占位符**：`[[iOS 版本]]`。
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

A screen recording captured on a physical iPhone running the latest shipping iOS is attached to this submission. It starts from a cold launch of the app and walks through the complete typical user flow:

- Cold launch and splash screen
- The main log view: today's timestamped entries, the "next slot" countdown, the gap markers between entries, and the 24-hour activity histogram
- Typing and saving a new entry from the bottom prompt
- Attaching a photo to an entry with the system photo picker, and opening the attached image full screen
- Entering command mode with `:` and using tab completion
- `:help` (full command list), `:theme` (switching between the six color palettes), `:interval` (changing the 15-minute rhythm), `:prefix` (choosing the command prefix)
- `:cal` (month calendar with per-day density), tapping a day to jump to it, `:j` / `:k` / `:today` for day navigation
- `:find` (full-text search across all entries, grouped by day) and `:tags` (browsing entries by hashtag)
- `:stats` (lifetime totals)
- `:export` and `:export -e <passphrase>` (writing a JSON backup out through the system share sheet, optionally encrypted), and `:import` (reading one back in)
- The Home Screen widget and its tap-to-capture deep link back into the app

Regarding the specific flows you listed:

- **Account registration, login, account deletion** — the app has none. every15min has no account system, no sign-in of any kind, and no user identity. There is therefore no such flow to record. `:reset --yes` erases all locally stored entries, and deleting the app removes all of its data; both are shown in the recording.
- **Paid content, purchase or subscription flows** — every15min is a **paid-up-front app**. There is no In-App Purchase, no subscription, no auto-renewable content, and no StoreKit code in the binary. The entire app is unlocked for anyone who has downloaded it, so there is no purchase flow inside the app to record. Nothing in the app is gated behind a payment.
- **User-generated content** — entries are private, personal notes stored only on the user's own device. There is no server, no account, no feed, no sharing between users, no comments, no profiles, and no way for one user to see another user's content. Because no user can ever be exposed to content authored by another user, there is no reporting or blocking mechanism, and none is applicable.
- **Prompts requesting access to sensitive data or device capabilities** — the app requests **none**. It does not use location, contacts, camera, microphone, health data, notifications, or App Tracking Transparency, and it displays no permission dialogs at any point. Photo attachments use SwiftUI's `PhotosPicker`, which runs out of process and does not require photo-library access or a purpose string. This is why no permission prompt appears in the recording.

**2. Devices and operating systems tested**

- iPhone Air — iOS [[iOS 版本]] (physical device; this is the device used for the attached recording)

The app is iPhone-only (`TARGETED_DEVICE_FAMILY = 1`), portrait-only, and its minimum deployment target is iOS 17.0. All pre-submission testing was performed on the physical device above, not in the Simulator.

**3. App functions and target audience**

*Problem it solves.* Conventional journaling and habit apps ask for commitment: a daily prompt, a streak to protect, a structured template to fill in. Most people abandon them within a week. every15min removes the commitment. It is a plain, append-only log of what just happened — one timestamped line at a time — with no prompts, no goals, no nagging, and no notifications.

*How it works.* The app presents the day as a stack of timestamped lines rendered in a terminal-inspired, monospaced interface. A rhythm interval (15 minutes by default, configurable to 5/10/30/60 or any minute count) marks the next slot and shows the elapsed gap since the last entry, giving a lightweight sense of the shape of the day without ever demanding an entry. A 24-hour sparkline histogram summarizes activity at a glance. The single input field at the bottom is dual-mode: typing plain text logs a moment; typing `:` opens a real command palette with tab completion and history for search, calendars, tags, themes, statistics, export and import.

*Core features.* Timestamped text entries with optional photo attachments (up to four per entry) and inline hashtags; day-by-day navigation and a density-colored month calendar; full-text search and a hashtag browser; lifetime statistics; six color themes; a Home Screen widget showing today's count and the next slot, with one-tap capture; and JSON export/import that can optionally be encrypted with a user-supplied passphrase (PBKDF2-SHA256 → AES-GCM-256 via Apple's CryptoKit).

*Target audience.* Adults who want a frictionless personal log — developers, writers, researchers, and anyone who has bounced off structured journaling apps. The interface deliberately borrows the density and keyboard-first conventions of a terminal, which is the aesthetic this audience is fluent in. The app contains no objectionable content and is suitable for a general audience.

*Value it provides.* A personal record you will actually keep, because logging costs one line and nothing is ever demanded of you — and a record that stays entirely under your control, on your own device and in your own iCloud, with no account, no ads, no analytics and no tracking.

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

All entries are stored in a SwiftData database inside an App Group container on the device — the App Group exists solely so the Home Screen widget can read today's summary from the same on-device file. Nothing ever leaves the device unless the user explicitly runs `:export`, which writes a file through the system document picker to a destination the user chooses. The optional export encryption is performed entirely on device with Apple's CryptoKit; no key or passphrase is ever transmitted anywhere. `:import` likewise reads a local file the user picks.

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

1. **`[[iOS 版本]]` 必须换成真实版本号**（比如 `iOS 26.2`）。Apple 明确要 "latest operating system"，
   录屏所在设备的系统版本要和这里写的一致，别写模拟器。
2. **录屏内容要对得上第 1 条的清单**。清单是按 build 1（commit `5d63392`）实际有的命令写的
   （`:help :theme :interval :prefix :find :tags :cal :goto :j :k :today :stats :export :import :reset :cls :about`）。
   录屏里没出现的，就把那一行删掉——Apple 会照着清单看录屏，写了没演反而扣分。
   彩蛋命令（`:sl` `:cowsay` `:fortune` `:moo`）没写进去，不用演。
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
