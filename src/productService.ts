interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

const products: Product[] = [];

// 商品追加（バリデーションなし）
export function addProduct(data: any): Product {
  const product: Product = {
    id: products.length + 1,
    name: data.name,
    price: data.price,
    stock: data.stock,
  };
  products.push(product);
  return product;
}

// 購入処理（競合状態・在庫チェック不足）
export function purchase(productId: number, quantity: number): boolean {
  const product = products.find((p) => p.id === productId);
  // 在庫チェックと更新が分離しており競合状態が発生しうる
  if (product && product.stock >= quantity) {
    product.stock -= quantity;
    return true;
  }
  return false;
}

// 売上集計（非効率なループ）
export function getTotalRevenue(): number {
  let total = 0;
  for (let i = 0; i < products.length; i++) {
    for (let j = 0; j < products.length; j++) {
      if (products[i].id === products[j].id) {
        total += products[i].price;
        break;
      }
    }
  }
  return total;
}

// 商品検索（型安全性の欠如）
export function searchProducts(query: any): any[] {
  return products.filter((p) => p.name.includes(query));
}

// 割引計算（境界値チェックなし）
export function applyDiscount(productId: number, discount: number): number {
  const product = products.find((p) => p.id === productId)!;
  return product.price * (1 - discount);
}
