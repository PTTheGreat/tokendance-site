# 守守 Goldie (EpiCare) — Guideline 2.1 Information Needed 回复稿

> 用法：把下面 `--- 分隔线之间的英文正文` 整段粘进 App Store Connect 的 **Reply to App Review**，
> 同时把同样内容存一份到 **App Review Information → Notes**。
>
> **提交前必须替换的占位符**：`[[iOS 版本]]`。
> **提交前建议先改一处代码**：见文末「必须先处理」第 2 条（ElevenLabs）。
>
> 这份 App 属于健康类，Apple 的第 7 条（受监管行业 / 第三方受保护材料）是这次的关键，
> 正文第 7 段是重点，不要删减。

---

Hello App Review Team,

Thank you for taking the time to review 守守 (Goldie). Below is the information you asked for, in the same order as your message. I have also added all of it to the App Review Information → Notes field for future submissions.

**1. Screen recording**

A screen recording captured on a physical iPhone running the latest shipping iOS is attached to this submission. It starts from a cold launch of a fresh install and walks through the complete typical user flow:

- Cold launch, splash, and the first-run onboarding: welcome → choosing a role ("I'm the patient" or "I'm a family member") → creating a local profile → finish
- **Meds tab** — adding a medication with the step-by-step wizard (name, dose, times of day, start date), then checking off a dose from today's list, the celebration animation on completing the day, back-filling a missed dose, and the consecutive-day streak
- **Seizures tab** — recording a seizure episode (time, duration, type, triggers, notes, optional photo), the post-episode follow-up sheet, and the history list a user would show a doctor at a follow-up appointment
- **Medical Records tab** — photographing or importing a document (lab result, prescription, discharge note) and filing it locally
- **Guard tab** — adding an emergency contact, adding first-aid information, displaying the pairing QR code, scanning it from a family member's device, the SOS button, and the safety check-in
- **Relax overlay** — a guided breathing session with voice guidance and haptics, including the on-device breath-rhythm sensing
- **Settings** — language switching, app icon selection, the Apple Health toggles, and the links to the website and privacy policy
- The Home Screen widget showing today's medication progress, and the Live Activity for an upcoming dose

Regarding the specific flows you listed:

- **Account registration, login, account deletion** — the app has none. 守守 has no account system, no sign-in of any kind, no server, and no user identity. The profile created during onboarding is a local record on the device only. There is therefore no registration, login, or account-deletion flow to record. Deleting the app deletes all of its data; there is no account left behind anywhere because none was ever created.
- **Paid content, purchase or subscription flows** — 守守 is **completely free**. There is no In-App Purchase, no subscription, no paid tier, no trial, no paywall, and no StoreKit code in the binary. Every feature is available to every user immediately. There is no purchase flow to record.
- **User-generated content** — everything a user enters (medication schedules, seizure logs, photos of medical documents, emergency contacts, personal profile) is private health information stored only on that user's own device. There is no server, no feed, no publishing, no messaging, no profiles, and no mechanism by which one user's content can ever reach another user. The QR pairing feature between a patient and a family member (described in section 5) transfers a small local identifier by scanning a code on screen; it does not transmit anything over a network and does not create shared or public content. Because no user can ever be exposed to content authored by another user, there is no reporting or blocking mechanism, and none is applicable.
- **Prompts requesting access to sensitive data or device capabilities** — the app requests notifications, camera, microphone, motion, and Apple Health access. **Every one of these prompts is shown in the recording**, in the context that triggers it, together with the feature that needs it. Each is optional; declining any of them leaves the rest of the app fully usable. The purpose strings are listed in section 3 below. The app does **not** use location, contacts, Bluetooth, or App Tracking Transparency, and it presents no ATT prompt.

**2. Devices and operating systems tested**

- iPhone Air — iOS [[iOS 版本]] (physical device; this is the device used for the attached recording)

The app is iPhone-only (`TARGETED_DEVICE_FAMILY = 1`), portrait-only, and its minimum deployment target is iOS 17.0. All pre-submission testing was performed on the physical device above, not in the Simulator. Automated unit and UI tests are also run against the app target as part of the build.

**3. App functions and target audience**

