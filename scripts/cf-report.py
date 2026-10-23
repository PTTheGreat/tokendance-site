#!/usr/bin/env python3
"""Daily Cloudflare report for tokendance.life, sent by email.

Pulls the last 24 hours from the Cloudflare GraphQL Analytics API:
- Web Analytics (the JS beacon): page views and visits per site, top pages,
  referrers and countries.
- Zone traffic: requests per host, and requests from known AI crawlers,
  matched by User-Agent.

Env: CF_API_TOKEN, CF_ACCOUNT_ID, CF_ZONE_ID, SMTP_HOST, SMTP_PORT,
SMTP_USER, SMTP_PASS, MAIL_TO. Without SMTP_PASS the report is only printed.
Only the standard library is used.
"""
import datetime as dt
import html
import json
import os
import re
import smtplib
import sys
import urllib.request
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

API = "https://api.cloudflare.com/client/v4/graphql"

# (label, User-Agent pattern). Order matters: the first match wins.
AI_BOTS = [
    ("OpenAI GPTBot", r"GPTBot"),
    ("OpenAI ChatGPT-User", r"ChatGPT-User"),
    ("OpenAI OAI-SearchBot", r"OAI-SearchBot"),
    ("Anthropic ClaudeBot", r"ClaudeBot"),
    ("Anthropic Claude-User", r"Claude-User"),
    ("Anthropic Claude-SearchBot", r"Claude-SearchBot"),
    ("Anthropic (other)", r"anthropic-ai|Claude-Web"),
    ("Perplexity", r"Perplexity"),
    ("Google-Extended / Gemini", r"Google-Extended|Gemini"),
    ("Googlebot", r"Googlebot"),
    ("Bingbot", r"bingbot"),
    ("Apple Applebot", r"Applebot"),
    ("ByteDance Bytespider", r"Bytespider"),
    ("Meta", r"meta-externalagent|FacebookBot|facebookexternalhit"),
    ("Amazonbot", r"Amazonbot"),
    ("Common Crawl CCBot", r"CCBot"),
    ("DuckAssistBot", r"DuckAssistBot"),
    ("Mistral", r"MistralAI"),
    ("Cohere", r"cohere-ai"),
    ("You.com", r"YouBot"),
    ("PetalBot", r"PetalBot"),
]


