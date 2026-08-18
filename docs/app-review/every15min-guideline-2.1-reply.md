# every15min — Guideline 2.1 Information Needed 回复稿

> 用法：把下面 `--- 分隔线之间的英文正文` 整段粘进 App Store Connect 的 **Reply to App Review**，
> 同时把同样内容存一份到 **App Review Information → Notes**（Apple 明确要求以后每次提交都带上）。
>
> **提交前必须替换的占位符**：`[[iOS 版本]]`。其余内容已按仓库 `PTTheGreat/every15min` 的
> `ios/` 源码核对过，可直接使用。

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
- `:help` (full command list), `:theme` (switching the color palette), `:interval` (changing the 15-minute rhythm)
- `:cal` (month calendar with per-day density), tapping a day to jump to it, `:j` / `:k` / `:today` for day navigation
- `:find` (full-text search across all entries, grouped by day) and `:tags` (browsing entries by hashtag)
- `:stats` (lifetime totals)
- `:export` and `:export -e <passphrase>` (writing a JSON backup out through the system share sheet, optionally encrypted), and `:import` (reading one back in)
- The Home Screen widget and its tap-to-capture deep link back into the app

Regarding the specific flows you listed:

- **Account registration, login, account deletion** — the app has none. every15min has no account system, no sign-in of any kind, and no user identity. There is therefore no such flow to record. `:reset --yes` erases all locally stored entries, and deleting the app removes all of its data; both are shown in the recording.
- **Paid content, purchase or subscription flows** — every15min is a **paid-up-front app**. There is no In-App Purchase, no subscription, no auto-renewable content, and no StoreKit code in the binary. The entire app is unlocked for anyone who has downloaded it, so there is no purchase flow inside the app to record. Nothing in the app is gated behind a payment.
- **User-generated content** — entries are private, personal notes. They are stored only on the user's own device and their own iCloud private database. There is no server, no feed, no sharing between users, no comments, no profiles, and no way for one user to see another user's content. Because no user can ever be exposed to content authored by another user, there is no reporting or blocking mechanism, and none is applicable.
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
5. From there, every feature is one command away: `:cal`, `:find <query>`, `:tags`, `:stats`, `:theme`, `:interval <min>`, `:goto <YYYY-MM-DD>`, `:export`, `:import`, `:about`, `:reset --yes`.
6. To see the widget, long-press the Home Screen, add the every15min widget, and tap it to jump straight into capture.

The app ships with no seeded data, so a fresh install starts on an empty day. If it is useful for the review, adding two or three entries and then running `:cal` and `:stats` will populate the calendar and statistics views immediately.

**5. External services, tools and platforms**

every15min uses **no third-party services of any kind**. There is no backend server operated by us, no authentication provider, no payment processor, no data provider, no AI or machine-learning service, no advertising network, and no analytics or crash-reporting SDK. The app links against no third-party libraries; it is built entirely on Apple's own frameworks (SwiftUI, SwiftData, WidgetKit, PhotosUI, CryptoKit).

The only network-capable component in the app is **Apple's own CloudKit**, used through SwiftData's CloudKit mirroring:

- Entries are stored in a SwiftData store inside an App Group container on the device, mirrored to the user's **own iCloud private database** (container `iCloud.app.every15min`) so their entries stay in sync across their own devices.
- This is the user's private CloudKit database. The data is not visible to us as the developer, is never sent to any server we operate, and is never shared with any third party. We have no way to read it.
- The `remote-notification` background mode declared in the app is used solely by CloudKit to receive silent sync pushes. It does not present notifications to the user and does not request notification permission.
- If the iCloud entitlement or capability is unavailable at runtime, the app falls back to a purely local store and continues to work normally.

Nothing else in the app performs any network request. Export and import operate entirely on local files through the system document picker and share sheet. The optional export encryption is performed on device with Apple's CryptoKit; no key or passphrase is ever transmitted anywhere.

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
2. **录屏内容要对得上第 1 条的清单**。上面那份清单是按仓库里实际实现的命令写的
   （`:help :theme :interval :find :tags :cal :goto :j :k :today :stats :export :import :reset :cls :about`）。
   录屏里没出现的，就把那一行删掉——Apple 会照着清单看录屏，写了没演反而扣分。
3. **CloudKit 这件事必须照实写**（第 5 条已经写了）。你回答我"完全没有第三方、无网络请求"，
   但 `ios/Every15min/Every15minApp.swift` 里是 `SharedStore.makeContainer(cloudKit: true)`，
   entitlements 里有 `iCloud.app.every15min` + CloudKit，Info.plist 里有 `remote-notification` 后台模式。
   写成"纯本地无网络"会和二进制对不上，风险比照实说大得多。CloudKit 是 Apple 自家服务、走用户自己的
   私有库，照实说完全是加分项，不是问题。
4. **顺带检查 App 隐私标签（Privacy Nutrition Label）**：既然启用了 CloudKit 同步，
   隐私标签和商店文案不要写成"数据完全不离开设备"，改成"数据只存在你的设备和你自己的 iCloud"。
   `PrivacyInfo.xcprivacy` 现在声明 `NSPrivacyCollectedDataTypes` 为空数组，这是对的
   （CloudKit 私有库不算开发者收集数据），不用改。
5. **2.3.3 截图**：Apple 在信里顺带提醒了截图规则。确认商店截图是真实运行界面
   （日志页、日历、搜索、统计），不要用启动页或纯标题图。
6. **付费方式**：稿子里写的是"paid-up-front app, no IAP"。如果你其实是免费下载 + 内购解锁，
   第 1 条和第 5 条要改，告诉我我来改。
