"use client";

import React, { useRef, useState } from "react";
import { Dropdown, Switch, Divider } from "antd";
import type { MenuProps } from "antd";

/** Shape passed to menu item onClick (matches rc-menu MenuInfo) */
interface MenuClickInfo {
  key: string;
  keyPath: string[];
  item: unknown;
  domEvent: React.MouseEvent;
}
import { SettingOutlined, SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useTheme } from "@/lib/theme-context";
import { useI18n } from "@/lib/i18n/context";
import { SpriteSettingsModal } from "./SpriteSettingsModal";
import { useSprite } from "@/lib/sprite-context";

const HOVER_CLOSE_DELAY = 150;

const localeLabels: Record<string, string> = {
  zh: "中文",
  en: "English",
  de: "Deutsch",
  es: "Español",
  fr: "Français",
  no: "Norwegian",
  pt: "Português",
  uk: "Українська",
  vi: "Tiếng Việt",
};

export function SettingsDropdown({ isMobile = false }: { isMobile?: boolean }) {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, availableLocales, t } = useI18n();
  const { config, saveConfig } = useSprite();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [spriteModalOpen, setSpriteModalOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setDropdownOpen(false), HOVER_CLOSE_DELAY);
  };

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setDropdownOpen(true);
  };

  const langItems: MenuProps["items"] = [...availableLocales]
    .sort((a, b) => {
      if (a === "zh") return -1;
      if (b === "zh") return 1;
      if (a === "en") return -1;
      if (b === "en") return 1;
      return a.localeCompare(b);
    })
    .map((code) => ({
      key: code,
      label: localeLabels[code] ?? code,
      onClick: () => setLocale(code),
    }));

  const menuItems: MenuProps["items"] = [
    {
      key: "lang",
      label: `${t("home.nav.language")}: ${localeLabels[locale] ?? locale}`,
      children: langItems,
    },
    ...(!isMobile
      ? [
          {
            key: "sprite",
            label: t("home.nav.sprite"),
            onClick: () => {
              setDropdownOpen(false);
              setTimeout(() => setSpriteModalOpen(true), 80);
            },
          },
        ]
      : []),
  ];

  const langDropdownMenu = {
    selectedKeys: [locale],
    items: langItems?.map((child) => {
      if (!child || "dismiss" in child) return null;
      const item = child as { key: string; label: React.ReactNode; onClick?: (info: MenuClickInfo) => void };
      return {
        key: item.key,
        label: item.label,
        onClick: () => {
          item.onClick?.({ key: item.key, keyPath: [item.key], item: null, domEvent: {} as React.MouseEvent } as MenuClickInfo);
          setDropdownOpen(false);
        },
      };
    }).filter(Boolean) as MenuProps["items"],
  };

  const dropdownContent = (
    <>
      <div
        style={{
          minWidth: 160,
          maxHeight: 320,
          overflow: "auto",
        }}
      >
        {menuItems && (
          <div
            className="ant-dropdown-menu"
            style={{ boxShadow: "none", border: "none" }}
          >
            {menuItems.map((item) => {
              if (!item || "dismiss" in item) return null;
              const menuItem = item as { key: string; label: React.ReactNode; children?: MenuProps["items"]; onClick?: (info: MenuClickInfo) => void };
              if (menuItem.key === "lang" && menuItem.children) {
                return (
                  <Dropdown
                    key="lang"
                    trigger={["hover"]}
                    placement={"left" as "bottomLeft"}
                    menu={langDropdownMenu}
                  >
                    <div
                      className="ant-dropdown-menu-item"
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                    >
                      <span>{menuItem.label}</span>
                      <span style={{ marginLeft: 8 }}>›</span>
                    </div>
                  </Dropdown>
                );
              }
              if (menuItem.key === "sprite") {
                return (
                  <div
                    key={menuItem.key}
                    className="ant-dropdown-menu-item"
                    onClick={(e: React.MouseEvent) => {
                      menuItem.onClick?.({ key: menuItem.key, keyPath: [menuItem.key], item: null, domEvent: e } as MenuClickInfo);
                    }}
                  >
                    {menuItem.label}
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
      <Divider style={{ margin: "4px 0" }} />
      <div
        style={{
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <SunOutlined style={{ fontSize: 16, color: theme === "light" ? "var(--ant-color-warning)" : "var(--ant-color-text-tertiary)" }} />
        <Switch
          checked={theme === "dark"}
          onChange={() => setTheme(theme === "light" ? "dark" : "light")}
        />
        <MoonOutlined style={{ fontSize: 16, color: theme === "dark" ? "var(--ant-color-primary)" : "var(--ant-color-text-tertiary)" }} />
      </div>
    </>
  );

  return (
    <>
      <Dropdown
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
        trigger={["hover"]}
        popupRender={() => (
          <div
            className="ant-dropdown"
            style={{
              background: "var(--ant-color-bg-elevated)",
              borderRadius: 8,
              boxShadow: "var(--ant-box-shadow-secondary)",
              padding: "4px 0",
              minWidth: 180,
            }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            {dropdownContent}
          </div>
        )}
      >
        <span
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          style={{
            display: "inline-flex",
            alignItems: "center",
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: 6,
          }}
        >
          <SettingOutlined style={{ fontSize: 18 }} />
        </span>
      </Dropdown>
      <SpriteSettingsModal
        open={spriteModalOpen}
        onClose={() => setSpriteModalOpen(false)}
        initialConfig={config}
        onSave={saveConfig}
        onResetPosition={() => saveConfig({ ...config, spritePosition: { bottom: 12, right: 12 } })}
      />
    </>
  );
}