def gql(query, variables):
    req = urllib.request.Request(
        API,
        data=json.dumps({"query": query, "variables": variables}).encode(),
        headers={
            "Authorization": f"Bearer {os.environ['CF_API_TOKEN']}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        body = json.load(resp)
    if body.get("errors"):
        raise RuntimeError("; ".join(e.get("message", str(e)) for e in body["errors"]))
    return body["data"]


RUM_QUERY = """
query($acc: String!, $start: Time!, $end: Time!) {
  viewer { accounts(filter: {accountTag: $acc}) {
    hosts: rumPageloadEventsAdaptiveGroups(limit: 50,
        filter: {datetime_geq: $start, datetime_lt: $end}, orderBy: [count_DESC]) {
      count sum { visits } dimensions { requestHost }
    }
    pages: rumPageloadEventsAdaptiveGroups(limit: 15,
        filter: {datetime_geq: $start, datetime_lt: $end}, orderBy: [count_DESC]) {
      count dimensions { requestHost requestPath }
    }
    referers: rumPageloadEventsAdaptiveGroups(limit: 10,
        filter: {datetime_geq: $start, datetime_lt: $end}, orderBy: [count_DESC]) {
      count dimensions { refererHost }
    }
    countries: rumPageloadEventsAdaptiveGroups(limit: 10,
        filter: {datetime_geq: $start, datetime_lt: $end}, orderBy: [count_DESC]) {
      count dimensions { countryName }
    }
  } }
}"""

ZONE_QUERY = """
query($zone: String!, $start: Time!, $end: Time!) {
  viewer { zones(filter: {zoneTag: $zone}) {
    hosts: httpRequestsAdaptiveGroups(limit: 50,
        filter: {datetime_geq: $start, datetime_lt: $end}, orderBy: [count_DESC]) {
      count dimensions { clientRequestHTTPHost }
    }
    agents: httpRequestsAdaptiveGroups(limit: 2000,
        filter: {datetime_geq: $start, datetime_lt: $end}, orderBy: [count_DESC]) {
      count dimensions { userAgent clientRequestHTTPHost }
    }
  } }
}"""


def classify(ua):
    for label, pattern in AI_BOTS:
        if re.search(pattern, ua or "", re.I):
            return label
    return None


def build(start, end):
    """Return (sections, errors); each section is (title, header, rows)."""
    sections, errors = [], []
    span = {"start": start.isoformat().replace("+00:00", "Z"),
            "end": end.isoformat().replace("+00:00", "Z")}

    try:
        acc = gql(RUM_QUERY, {"acc": os.environ["CF_ACCOUNT_ID"], **span})["viewer"]["accounts"][0]
        sections.append(("访问统计（Web Analytics）", ["站点", "页面浏览", "访问"],
                         [[g["dimensions"]["requestHost"], g["count"], g["sum"]["visits"]]
                          for g in acc["hosts"]]))
        sections.append(("热门页面", ["页面", "浏览"],
                         [[g["dimensions"]["requestHost"] + g["dimensions"]["requestPath"], g["count"]]
                          for g in acc["pages"]]))
        sections.append(("来源", ["来源", "浏览"],
                         [[g["dimensions"]["refererHost"] or "（直接访问）", g["count"]]
                          for g in acc["referers"]]))
        sections.append(("国家/地区", ["国家/地区", "浏览"],
                         [[g["dimensions"]["countryName"], g["count"]] for g in acc["countries"]]))
    except Exception as e:  # keep going so the email still goes out
        errors.append(f"Web Analytics 拉取失败：{e}")

    try:
        zone = gql(ZONE_QUERY, {"zone": os.environ["CF_ZONE_ID"], **span})["viewer"]["zones"][0]
        sections.append(("域名请求量（经过 Cloudflare）", ["主机", "请求"],
                         [[g["dimensions"]["clientRequestHTTPHost"], g["count"]] for g in zone["hosts"]]))
        bots = {}
        for g in zone["agents"]:
            label = classify(g["dimensions"]["userAgent"])
            if label:
                key = (label, g["dimensions"]["clientRequestHTTPHost"])
                bots[key] = bots.get(key, 0) + g["count"]
        rows = [[label, host, n] for (label, host), n in sorted(bots.items(), key=lambda kv: -kv[1])]
        sections.append(("AI / 搜索爬虫", ["爬虫", "主机", "请求"], rows))
    except Exception as e:
        errors.append(f"域名流量拉取失败：{e}")

    return sections, errors


def render(title, sections, errors):
    text = [title, ""]
    parts = [f"<h2 style='font-family:sans-serif'>{html.escape(title)}</h2>"]
    for e in errors:
        text.append(f"⚠️ {e}")
        parts.append(f"<p style='color:#b00;font-family:sans-serif'>⚠️ {html.escape(e)}</p>")
    for name, header, rows in sections:
        text += ["", f"## {name}"]
        parts.append(f"<h3 style='font-family:sans-serif'>{html.escape(name)}</h3>")
        if not rows:
            text.append("（无数据）")
            parts.append("<p style='font-family:sans-serif;color:#666'>（无数据）</p>")
            continue
        text += [" | ".join(header)] + [" | ".join(str(c) for c in r) for r in rows]
        cells = "".join(f"<th align='left' style='padding:4px 12px 4px 0'>{html.escape(h)}</th>" for h in header)
        body = "".join(
            "<tr>" + "".join(f"<td style='padding:2px 12px 2px 0'>{html.escape(str(c))}</td>" for c in r) + "</tr>"
            for r in rows)
        parts.append(f"<table style='font-family:sans-serif;font-size:14px;border-collapse:collapse'>"
                     f"<tr>{cells}</tr>{body}</table>")
    return "\n".join(text), "\n".join(parts)


def send(subject, text, html_body):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = os.environ["SMTP_USER"]
    msg["To"] = os.environ.get("MAIL_TO") or os.environ["SMTP_USER"]
    msg.attach(MIMEText(text, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))
    host = os.environ.get("SMTP_HOST") or "smtp.mail.me.com"
    port = int(os.environ.get("SMTP_PORT") or 587)
    with smtplib.SMTP(host, port, timeout=60) as s:
        s.starttls()
        s.login(os.environ["SMTP_USER"], os.environ["SMTP_PASS"])
        s.send_message(msg)


def main():
    end = dt.datetime.now(dt.timezone.utc).replace(minute=0, second=0, microsecond=0)
    start = end - dt.timedelta(hours=24)
    sections, errors = build(start, end)
    bj = dt.timezone(dt.timedelta(hours=8))
    title = (f"tokendance.life Cloudflare 日报 "
             f"{start.astimezone(bj):%m-%d %H:%M} – {end.astimezone(bj):%m-%d %H:%M}（北京时间）")
    text, html_body = render(title, sections, errors)
    print(text)
    if os.environ.get("SMTP_PASS"):
        send(title, text, html_body)
        print("\nEmail sent.")
    if errors and not sections:
        sys.exit(1)


if __name__ == "__main__":
    main()
