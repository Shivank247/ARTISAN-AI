import prisma from "../utils/prisma.js";

import {
  httpError,
} from "../utils/httpError.js";

import {
  positiveInteger,
  requiredString,
} from "../utils/validation.js";

export async function createOrder(
  userId,
  input
) {
  const customerName =
    requiredString(
      input.customerName,
      "customerName"
    );

  const phone =
    requiredString(
      input.phone,
      "phone"
    );

  const address =
    requiredString(
      input.address,
      "address"
    );

  if (
    !Array.isArray(input.items) ||
    input.items.length === 0
  ) {
    throw httpError(
      400,
      "VALIDATION_ERROR",
      "At least one order item is required."
    );
  }

  const requested =
    input.items.map((item) => ({
      productId:
        requiredString(
          item.productId,
          "productId"
        ),

      quantity:
        positiveInteger(
          item.quantity,
          "quantity"
        ),
    }));

  /*
   * Prevent duplicate product IDs in
   * one order because OrderItem has:
   * @@unique([orderId, productId])
   */
  const productIds =
    requested.map(
      (item) => item.productId
    );

  const uniqueProductIds =
    new Set(productIds);

  if (
    uniqueProductIds.size !==
    productIds.length
  ) {
    throw httpError(
      400,
      "VALIDATION_ERROR",
      "A product can only appear once in an order."
    );
  }

  const products =
    await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        status: "PUBLISHED",
      },
    });

  if (
    products.length !==
    requested.length
  ) {
    throw httpError(
      400,
      "INVALID_ORDER_ITEMS",
      "Every product must exist and be published."
    );
  }

  const byId = new Map(
    products.map(
      (product) => [
        product.id,
        product,
      ]
    )
  );

  const items =
    requested.map((item) => ({
      ...item,
      unitPrice:
        byId.get(
          item.productId
        ).price,
    }));

  const totalAmount =
    items.reduce(
      (
        total,
        item
      ) =>
        total +
        item.quantity *
          item.unitPrice,
      0
    );

  return prisma.order.create({
    data: {
      customerId:
        userId || null,

      customerName,
      phone,
      address,
      totalAmount,

      items: {
        create: items,
      },
    },

    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}

/*
 * Get one order.
 */
export async function getOrder(
  id,
  userId,
  isAdmin = false
) {
  const order =
    await prisma.order.findUnique({
      where: { id },

      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

  if (
    !order ||
    (
      !isAdmin &&
      order.customerId !==
        userId
    )
  ) {
    throw httpError(
      404,
      "ORDER_NOT_FOUND",
      "Order not found."
    );
  }

  return order;
}

/*
 * Get all orders belonging to
 * the currently logged-in customer.
 */
export async function listOrders(
  userId
) {
  if (!userId) {
    throw httpError(
      401,
      "UNAUTHORIZED",
      "Customer login is required to view order history."
    );
  }

  return prisma.order.findMany({
    where: {
      customerId: userId,
    },

    include: {
      items: {
        include: {
          product: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function updateOrderStatus(
  id,
  status
) {
  const allowedStatuses = [
    "PLACED",
    "CONFIRMED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];

  if (
    !allowedStatuses.includes(
      status
    )
  ) {
    throw httpError(
      400,
      "VALIDATION_ERROR",
      "Invalid order status."
    );
  }

  const order =
    await prisma.order.findUnique({
      where: { id },
    });

  if (!order) {
    throw httpError(
      404,
      "ORDER_NOT_FOUND",
      "Order not found."
    );
  }

  return prisma.order.update({
    where: { id },

    data: {
      status,
    },

    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}