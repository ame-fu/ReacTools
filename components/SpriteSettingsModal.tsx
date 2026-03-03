"use client";

import React, { useState } from "react";
import {
  Modal,
  Switch,
  Button,
  InputNumber,
  ColorPicker,
  Space,
  Typography,
} from "antd";
import type { Color } from "antd/es/color-picker";
import type { SpriteConfig, SpriteItem } from "@/lib/sprite-context";
import { generateId } from "@/lib/uuid";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const COLORS = ["#7dd3fc", "#a78bfa", "#f472b6", "#86efac", "#fde047", "#fdba74"];
const MAX_SPRITES = 9;

function randomSprite(): SpriteItem {
  return {
    id: generateId(),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    width: 60 + Math.floor(Math.random() * 40),
    height: 60 + Math.floor(Math.random() * 40),
  };
}

interface SpriteSettingsModalProps {
  open: boolean;
  onClose: () => void;
  initialConfig: SpriteConfig;
  onSave: (config: SpriteConfig) => void;
  onResetPosition?: () => void;
}

function SortableSpriteItem({
  s,
  index,
  onUpdate,
  onRemove,
}: {
  s: SpriteItem;
  index: number;
  onUpdate: (id: string, patch: Partial<SpriteItem>) => void;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: s.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        position: "relative",
        padding: 12,
        paddingLeft: 20,
        background: "var(--ant-color-fill-quaternary)",
        borderRadius: 8,
        width: "100%",
        minWidth: 0,
        display: "flex",
        flexDirection: "row",
        boxShadow: "-10px 10px 12px rgba(0,0,0,0.08)",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 8,
          background: "#1677ff",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 11,
          borderRadius: "8px 0 0 8px",
        }}
      >
        {index + 1}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          flex: 1,
          minHeight: 0,
          minWidth: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            {...attributes}
            {...listeners}
            style={{
              cursor: "grab",
              padding: "4px 6px",
              background: "var(--ant-color-fill-tertiary)",
              borderRadius: 4,
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            ⋮⋮
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <ColorPicker
              value={s.color}
              onChange={(c: Color) => onUpdate(s.id, { color: c.toHexString() })}
              showText
              style={{ width: "100%" }}
            />
          </div>
        </div>
        <Space.Compact block style={{ width: "100%" }}>
          <Space.Addon>宽</Space.Addon>
          <InputNumber
            min={30}
            max={200}
            value={s.width}
            onChange={(v) => onUpdate(s.id, { width: v ?? 80 })}
            size="small"
            style={{ flex: 1, minWidth: 0 }}
          />
        </Space.Compact>
        <Space.Compact block style={{ width: "100%" }}>
          <Space.Addon>高</Space.Addon>
          <InputNumber
            min={30}
            max={200}
            value={s.height}
            onChange={(v) => onUpdate(s.id, { height: v ?? 80 })}
            size="small"
            style={{ flex: 1, minWidth: 0 }}
          />
        </Space.Compact>
        <Button
          size="small"
          onClick={() => onRemove(s.id)}
          style={{
            width: "100%",
            background: "rgba(255, 77, 79, 0.7)",
            color: "#fff",
            border: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 77, 79, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 77, 79, 0.7)";
          }}
        >
          删除
        </Button>
      </div>
    </div>
  );
}

function SpriteSettingsForm({
  initialConfig,
  onSave,
  onClose,
  onResetPosition,
}: {
  initialConfig: SpriteConfig;
  onSave: (config: SpriteConfig) => void;
  onClose: () => void;
  onResetPosition?: () => void;
}) {
  const [visible, setVisible] = useState(initialConfig.visible);
  const [hitokotoEnabled, setHitokotoEnabled] = useState(Boolean(initialConfig.hitokotoEnabled));
  const [sprites, setSprites] = useState<SpriteItem[]>(initialConfig.sprites);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const addSprite = () => {
    setSprites((prev) => {
      if (prev.length >= MAX_SPRITES) return prev;
      return [...prev, randomSprite()];
    });
  };

  const updateSprite = (id: string, patch: Partial<SpriteItem>) => {
    setSprites(sprites.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const removeSprite = (id: string) => {
    setSprites(sprites.filter((s) => s.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSprites((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return items;
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = () => {
    onSave({
      visible,
      hitokotoEnabled,
      sprites: sprites.slice(0, MAX_SPRITES),
      spritePosition: initialConfig.spritePosition,
    });
    onClose();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", minHeight: 0, flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span>显示精灵</span>
        <Switch checked={visible} onChange={setVisible} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span>随机一言</span>
        <Switch checked={hitokotoEnabled} onChange={setHitokotoEnabled} disabled={!visible} />
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>在随机精灵头顶弹出一言，间隔随机</Typography.Text>
      </div>

      <div style={{ flexShrink: 0 }}>
        <Typography.Text type="secondary">
          精灵列表（最多 {MAX_SPRITES} 个，拖拽可调整顺序）
        </Typography.Text>
        <Button
          type="dashed"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addSprite();
          }}
          disabled={sprites.length >= MAX_SPRITES}
          style={{ marginLeft: 12 }}
        >
          添加
        </Button>
      </div>

      <div
        style={{
          maxHeight: 360,
          overflowY: "auto",
          overflowX: "hidden",
          flexShrink: 1,
          minHeight: 0,
          width: "100%",
          minWidth: 0,
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sprites.map((s) => s.id)}
            strategy={rectSortingStrategy}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 12,
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,
              }}
            >
              {sprites.map((s, index) => (
                <SortableSpriteItem
                  key={s.id}
                  s={s}
                  index={index}
                  onUpdate={updateSprite}
                  onRemove={removeSprite}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {onResetPosition && initialConfig.visible && (
            <Button onClick={onResetPosition}>重置位置</Button>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={handleSave}>
            保存
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SpriteSettingsModal({
  open,
  onClose,
  initialConfig,
  onSave,
  onResetPosition,
}: SpriteSettingsModalProps) {
  return (
    <Modal
      title="精灵设置"
      open={open}
      onCancel={onClose}
      mask={{ closable: false }}
      width={580}
      footer={null}
      styles={{ body: { maxHeight: "70vh", overflow: "hidden", display: "flex", flexDirection: "column" } }}
    >
      {open && (
        <SpriteSettingsForm
          key="sprite-form"
          initialConfig={initialConfig}
          onSave={onSave}
          onClose={onClose}
          onResetPosition={onResetPosition}
        />
      )}
    </Modal>
  );
}
