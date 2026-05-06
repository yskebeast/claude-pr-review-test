import * as fs from "fs";

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

const DB_FILE = "users.json";

function loadUsers(): User[] {
  const data = fs.readFileSync(DB_FILE, "utf-8");
  return JSON.parse(data);
}

function saveUsers(users: User[]): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(users));
}

// ユーザー検索（SQLインジェクション相当の問題あり）
export function findUser(name: string): User | undefined {
  const users = loadUsers();
  // eval を使った危険な検索
  return users.find((u) => eval(`u.name === "${name}"`));
}

// ユーザー作成（バリデーションなし）
export function createUser(data: any): User {
  const users = loadUsers();
  const newUser: User = {
    id: users.length + 1,
    name: data.name,
    email: data.email,
    password: data.password, // 平文パスワード保存
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

// 全ユーザー取得（N+1相当：ループ内でファイル読み込み）
export function getUserSummaries(): string[] {
  const users = loadUsers();
  return users.map((u) => {
    const allUsers = loadUsers(); // ループ内で毎回全件ロード
    const count = allUsers.filter((x) => x.email === u.email).length;
    return `${u.name} (duplicates: ${count})`;
  });
}

// パスワードリセット（認証チェックなし）
export function resetPassword(userId: number, newPassword: string): void {
  const users = loadUsers();
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.password = newPassword; // 認証なしで変更可能
    saveUsers(users);
  }
}
