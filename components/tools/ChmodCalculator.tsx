"use client";

import React from "react";
import { Checkbox, Input, Table } from "antd";

type Scope = "read" | "write" | "execute";
type Group = "owner" | "group" | "public";

const scopes: { scope: Scope; title: string }[] = [
  { scope: "read", title: "Read (4)" },
  { scope: "write", title: "Write (2)" },
  { scope: "execute", title: "Execute (1)" },
];
const groups: Group[] = ["owner", "group", "public"];

const permissionValue: Record<Scope, number> = { read: 4, write: 2, execute: 1 };
const symbolicValue: Record<Scope, string> = { read: "r", write: "w", execute: "x" };

type Permissions = Record<Group, Record<Scope, boolean>>;

function computeOctal(permissions: Permissions): string {
  return groups
    .map((group) =>
      (["read", "write", "execute"] as Scope[]).reduce(
        (sum, scope) => sum + (permissions[group][scope] ? permissionValue[scope] : 0),
        0,
      ),
    )
    .join("");
}

function computeSymbolic(permissions: Permissions): string {
  return groups
    .map((group) =>
      (["read", "write", "execute"] as Scope[])
        .map((scope) => (permissions[group][scope] ? symbolicValue[scope] : "-"))
        .join(""),
    )
    .join("");
}

const defaultPermissions: Permissions = {
  owner: { read: false, write: false, execute: false },
  group: { read: false, write: false, execute: false },
  public: { read: false, write: false, execute: false },
};

export function ChmodCalculator() {
  const [permissions, setPermissions] = React.useState<Permissions>(defaultPermissions);

  const octal = computeOctal(permissions);
  const symbolic = computeSymbolic(permissions);
  const chmodCommand = `chmod ${octal} path`;

  const toggle = (group: Group, scope: Scope) => {
    setPermissions((p) => ({
      ...p,
      [group]: { ...p[group], [scope]: !p[group][scope] },
    }));
  };

  return (
    <div>
      <Table
        dataSource={scopes}
        rowKey="scope"
        pagination={false}
        columns={[
          {
            title: "",
            dataIndex: "title",
            key: "title",
            render: (t: string) => <span className="font-semibold text-right block pr-2">{t}</span>,
          },
          ...groups.map((group) => ({
            title: group === "owner" ? "Owner (u)" : group === "group" ? "Group (g)" : "Public (o)",
            key: group,
            align: "center" as const,
            render: (_: unknown, row: { scope: Scope }) => (
              <Checkbox
                checked={permissions[group][row.scope]}
                onChange={() => toggle(group, row.scope)}
              />
            ),
          })),
        ]}
      />
      <div className="text-center text-5xl font-mono text-primary my-6">{octal}</div>
      <div className="text-center text-5xl font-mono text-primary my-6">{symbolic}</div>
      <Input readOnly value={chmodCommand} className="font-mono" />
    </div>
  );
}
