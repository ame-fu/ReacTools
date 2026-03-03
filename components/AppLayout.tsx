"use client";

import React, { useState, useMemo, useLayoutEffect, useEffect } from "react";
import {
  Layout,
  Menu,
  ConfigProvider,
  theme as antdTheme,
  Button,
  Input,
  AutoComplete,
  Drawer,
} from "antd";
import {
  MenuOutlined,
  HomeOutlined,
  RightOutlined,
  DownOutlined,
  InfoCircleOutlined,
  CloseOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { allTools, toolsByCategory } from "@/lib/tools.config";
import { useTheme } from "@/lib/theme-context";
import { useI18n } from "@/lib/i18n/context";
import { useSprite } from "@/lib/sprite-context";
import { SettingsDropdown } from "./SettingsDropdown";
import { SpriteGroup } from "./SpriteGroup";
import { getCategoryLabel } from "@/lib/i18n/messages";
import { getToolName } from "@/lib/i18n/tool-labels";

const { Header, Sider, Content } = Layout;
const MOBILE_BREAKPOINT = 991;

const SIDER_WIDTH = 240;
const SIDER_HEADER_HEIGHT = 150;

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const { locale, t } = useI18n();
  const { config: spriteConfig, updateSpritePosition } = useSprite();
  const [siderCollapsed, setSiderCollapsed] = useState(() =>
    pathname.startsWith("/articles"),
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const onMatch = () => {
      const mobile = mq.matches;
      setIsMobile(mobile);
      if (mobile) setMenuOpen(false);
      else setSiderCollapsed(false);
    };
    onMatch();
    mq.addEventListener("change", onMatch);
    return () => mq.removeEventListener("change", onMatch);
  }, []);

  useEffect(() => {
    if (pathname === "/") {
      document.title = t("documentTitle.home");
    } else if (pathname === "/about") {
      document.title = t("documentTitle.about");
    } else if (pathname === "/articles") {
      document.title = t("documentTitle.blog");
    } else if (pathname.startsWith("/articles/")) {
      // Article detail: title is set by the article page
      return;
    } else {
      const tool = allTools.find((x) => x.path === pathname);
      document.title = tool
        ? t("documentTitle.tool").replace("{name}", getToolName(locale, tool.slug, tool.name))
        : "ReacTools";
    }
  }, [pathname, locale, t]);

  const menuItems = useMemo(() => {
    return toolsByCategory.map((cat) => ({
      key: `cat:${cat.name}`,
      label: getCategoryLabel(locale, cat.name),
      children: cat.tools.map((tool) => ({
        key: tool.slug,
        label: (
          <Link href={tool.path}>
            {getToolName(locale, tool.slug, tool.name)}
          </Link>
        ),
      })),
    }));
  }, [locale]);

  const selectedKeys: string[] = useMemo(() => {
    const match = allTools.find((t) => pathname === t.path);
    return match ? [match.slug] : [];
  }, [pathname]);

  const onOpenChange = (keys: string[]) => {
    setOpenKeys(keys.length > 1 ? [keys[keys.length - 1]] : keys);
  };

  const searchOptions = useMemo(() => {
    const query = searchValue.trim();
    if (!query) return [];
    const q = query.toLowerCase();

    const highlight = (text: string) => {
      const lower = text.toLowerCase();
      const index = lower.indexOf(q);
      if (index === -1 || !q) return text;
      const before = text.slice(0, index);
      const match = text.slice(index, index + q.length);
      const after = text.slice(index + q.length);
      return (
        <>
          {before}
          <span
            style={{
              backgroundColor: "var(--ant-color-warning-bg)",
              color: "var(--ant-color-warning-text)",
            }}
          >
            {match}
          </span>
          {after}
        </>
      );
    };

    return allTools
      .filter((tool) => {
        const localizedName = getToolName(locale, tool.slug, tool.name).toLowerCase();
        const localizedDescKey = `tools.${tool.slug}.description`;
        const localizedDesc = t(localizedDescKey).toLowerCase();
        const hasLocalizedDesc =
          localizedDesc && localizedDesc !== localizedDescKey.toLowerCase();

        return (
          tool.name.toLowerCase().includes(q) ||
          tool.description.toLowerCase().includes(q) ||
          tool.keywords.some((k) => k.toLowerCase().includes(q)) ||
          localizedName.includes(q) ||
          (hasLocalizedDesc && localizedDesc.includes(q))
        );
      })
      .slice(0, 10)
      .map((tool) => {
        const title = getToolName(locale, tool.slug, tool.name);
        const localizedDescKey = `tools.${tool.slug}.description`;
        const localizedDesc = t(localizedDescKey);
        const desc =
          localizedDesc && localizedDesc !== localizedDescKey
            ? localizedDesc
            : tool.description;

        return {
          key: tool.slug,
          value: title,
          label: (
            <div
              style={{
                padding: 8,
                borderRadius: 6,
                border: "1px solid var(--ant-color-border-secondary)",
                background: "var(--ant-color-bg-elevated)",
              }}
            >
              <div
                style={{
                  fontWeight: 500,
                  marginBottom: 4,
                  color: "var(--ant-color-text)",
                }}
              >
                {highlight(title)}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--ant-color-text-secondary)",
                }}
              >
                {highlight(desc)}
              </div>
            </div>
          ),
        };
      });
  }, [searchValue, locale, t]);

  const isLight = theme === "light";
  const themeAlgorithm =
    theme === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm;
  const siderBg = isLight ? "#fff" : "#232323";

  const closeMenu = () => {
    setOpenKeys([]);
    if (isMobile) setMenuOpen(false);
    else setSiderCollapsed(true);
  };
  // Ensure current tool's parent menu is expanded and scrolled into view
  useEffect(() => {
    const match = allTools.find((t) => pathname === t.path);
    if (match) {
      const parent = toolsByCategory.find((cat) =>
        cat.tools.some((tool) => tool.slug === match.slug),
      );
      if (parent) {
        queueMicrotask(() =>
          setOpenKeys((prev) =>
            prev.length === 0 ? [`cat:${parent.name}`] : prev,
          ),
        );
      }
      // scroll selected menu item into view
      setTimeout(() => {
        const menuWrap = document.querySelector(
          ".app-sider-menu-wrap",
        ) as HTMLElement | null;
        const activeItem = menuWrap?.querySelector(
          ".ant-menu-item-selected",
        ) as HTMLElement | null;
        if (menuWrap && activeItem) {
          const wrapRect = menuWrap.getBoundingClientRect();
          const itemRect = activeItem.getBoundingClientRect();
          if (itemRect.top < wrapRect.top || itemRect.bottom > wrapRect.bottom) {
            activeItem.scrollIntoView({ block: "center" });
          }
        }
      }, 0);
    }
  }, [pathname]);

  const menuContent = (
    <>
      <Link
        href="/"
        onClick={closeMenu}
        className="app-sider-header"
        style={{
          display: "block",
          textDecoration: "none",
          flexShrink: 0,
          position: "relative",
          lineHeight: 1.2,
          width: "100%",
          height: SIDER_HEADER_HEIGHT,
        }}
      >
        {isMobile && (
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeMenu();
            }}
            aria-label="Close"
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 10,
              color: "rgba(255,255,255,0.9)",
            }}
          />
        )}
        <div
          className="app-sider-header-bg"
          style={{
            position: "absolute",
            inset: 0,
            top: "-75px",
            backgroundImage: "url(/hero-gradient.svg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="/icon.png"
            alt="ReacTools"
            style={{
              maxWidth: "80%",
              maxHeight: 120,
              objectFit: "contain",
            }}
          />
        </div>
      </Link>

      <div
        className="app-sider-menu-wrap"
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          paddingTop: 8,
          paddingBottom: 8,
          paddingInline: 8,
        }}
      >
        <Menu
          theme={isLight ? "light" : "dark"}
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          items={menuItems}
          style={{ background: "transparent", border: "none" }}
          inlineIndent={24}
          expandIcon={({ isOpen }) =>
            isOpen ? (
              <DownOutlined className="app-menu-expand-icon" style={{ fontSize: 12 }} />
            ) : (
              <RightOutlined className="app-menu-expand-icon" style={{ fontSize: 12 }} />
            )
          }
          className={isLight ? "app-sider-menu-light app-sider-menu-tree" : "app-sider-menu-tree"}
          onClick={({ key }) => {
            if (isMobile && allTools.some((t) => t.slug === key)) setMenuOpen(false);
          }}
        />
      </div>

      <div
        className="app-sider-footer"
        style={{
          flexShrink: 0,
          textAlign: "center",
          color: isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.5)",
          fontSize: 12,
          padding: "0 8px 12px",
        }}
      >
        <div
          className="app-sider-footer-line"
          style={{
            height: 1,
            marginLeft: 16,
            marginRight: 16,
            marginBottom: 12,
            background: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.12)",
          }}
        />
        <span>© ReacTools</span>
      </div>
    </>
  );

  return (
    <ConfigProvider
      theme={{
        algorithm: themeAlgorithm,
        components: {
          Layout: {
            siderBg,
            triggerBg: siderBg,
          },
        },
      }}
    >
      <>
        <svg width={0} height={0} aria-hidden style={{ position: "absolute" }}>
          <defs>
            <clipPath id="sprite-jelly-clip" clipPathUnits="objectBoundingBox">
              <path d="M 0.5 0.05 C 0.22 0.05 0.05 0.22 0.05 0.5 L 0.05 0.88 C 0.05 0.95 0.12 1 0.2 1 L 0.8 1 C 0.88 1 0.95 0.95 0.95 0.88 L 0.95 0.5 C 0.95 0.22 0.78 0.05 0.5 0.05 Z" />
            </clipPath>
          </defs>
        </svg>
        <Layout style={{ minHeight: "100vh" }}>
        {/* Web 端：左侧 Sider，收起时通过 CSS 完全隐藏内容 */}
        {!isMobile && (
          <Sider
            className="app-sider"
            width={SIDER_WIDTH}
            collapsedWidth={0}
            collapsed={siderCollapsed}
            onCollapse={setSiderCollapsed}
            trigger={null}
            breakpoint="lg"
            style={{
              overflow: "hidden",
              background: siderBg,
              height: "100vh",
            }}
          >
            {menuContent}
          </Sider>
        )}

        {/* 移动端：从顶部滑出的全屏菜单弹层，❎ 关闭 */}
        {isMobile && (
          <Drawer
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            placement="top"
            size="100%"
            className="app-drawer-menu"
            closable={false}
            styles={{
              body: { padding: 0, display: "flex", flexDirection: "column", height: "100%", background: siderBg },
            }}
            title={null}
          >
            {menuContent}
          </Drawer>
        )}

        <Layout
          style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* 顶部栏固定：弱化背景 */}
          <Header
            className="app-top-header"
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              position: "sticky",
              top: 0,
              zIndex: 100,
            }}
          >
            {/* 左侧：汉堡 + 首页 */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => (isMobile ? setMenuOpen(true) : setSiderCollapsed((c) => !c))}
                aria-label={t("home.toggleMenu")}
              />
              <Link href="/">
                <Button
                  type="text"
                  icon={<HomeOutlined />}
                  aria-label={t("home.home")}
                />
              </Link>
            </div>

            {/* 中间：搜索框，垂直居中 */}
            <div className="app-header-search-wrap" style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
              <AutoComplete
                value={searchValue}
                onChange={setSearchValue}
                options={searchOptions}
                className="app-header-search"
                style={{ minWidth: 200, maxWidth: 360, width: "100%" }}
                notFoundContent={
                  searchValue.trim() ? (
                    <div
                      style={{
                        padding: 12,
                        textAlign: "center",
                        color: "var(--ant-color-text-secondary)",
                        fontSize: 13,
                      }}
                    >
                      {t("search.noResults") ?? "No tools found"}
                    </div>
                  ) : null
                }
                onSelect={(_, opt) => {
                  const slug = opt?.key as string | undefined;
                  const tool = slug ? allTools.find((t) => t.slug === slug) : null;
                  if (tool) {
                    router.push(tool.path);
                    setSearchValue("");
                  }
                }}
              >
                <Input
                  placeholder={t("search.label")}
                  allowClear
                  variant="borderless"
                  style={{ width: "100%" }}
                />
              </AutoComplete>
            </div>

            {/* 右侧：设置下拉（语言 + 主题 + 精灵）+ 关于 */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SettingsDropdown isMobile={isMobile} />
              <Link href="/articles" onClick={() => setSiderCollapsed(true)}>
                <Button
                  type="text"
                  icon={<FileTextOutlined />}
                  size="small"
                  aria-label={t("home.nav.articles")}
                >
                  {t("home.nav.articlesLabel")}
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  type="text"
                  icon={<InfoCircleOutlined />}
                  size="small"
                  aria-label={t("home.nav.about")}
                >
                  {t("home.nav.aboutLabel")}
                </Button>
              </Link>
            </div>
          </Header>

          {/* 右侧内容区独立滚动，响应式内边距 */}
          <Content
            className="app-content"
            style={{
              flex: 1,
              minHeight: 0,
              overflow: "auto",
              padding: 24,
              display: "flex",
              justifyContent: "center",
              background: "var(--ant-color-bg-layout)",
            }}
          >
            <div className="app-content-inner">{children}</div>
          </Content>

          {/* 页面精灵：整体可拖拽，9宫格三排叠放（移动端不显示） */}
          {!isMobile && spriteConfig.visible && spriteConfig.sprites.length > 0 && (
            <SpriteGroup
              config={spriteConfig}
              onPositionChange={updateSpritePosition}
            />
          )}
        </Layout>
      </Layout>
      </>
    </ConfigProvider>
  );
}