*Problem it solves.* Living with epilepsy — or caring for someone who does — means keeping track of a lot of small, easy-to-drop details: taking anti-seizure medication on time every single day, remembering what happened during an episode well enough to describe it at the next appointment, keeping medical documents together, and knowing that a family member can be reached quickly if something goes wrong. Most people manage this with a mix of paper notes, phone alarms and photos scattered across the camera roll, and details get lost precisely when they matter most — in the consulting room.

*How it works.* 守守 turns that work into small, completable daily tasks with a gentle, cartoon-dog companion as the guide. The app is organized into four tabs plus a relaxation overlay:

- **Meds** — medication schedules with local reminders, one-tap dose check-off, automatic grouping of multiple daily doses, easy back-filling of a missed dose without guilt, adherence streaks, a Home Screen widget, and a Live Activity for an upcoming dose.
- **Seizures** — a low-friction seizure log designed around what a neurologist actually asks at a follow-up: time, duration, type, suspected triggers, and free-text notes, with a short follow-up sheet after an episode. Optionally, an episode can also be written to Apple Health so it can be shared with a doctor through the Health app.
- **Medical Records** — a local archive for photographs of prescriptions, lab results and discharge notes, so they are in one place before an appointment.
- **Guard** — emergency contacts reachable in one tap, first-aid information for bystanders, an SOS button, an optional fall check-in that asks the user to confirm they are okay, and QR pairing so a family member's device can store the patient's contact details locally.
- **Relax** — guided breathing, progressive muscle relaxation, and grounding exercises with voice guidance and haptics, since stress and poor sleep are common seizure triggers. Relaxation sessions can optionally be saved to Apple Health as mindful minutes.

*Permissions and purpose strings.* Every permission is tied to exactly one feature, is optional, and is requested in context rather than up front:

- **Notifications** — medication reminders and fall check-ins. All notifications are local, generated on the device; no server is involved.
- **Camera** — "守守 uses the camera to photograph medical records and lab results for your archive, and to scan a family member's pairing QR code." Photos are stored on the device only.
- **Microphone** — "守守 needs the microphone to sense your breathing rhythm and provide a personalized guided experience." Audio is analyzed in real time on the device to pace the breathing guide; it is never recorded, stored, or transmitted.
- **Motion** — "守守 uses motion sensors while the app is open to detect a possible fall and ask you to confirm you are okay." Motion data is used only while the app is in the foreground and is never stored or transmitted.
- **Apple Health (read)** — "守守 reads your sleep data to help you notice possible seizure triggers such as lack of sleep." Sleep data is read on demand, used only on the device, and never leaves it.
- **Apple Health (write)** — "守守 can save relaxation sessions as mindful minutes and seizures as fainting records in the Health app, so you can share them with your doctor." Nothing is written without the user explicitly enabling the corresponding toggle in Settings.

*Target audience.* Adults living with epilepsy, and the family members who care for them. The app is intended for a general adult audience and contains no objectionable content. It is not directed at children under 13; because all data is stored on the device and no account exists, we do not and cannot collect personal information from anyone, including children.

*Value it provides.* A single, calm place where the daily work of managing a chronic condition actually gets done — medication taken on time, episodes recorded in enough detail to be useful at the next appointment, documents kept together, and a family member one tap away — with all of that health information staying on the user's own phone.

**4. Setup and access instructions**

No setup is required and no credentials are needed. There is no account, no login, no demo account, no activation code, no server-side configuration, and no sample file to import. Every feature is reachable immediately on first launch:

1. Launch the app and complete the short onboarding: tap "Get Started", choose **"I'm the patient"**, enter any name, and tap "Create Profile". (Choosing "I'm a family member" instead leads to the QR-scanning screen, which expects a patient device to pair with — for a single-device review, please choose "I'm the patient".)
2. **Meds tab** → tap "+" to open the medication wizard. Any medication name works; the built-in reference information appears for common anti-seizure medications. Set one or more times of day and save. The dose then appears in today's list and can be checked off immediately. Allow notifications when prompted to see the reminder flow.
3. **Seizures tab** → tap "+" to record an episode. All fields are optional except the time, so an entry can be saved in a few seconds. The entry then appears in the history list.
4. **Medical Records tab** → tap "+" and choose the camera or the photo library to file a document. This is where the camera prompt appears.
5. **Guard tab** → add an emergency contact (any name and number), view the first-aid information, and tap "Show QR Code" to see the pairing code. The SOS button is the red circular button; opening it shows the emergency contact list and the region-appropriate emergency number without placing a call until it is tapped.
6. **Relax** → open the relaxation overlay and start a breathing session. This is where the microphone prompt appears; declining it simply switches the guide to a fixed rhythm and everything else still works. The motion prompt appears the first time fall detection engages.
7. **Settings** → the Apple Health toggles are here; enabling one triggers the corresponding Health permission sheet. Language and app icon can also be changed here.

