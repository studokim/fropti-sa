import { randomUUID } from "node:crypto";

const RESERVATION_MS = 15 * 60 * 1000;

const cook = {
  id: "cook-maria",
  name: "Мария К.",
  avatarUrl: null,
  rating: 4.8,
  hasMedicalBook: true,
};

const dishes = new Map([
  [
    "borscht",
    dish({
      id: "borscht",
      title: "Борщ с говядиной",
      composition: "свёкла, говядина, картофель, капуста, сметана",
      allergens: ["сельдерей", "молоко"],
      portionWeight: 350,
      calories: 320,
      proteins: 12,
      fats: 8,
      carbohydrates: 50,
      price: 450,
      productionDate: "2026-10-15",
      bestBefore: "2027-04-14",
      storageConditions: "−18 °C",
      reheating: "микроволновка, 4 мин",
      availablePortions: 6,
      rating: 4.8,
      deliveryPrice: 99,
      deliveryAvailable: true,
    }),
  ],
  [
    "syrniki",
    dish({
      id: "syrniki",
      title: "Сырники",
      composition: "Творог, яйцо, мука, сахар, ваниль",
      allergens: ["лактоза", "глютен", "яйцо"],
      portionWeight: 180,
      calories: 280,
      proteins: 14,
      fats: 9,
      carbohydrates: 32,
      price: 320,
      productionDate: "2026-10-18",
      bestBefore: "2027-04-17",
      storageConditions: "−18 °C",
      reheating: "Сковорода 6 минут или духовка 12 минут при 180 °C",
      availablePortions: 2,
      rating: 4.6,
      deliveryPrice: 99,
      deliveryAvailable: true,
    }),
  ],
  [
    "pelmeni",
    dish({
      id: "pelmeni",
      title: "Пельмени домашние",
      composition: "Говядина, свинина, лук, мука, яйцо",
      allergens: [],
      portionWeight: 400,
      calories: 510,
      proteins: 22,
      fats: 18,
      carbohydrates: 48,
      price: 390,
      productionDate: "2026-10-10",
      bestBefore: "2027-04-09",
      storageConditions: "−18 °C",
      reheating: "Кипящая вода 8 минут после всплытия",
      availablePortions: 0,
      rating: 4.9,
      deliveryPrice: 99,
      deliveryAvailable: true,
    }),
  ],
  [
    "olivier",
    dish({
      id: "olivier",
      title: "Оливье",
      composition: "Картофель, морковь, яйцо, колбаса, огурец, горошек, майонез",
      allergens: ["яйцо"],
      portionWeight: 250,
      calories: 340,
      proteins: 8,
      fats: 22,
      carbohydrates: 24,
      price: 280,
      productionDate: "2026-10-22",
      bestBefore: "2027-04-21",
      storageConditions: "−18 °C",
      reheating: "Разморозить в холодильнике, подавать холодным",
      availablePortions: 6,
      rating: 4.4,
      deliveryPrice: 99,
      deliveryAvailable: false,
    }),
  ],
]);

const reviews = new Map([
  [
    "borscht",
    [
      review("borscht", 1, "Ольга", 5, "Как домашняя, дети попросили ещё", "2026-10-28"),
      review("borscht", 2, "Дмитрий", 5, "Взял на неделю в офис", "2026-10-21"),
      ...buildReviews("borscht", 10, 3),
    ],
  ],
  ["syrniki", buildReviews("syrniki", 3)],
  ["pelmeni", []],
  ["olivier", buildReviews("olivier", 1)],
]);

for (const item of dishes.values()) {
  item.reviewsCount = reviews.get(item.id).length;
}

const orders = new Map();

function dish(fields) {
  return {
    ...fields,
    images: [
      { url: `https://example.com/dishes/${fields.id}-frozen.jpg`, kind: "frozen" },
      { url: `https://example.com/dishes/${fields.id}-ready.jpg`, kind: "ready" },
    ],
    updatedAt: "2026-10-30T12:00:00.000Z",
  };
}

function review(dishId, index, authorName, rating, text, day) {
  return {
    id: `${dishId}-review-${index}`,
    authorName,
    rating,
    text,
    createdAt: `${day}T12:00:00.000Z`,
  };
}

function buildReviews(dishId, count, startAt = 1) {
  const authors = ["Игорь", "Светлана", "Никита", "Павел", "Елена", "Артём"];
  const texts = [
    "Разогрелось ровно, вкус как дома.",
    "Порция сытная, на следующий день тоже хорошо.",
    "Заказывали на неделю — приехало замороженным, всё целое.",
  ];
  return Array.from({ length: count }, (_, offset) => {
    const index = startAt + offset;
    return review(
      dishId,
      index,
      authors[offset % authors.length],
      offset % 4 === 0 ? 4 : 5,
      texts[offset % texts.length],
      new Date(Date.UTC(2026, 9, 18) - offset * 86_400_000).toISOString().slice(0, 10),
    );
  });
}

function cookCard() {
  return {
    id: cook.id,
    name: cook.name,
    avatarUrl: cook.avatarUrl,
    rating: cook.rating,
    hasMedicalBook: cook.hasMedicalBook,
  };
}

