import * as fs from "fs";
import * as crypto from "crypto";

interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
}

interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

interface SafeUser {
  id: number;
  name: string;
  email: string;
}

const DB_FILE = "users.json";

function loadUsers(): User[] {
  if (!fs.existsSync(DB_FILE)) return [];
  const data = fs.readFileSync(DB_FILE, "utf-8");
  return JSON.parse(data);
}

function saveUsers(users: User[]): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

function validateCreateUserData(data: unknown): CreateUserData {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid input: data must be an object");
  }
  const d = data as Record<string, unknown>;
  if (typeof d.name !== "string" || d.name.trim() === "") {
    throw new Error("Invalid input: name is required");
  }
  if (
    typeof d.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)
  ) {
    throw new Error("Invalid input: valid email is required");
  }
  if (typeof d.password !== "string" || d.password.length < 8) {
    throw new Error("Invalid input: password must be at least 8 characters");
  }
  return { name: d.name.trim(), email: d.email, password: d.password };
}

// ユーザー検索
export function findUser(name: string): SafeUser | undefined {
  const users = loadUsers();
  const user = users.find((u) => u.name === name);
  if (!user) return undefined;
  return { id: user.id, name: user.name, email: user.email };
}

// ユーザー作成（バリデーション・パスワードハッシュ化あり）
export function createUser(data: unknown): SafeUser {
  const validated = validateCreateUserData(data);
  const users = loadUsers();
  const maxId = users.reduce((max, u) => Math.max(max, u.id), 0);
  const salt = generateSalt();
  const newUser: User = {
    id: maxId + 1,
    name: validated.name,
    email: validated.email,
    passwordHash: hashPassword(validated.password, salt),
    salt,
  };
  users.push(newUser);
  saveUsers(users);
  return { id: newUser.id, name: newUser.name, email: newUser.email };
}

// 全ユーザー取得（N+1を回避：loadUsers は1回のみ）
export function getUserSummaries(): string[] {
  const users = loadUsers();
  return users.map((u) => {
    const count = users.filter((x) => x.email === u.email).length;
    return `${u.name} (duplicates: ${count})`;
  });
}

// パスワードリセット（現在のパスワード確認必須）
export function resetPassword(
  userId: number,
  currentPassword: string,
  newPassword: string
): boolean {
  if (typeof newPassword !== "string" || newPassword.length < 8) {
    throw new Error("Invalid input: new password must be at least 8 characters");
  }
  const users = loadUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return false;

  const currentHash = hashPassword(currentPassword, user.salt);
  if (currentHash !== user.passwordHash) {
    return false;
  }

  const newSalt = generateSalt();
  user.passwordHash = hashPassword(newPassword, newSalt);
  user.salt = newSalt;
  saveUsers(users);
  return true;
}
