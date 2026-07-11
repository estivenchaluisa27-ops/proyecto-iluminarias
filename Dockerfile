FROM node:20-slim AS node-builder
WORKDIR /build
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
COPY shared/ /shared/
RUN npm run build

FROM python:3.12

RUN apt-get update && apt-get install -y supervisor --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

COPY backend/analytics/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir --prefer-binary -r /tmp/requirements.txt \
  && rm -f /tmp/requirements.txt

ENV NODE_ENV=production
ENV PORT=3001
ENV ANALYTICS_URL=http://localhost:5000

COPY --from=node-builder /build/dist /app/backend/dist
COPY --from=node-builder /build/node_modules /app/backend/node_modules
COPY --from=node-builder /build/package.json /app/backend/
COPY backend/analytics /app/backend/analytics
COPY backend/data /app/backend/data
COPY backend/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

WORKDIR /app/backend

EXPOSE 3001

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