function publicDish(item) {
  return {
    id: item.id,
    title: item.title,
    composition: item.composition,
    allergens: item.allergens,
    portionWeight: item.portionWeight,
    calories: item.calories,
    proteins: item.proteins,
    fats: item.fats,
    carbohydrates: item.carbohydrates,
    price: item.price,
    productionDate: item.productionDate,
    bestBefore: item.bestBefore,
    storageConditions: item.storageConditions,
    reheating: item.reheating,
    images: item.images,
    availablePortions: item.availablePortions,
    rating: item.rating,
    reviewsCount: item.reviewsCount,
    deliveryPrice: item.deliveryPrice,
    cook: cookCard(),
    updatedAt: item.updatedAt,
  };
}

function releaseExpired(now = Date.now()) {
  for (const order of orders.values()) {
    const waiting = order.status === "created" || order.status === "awaitingPayment";
    if (!waiting || new Date(order.reservedUntil).getTime() > now) continue;
    const item = dishes.get(order.dishId);
    if (item) item.availablePortions += order.quantity;
    order.status = "cancelled";
    order.cancelReason = "reservation_expired";
  }
}

function liveOrder(dishId) {
  releaseExpired();
  for (const order of orders.values()) {
    const waiting = order.status === "created" || order.status === "awaitingPayment";
    if (waiting && order.dishId === dishId) return order;
  }
  return null;
}

function orderBody(order) {
  return {
    orderId: order.orderId,
    status: order.status,
    reservedUntil: order.reservedUntil,
    price: order.price,
    itemsTotal: order.itemsTotal,
    deliveryPrice: order.deliveryPrice,
    total: order.total,
  };
}

export function getDish(id) {
  releaseExpired();
  const item = dishes.get(id);
  if (!item) return notFoundDish();
  return { status: 200, body: publicDish(item) };
}

export function getReviews(id, page, size) {
  if (!dishes.has(id)) return notFoundDish();
  const all = reviews.get(id) ?? [];
  const start = page * size;
  const items = all.slice(start, start + size);
  return { status: 200, body: { items, hasMore: start + size < all.length } };
}

export function getCook(id) {
  releaseExpired();
  if (id !== cook.id) {
    return { status: 404, body: { code: "not_found", message: "Повар не найден" } };
  }
  return {
    status: 200,
    body: {
      id: cook.id,
      name: cook.name,
      rating: cook.rating,
      hasMedicalBook: cook.hasMedicalBook,
      dishes: [...dishes.values()].map((item) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        availablePortions: item.availablePortions,
        imageUrl: item.images[0]?.url ?? null,
      })),
    },
  };
}

export function createOrder(dishId, quantity) {
  const item = dishes.get(dishId);
  if (!item) return notFoundDish();

  const existing = liveOrder(dishId);
  if (existing) return { status: 200, body: orderBody(existing) };

  if (!item.deliveryAvailable) {
    return {
      status: 409,
      body: {
        code: "delivery_unavailable",
        message: "Доставка на этой неделе недоступна. Попробуйте оформить заказ позже",
      },
    };
  }
  if (item.availablePortions === 0) {
    return {
      status: 409,
      body: {
        code: "out_of_stock",
        message: "Блюдо закончилось",
        availablePortions: 0,
      },
    };
  }
  if (quantity > item.availablePortions) {
    return {
      status: 409,
      body: {
        code: "insufficient_portions",
        message: `Доступно только ${item.availablePortions} ${portionsWord(item.availablePortions)}`,
        availablePortions: item.availablePortions,
      },
    };
  }

  const itemsTotal = item.price * quantity;
  const order = {
    orderId: randomUUID(),
    dishId,
    quantity,
    status: "created",
    reservedUntil: new Date(Date.now() + RESERVATION_MS).toISOString(),
    price: item.price,
    itemsTotal,
    deliveryPrice: item.deliveryPrice,
    total: itemsTotal + item.deliveryPrice,
    payment: null,
    cancelReason: null,
  };
  item.availablePortions -= quantity;
  orders.set(order.orderId, order);
  return { status: 201, body: orderBody(order) };
}

export function createPayment(orderId) {
  releaseExpired();
  const order = orders.get(orderId);
  if (!order) {
    return { status: 404, body: { code: "not_found", message: "Заказ не найден" } };
  }
  if (order.status === "cancelled" && order.cancelReason === "reservation_expired") {
    return {
      status: 410,
      body: {
        code: "reservation_expired",
        message: "Время резерва истекло. Повторите оплату — мы перепроверим наличие",
      },
    };
  }
  if (order.status !== "created" && order.status !== "awaitingPayment") {
    return {
      status: 409,
      body: { code: "invalid_status", message: "Заказ уже нельзя оплатить" },
    };
  }
  if (!order.payment) {
    order.payment = {
      paymentId: randomUUID(),
      confirmationUrl: `https://example.com/pay/${order.orderId}`,
      status: "pending",
    };
  }
  order.status = "awaitingPayment";
  return { status: 200, body: order.payment };
}

function notFoundDish() {
  return { status: 404, body: { code: "not_found", message: "Блюдо больше не публикуется" } };
}

function portionsWord(n) {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return "порция";
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return "порции";
  return "порций";
}