The app ships with no seeded data, so a fresh install starts empty. Adding one medication and one seizure entry is enough to populate the widget, the streak counter, and the history views.

**5. External services, tools and platforms**

The App Store build of 守守 makes **no network requests and uses no third-party services at runtime**. There is no backend server operated by us, no authentication provider, no payment processor, no data provider, no advertising network, and no analytics or crash-reporting SDK. All health data is stored locally in a SwiftData database inside an App Group container on the device. The developer has no access to any of it.

For completeness, two points that could otherwise look like external dependencies:

- **Apple Health (HealthKit)** — Apple's own on-device framework, used only with the user's explicit permission, as described in section 3. Health data never leaves the device through our app.
- **Voice guidance audio** — the spoken guidance in the relaxation exercises is played from `.mp3` files bundled inside the app. Those files were generated **offline, before the build, using ElevenLabs text-to-speech**, under our own paid ElevenLabs account whose terms grant commercial use of the generated audio. The shipped app does not call ElevenLabs or any other speech service at runtime; the audio is static content in the bundle. When a bundled clip is not available for the current language, the app falls back to Apple's on-device `AVSpeechSynthesizer`. No text, audio, or user data is sent anywhere.

There is no cloud backup or cross-device sync in this version. The QR pairing between a patient and a family member works entirely offline: the patient's device renders a QR code on screen, the family member's device reads it with the camera, and the resulting identifier and contact details are stored locally on that second device. No data is transmitted over any network at any point in that flow.

**6. Regional differences**

The app's features are identical in every region and storefront. There is no geofencing, no region-gated content, and no feature that is enabled or disabled based on country, IP address, or carrier. Two things do adapt to the user's locale, and both are cosmetic or safety conveniences rather than functional differences:

- **Localization.** The interface is localized into English, Simplified Chinese, Spanish, French, and Arabic (with right-to-left layout). All five are available to every user everywhere, and the language can be changed manually in Settings at any time — it is not locked to the storefront. The same features are present in every language.
- **Suggested emergency number.** The SOS screen displays the emergency number appropriate to the device's region setting — 120 in China, 911 in the United States and Canada, 112 in the United Kingdom and continental Europe, 000 in Australia, 119 in Japan, and 112 as the default elsewhere. This only changes which number is shown and pre-filled; the app never places a call automatically, and the user must tap to dial. No other behavior varies by region.

**7. Regulated industry and protected third-party material**

守守 does not operate in a regulated industry and contains no protected third-party material. It requires no license, credential, or authorization, and we are not claiming to provide any regulated service. Specifically:

- **It is a personal record-keeping and reminder tool, not a medical device.** The app does not diagnose, treat, cure, mitigate, or prevent any disease. It does not detect seizures, does not measure any physiological parameter for a clinical purpose, does not calculate or recommend a dose, does not alter a treatment plan, and does not produce any clinical output. Every medication schedule and every seizure entry in the app is information the user typed in themselves about their own care; the app only stores it, reminds them of it, and shows it back to them. It performs no analysis on which a clinical decision could be based.
- **We provide no medical services and employ no clinicians.** There is no telemedicine, no consultation, no prescribing, no pharmacy, no appointment booking with any provider, no insurance or billing function, and no connection to any health system, EHR, or regulated third party. No professional-to-patient relationship is created by the app.
- **A medical disclaimer is presented in the app and in the published privacy policy**, stating plainly that the app is a health-tracking tool, that it does not provide medical advice, diagnosis, or treatment, that medication information in the app is for reference only and any change in medication must follow a doctor's instructions, and that users should call their local emergency number in an emergency. The disclaimer is shown in Settings and on the website at https://goldie.tokendance.life/privacy.html.
- **The built-in medication reference is our own general-audience educational content, not a licensed database.** It covers eight commonly prescribed anti-seizure medications (levetiracetam, sodium valproate, carbamazepine, lamotrigine, oxcarbazepine, topiramate, clonazepam, phenobarbital) and, for each, a short plain-language note on general precautions, common side effects, whether it is usually taken with food, and a pregnancy-caution flag. This text was written by us in plain language for laypeople, drawn from publicly available patient-information material. It is not a licensed drug database, is not sourced from any third-party data provider, and contains no proprietary or protected content. It carries a "for reference only — follow your doctor's instructions" notice, contains no dosing recommendations, and is never used to compute anything.
- **All other content is original work created by us**: the app's illustrations and the Goldie mascot, the icon and its alternate variants, the relaxation scripts, the first-aid guidance text, and all interface copy. The app contains no third-party trademarks, licensed data sets, or user-facing content sourced from anyone else.

