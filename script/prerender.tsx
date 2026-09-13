// Prerender the public pages into static HTML at build time.
//
// The SPA ships an empty <div id="root"> — crawlers see no content until they
// execute JS. This script renders each public page with react-dom/server and
// writes a full HTML file per route into dist/public/, which Vercel serves
// before the SPA rewrite kicks in. The client bundle then mounts on top.
import { renderToString } from "react-dom/server";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import React from "react";
import { Router } from "wouter";

import LandingPage from "../client/src/pages/landing-page";
import AboutPage from "../client/src/pages/about-page";
import ContactPage from "../client/src/pages/contact-page";
import TermsPage from "../client/src/pages/terms";
import PrivacyPage from "../client/src/pages/privacy";
import NotFound from "../client/src/pages/not-found";

const SITE_URL = "https://emaraa.app";

const routes: {
  route: string;
  component: React.ComponentType;
  title: string;
  description: string;
}[] = [
  {
    route: "/",
    component: LandingPage,
    title: "عِمارة | منصة سعودية لربط ملاك العقارات بشركات إدارة المرافق المرخّصة",
    description:
      "عِمارة تربط ملاك العقارات السكنية والتجارية بشركات إدارة مرافق مرخّصة من الهيئة العامة للعقار في الرياض. انشر احتياج عقارك واستقبل عروض أسعار، قارن واختر الأفضل.",
  },
  {
    route: "/about",
    component: AboutPage,
    title: "من نحن | عِمارة — منصة إدارة المرافق العقارية",
    description:
      "تعرّف على عِمارة: منصة سعودية تربط ملاك العقارات بشركات إدارة مرافق مرخّصة من الهيئة العامة للعقار، بعروض تنافسية وتعاقد شفاف.",
  },
  {
    route: "/contact",
    component: ContactPage,
    title: "اتصل بنا | عِمارة",
    description:
      "تواصل مع فريق عِمارة عبر الواتساب أو البريد الإلكتروني — نجيب على استفسارات ملاك العقارات وشركات إدارة المرافق.",
  },
  {
    route: "/terms",
    component: TermsPage,
    title: "شروط الاستخدام | عِمارة",
    description: "شروط استخدام منصة عِمارة لملاك العقارات وشركات إدارة المرافق.",
  },
  {
    route: "/privacy",
    component: PrivacyPage,
    title: "سياسة الخصوصية | عِمارة",
    description:
      "كيف تتعامل منصة عِمارة مع بياناتك وخصوصيتك — رقمك لا يظهر لأي جهة إلا بعد موافقتك.",
  },
];

function escapeAttr(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

async function prerender() {
  const outDir = path.resolve("dist/public");
  const template = await readFile(path.join(outDir, "index.html"), "utf-8");

  for (const { route, component: Page, title, description } of routes) {
    const appHtml = renderToString(
      React.createElement(Router, { ssrPath: route }, React.createElement(Page)),
    );

    const canonical = `${SITE_URL}${route === "/" ? "/" : route}`;
    let html = template
      .replace(/<title>.*?<\/title>/s, `<title>${title}</title>`)
      .replace(
        /<meta name="description" content=".*?" \/>/s,
        `<meta name="description" content="${escapeAttr(description)}" />`,
      )
      .replace(
        "</head>",
        `<link rel="canonical" href="${canonical}" />\n</head>`,
      )
      .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

    const outFile =
      route === "/"
        ? path.join(outDir, "index.html")
        : path.join(outDir, route.slice(1), "index.html");
    await mkdir(path.dirname(outFile), { recursive: true });
    await writeFile(outFile, html);

    console.log(`prerendered ${route} → ${path.relative(outDir, outFile)} (${(appHtml.length / 1024).toFixed(1)} KB of content)`);
  }

  // 404.html — served by Vercel for any path that matches no static file and no
  // rewrite. Until 2026-09-13 vercel.json rewrote /(.*) to /index.html, and
  // index.html is the prerendered LANDING page, so every bogus URL answered
  // HTTP 200 with full landing-page content. Crawlers saw the homepage at every
  // nonexistent path and no 404 was ever emitted. Now unmatched paths fall
  // through to this file with a real 404 status, still on-brand.
  const notFoundHtml = renderToString(
    React.createElement(Router, { ssrPath: "/404" }, React.createElement(NotFound)),
  );
  const notFoundPage = template
    .replace(/<title>.*?<\/title>/s, "<title>الصفحة غير موجودة | عِمارة</title>")
    .replace(
      /<meta name="description" content=".*?" \/>/s,
      '<meta name="description" content="الصفحة التي تبحث عنها غير موجودة." />',
    )
    .replace("</head>", '<meta name="robots" content="noindex" />\n</head>')
    .replace('<div id="root"></div>', `<div id="root">${notFoundHtml}</div>`);
  await writeFile(path.join(outDir, "404.html"), notFoundPage);
  console.log(`prerendered 404 → 404.html (${(notFoundHtml.length / 1024).toFixed(1)} KB of content)`);
}

prerender().catch((err) => {
  console.error(err);
  process.exit(1);
});
