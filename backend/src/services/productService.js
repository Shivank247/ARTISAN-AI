import prisma from "../utils/prisma.js";

import {
  httpError,
} from "../utils/httpError.js";

import {
  optionalString,
  positiveInteger,
  requiredString,
} from "../utils/validation.js";

const productFields = [
  "title",
  "description",
  "category",
  "material",
  "tags",
  "imageUrl",
  "city",
  "state",
  "productionTimeDays",
  "price",
];

function optionalNonNegativeNumber(
  value,
  fieldName
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  if (
    !Number.isFinite(number) ||
    number < 0
  ) {
    throw httpError(
      400,
      "VALIDATION_ERROR",
      `${fieldName} must be a nonnegative number.`
    );
  }

  return number;
}

function productData(
  input,
  partial = false
) {
  const data = {};

  for (const field of productFields) {
    if (
      partial &&
      input[field] === undefined
    ) {
      continue;
    }

    if (
      [
        "title",
        "description",
        "category",
        "material",
      ].includes(field)
    ) {
      data[field] = requiredString(
        input[field],
        field
      );
    } else if (field === "tags") {
      if (
        input[field] === undefined ||
        input[field] === null
      ) {
        data[field] = [];
        continue;
      }

      if (
        !Array.isArray(input[field]) ||
        input[field].some(
          (tag) =>
            typeof tag !== "string"
        )
      ) {
        throw httpError(
          400,
          "VALIDATION_ERROR",
          "tags must be an array of strings."
        );
      }

      data[field] = input[field]
        .map((tag) => tag.trim())
        .filter(Boolean);
    } else if (field === "price") {
      data[field] = positiveInteger(
        input[field],
        field
      );
    } else if (
      field === "productionTimeDays"
    ) {
      data[field] =
        input[field] === null
          ? null
          : positiveInteger(
              input[field],
              field
            );
    } else {
      data[field] = optionalString(
        input[field],
        field
      );
    }
  }

  return data;
}

export async function createProduct(
  userId,
  input
) {
  const artisan =
    await prisma.artisan.findUnique({
      where: { userId },
    });

  if (!artisan) {
    throw httpError(
      404,
      "ARTISAN_NOT_FOUND",
      "Create an artisan profile first."
    );
  }

  const data = productData(input);

  if (
    input.status &&
    input.status !== "DRAFT"
  ) {
    throw httpError(
      400,
      "VALIDATION_ERROR",
      "New products must start as DRAFT."
    );
  }

  return prisma.product.create({
    data: {
      ...data,
      artisanId: artisan.id,
      status: "DRAFT",
    },
  });
}