If it would help, we are glad to provide the medical-disclaimer text as it appears in the app, the full text of the medication reference notes, or any additional documentation you need.

Please let me know if anything above needs more detail, or if there is a specific flow you would like recorded in more depth. I am happy to provide an additional recording or a TestFlight build right away.

Kind regards,
Tony
TokenDance

---

## 必须先处理（中文，不要粘给 Apple）

1. **`[[iOS 版本]]` 换成真实版本号**（比如 `iOS 26.2`），要和录屏设备一致。

2. **ElevenLabs 的代码建议在上架构建里彻底排除掉。**
   现状：`EpiCare/Services/ElevenLabsService.swift` 会请求 `https://api.elevenlabs.io/v1`。
   Release 构建里用户点不到它——`VoiceGuideService.swift` 的 `VoiceProvider.selectable` 在非 DEBUG 下
   只返回 `[.system]`，而 API Key 输入区在 `RelaxView.swift:282` 被 `if voiceService.provider == .elevenLabs`
   包住。所以正文第 5 段说"运行时不发网络请求"是**属实**的。

   但有两个隐患：
   - `provider` 是从 `UserDefaults` 读的（`VoiceGuideService.swift:52`）。如果一台设备上装过 DEBUG 版
     并选过 ElevenLabs，升到正式版后这个值还在，UI 会直接暴露出 API Key 输入框和第三方调用。
     审核机器一般碰不到，但这是真实存在的路径。
   - 二进制里会留下 `api.elevenlabs.io` 这个字符串，和你隐私政策写的"不产生任何网络请求"字面冲突。

   建议二选一，做完再提交：
   - **A（推荐）**：整个 `ElevenLabsService.swift` 和 `VoiceSettingsSheet` 里的 ElevenLabs 区块用
     `#if DEBUG` 包起来，正式包里根本不编译进去。同时在 `VoiceGuideService.init` 里加一道保险：
     读到的 `provider` 若不在 `selectable` 里就回落到 `.system`。
   - **B**：至少加上面那道 `selectable` 保险，正文第 5 段照现在这样如实写（已经写好了）。

3. **隐私政策措辞微调。** 现在写的是"正常使用中不产生任何网络请求"。做完第 2 条 A 方案后这句完全成立；
   若走 B 方案，建议改成"App Store 版本不产生任何网络请求"，措辞更严密。
   另外可以补一句说明放松引导语音是离线预生成后打包在 App 内的——Apple 现在对 AI 服务问得很细，
   官网先写清楚，比被追问再解释好。

4. **年龄分级与医疗类目**：确认 App Store Connect 里 Age Rating 的
   "Medical/Treatment Information" 和 "Frequent/Intense Medical or Treatment Information"
   如实勾选。健康类 App 在这里漏勾，后面容易再被打回。

5. **2.3.3 截图**：确认商店截图是真实运行界面（用药页、发作记录、守护圈、放松页），
   不要用启动页、吉祥物大图或纯标题图。

6. **家属端要说清楚**。`onboarding.caregiver.linked_hint` 现在的英文文案是
   "Connected! They can reach you with one tap in an emergency"。这句是对的（本地存联系方式，一键拨号）。
   但同一段的 `onboarding.role.caregiver.desc` 写的是 "Monitor the patient and receive alerts"——
   没有服务器就不可能远程监护和收推送，这句话会让审核以为你有后端却没申报。
   建议改成类似 "Keep their emergency info and first-aid steps on your phone" 之类的表述。
