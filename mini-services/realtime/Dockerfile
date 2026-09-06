FROM oven/bun:1 as base
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile || bun install
COPY . .
EXPOSE 3003
CMD ["bun", "index.ts"]