export async function listProducts(
  query = {},
  userId = null
) {
  const page = Math.max(
    1,
    Number(query.page) || 1
  );

  const limit = Math.min(
    100,
    Math.max(
      1,
      Number(query.limit) || 20
    )
  );

  const minPrice =
    optionalNonNegativeNumber(
      query.minPrice,
      "minPrice"
    );

  const maxPrice =
    optionalNonNegativeNumber(
      query.maxPrice,
      "maxPrice"
    );

  if (
    minPrice !== null &&
    maxPrice !== null &&
    minPrice > maxPrice
  ) {
    throw httpError(
      400,
      "VALIDATION_ERROR",
      "minPrice cannot be greater than maxPrice."
    );
  }

  /*
   * Marketplace:
   * only PUBLISHED products.
   *
   * Artisan history:
   * only products belonging to
   * the logged-in artisan.
   */
  const where = userId
    ? {
        artisan: {
          userId,
        },
      }
    : {
        status: "PUBLISHED",
      };

  /*
   * Explicit category filter.
   *
   * Example:
   * category=Paintings
   *
   * This remains case-insensitive.
   */
  if (query.category) {
    where.category = {
      contains: String(
        query.category
      ).trim(),
      mode: "insensitive",
    };
  }

  /*
   * State remains an exact filter.
   */
  if (query.state) {
    where.state = query.state;
  }

  /*
   * Price filters remain AND filters.
   */
  if (minPrice !== null) {
    where.price = {
      ...(where.price || {}),
      gte: minPrice,
    };
  }

  if (maxPrice !== null) {
    where.price = {
      ...(where.price || {}),
      lte: maxPrice,
    };
  }

  /*
   * AI / marketplace search.
   *
   * Instead of searching the entire query as one phrase,
   * split it into individual meaningful terms.
   *
   * Example:
   *
   * "madhubani painting"
   *
   * becomes:
   *
   * ["madhubani", "painting"]
   *
   * Each term can independently match:
   * - title
   * - description
   * - material
   * - category
   * - tags
   *
   * This makes broad AI searches much more useful.
   */
  if (query.search) {
    const searchText = String(
      query.search
    ).trim();

    if (searchText) {
      const searchTerms = [
        ...new Set(
          searchText
            .split(/\s+/)
            .map((term) => term.trim())
            .filter(Boolean)
        ),
      ];

      /*
       * Ignore extremely common words that do not
       * help product discovery.
       */
      const stopWords = new Set([
        "a",
        "an",
        "and",
        "are",
        "for",
        "from",
        "i",
        "in",
        "is",
        "me",
        "of",
        "on",
        "please",
        "show",
        "the",
        "to",
        "with",
      ]);

      const meaningfulTerms =
        searchTerms.filter(
          (term) =>
            !stopWords.has(
              term.toLowerCase()
            )
        );

      /*
       * If every term was a stop word, fall back
       * to the original search text.
       */
      const terms =
        meaningfulTerms.length > 0
          ? meaningfulTerms
          : searchTerms;

      /*
       * Build an OR condition for every term.
       *
       * A product matches when ANY meaningful term
       * appears in ANY supported searchable field.
       */
      where.OR = [];

      for (const term of terms) {
        where.OR.push(
          {
            title: {
              contains: term,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: term,
              mode: "insensitive",
            },
          },
          {
            material: {
              contains: term,
              mode: "insensitive",
            },
          },
          {
            category: {
              contains: term,
              mode: "insensitive",
            },
          },
          {
            tags: {
              has: term,
            },
          }
        );
      }

      /*
       * Prevent an empty OR array.
       */
      if (where.OR.length === 0) {
        delete where.OR;
      }
    }
  }

  const [
    products,
    total,
  ] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: {
        artisan: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.product.count({
      where,
    }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
    },
  };
}

export async function getProduct(
  id,
  userId = null
) {
  const product =
    await prisma.product.findUnique({
      where: { id },
      include: {
        artisan: true,
      },
    });

  if (
    !product ||
    (
      product.status !== "PUBLISHED" &&
      (
        !userId ||
        product.artisan.userId !==
          userId
      )
    )
  ) {
    throw httpError(
      404,
      "PRODUCT_NOT_FOUND",
      "Product not found."
    );
  }

  return product;
}

async function ownedProduct(
  id,
  userId
) {
  const product =
    await prisma.product.findUnique({
      where: { id },
      include: {
        artisan: true,
      },
    });

  if (!product) {
    throw httpError(
      404,
      "PRODUCT_NOT_FOUND",
      "Product not found."
    );
  }

  if (
    product.artisan.userId !== userId
  ) {
    throw httpError(
      403,
      "FORBIDDEN",
      "You do not own this product."
    );
  }

  return product;
}

export async function updateProduct(
  id,
  userId,
  input,
  isAdmin = false
) {
  const product = isAdmin
    ? await prisma.product.findUnique({
        where: { id },
      })
    : await ownedProduct(
        id,
        userId
      );

  if (!product) {
    throw httpError(
      404,
      "PRODUCT_NOT_FOUND",
      "Product not found."
    );
  }

  const data = productData(
    input,
    true
  );

  if (input.status !== undefined) {
    if (
      input.status !== "DRAFT" &&
      input.status !== "PUBLISHED"
    ) {
      throw httpError(
        400,
        "VALIDATION_ERROR",
        "Invalid product status."
      );
    }

    if (
      input.status ===
        "PUBLISHED" &&
      (
        (
          !data.title &&
          !product.title
        ) ||
        (
          !data.description &&
          !product.description
        ) ||
        (
          !data.category &&
          !product.category
        ) ||
        (
          !data.material &&
          !product.material
        ) ||
        (
          (data.price ??
            product.price) <= 0
        )
      )
    ) {
      throw httpError(
        400,
        "PRODUCT_NOT_READY",
        "Required product fields must be complete before publishing."
      );
    }

    data.status = input.status;
  }

  return prisma.product.update({
    where: { id },
    data,
  });
}

export async function deleteProduct(
  id,
  userId,
  isAdmin = false
) {
  if (!isAdmin) {
    await ownedProduct(
      id,
      userId
    );
  }

  await prisma.product.delete({
    where: { id },
  });

  return {
    deleted: true,
  };
}