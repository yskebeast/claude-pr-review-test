export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

const products: Product[] = [];

export function addProduct(data: { name: string; price: number; stock: number }): Product {
  if (!data.name || typeof data.name !== 'string') {
    throw new Error('Invalid product name');
  }
  if (typeof data.price !== 'number' || data.price < 0) {
    throw new Error('Invalid product price');
  }
  if (typeof data.stock !== 'number' || data.stock < 0) {
    throw new Error('Invalid product stock');
  }
  const id = products.length === 0 ? 1 : Math.max(...products.map((p) => p.id)) + 1;
  const product: Product = { id, name: data.name, price: data.price, stock: data.stock };
  products.push(product);
  return product;
}

export function purchase(productId: number, quantity: number): boolean {
  const product = products.find((p) => p.id === productId);
  if (!product) {
    throw new Error('Product not found');
  }
  if (product.stock < quantity) {
    throw new Error('Insufficient stock');
  }
  product.stock -= quantity;
  return true;
}

export function getTotalListPrice(): number {
  return products.reduce((sum, p) => sum + p.price, 0);
}

export function searchProducts(query: string): Product[] {
  return products.filter((p) => p.name.includes(query));
}

export function applyDiscount(productId: number, discount: number): number {
  if (discount < 0 || discount > 1) {
    throw new Error('Discount must be between 0 and 1');
  }
  const product = products.find((p) => p.id === productId);
  if (!product) {
    throw new Error('Product not found');
  }
  return product.price * (1 - discount);
}
