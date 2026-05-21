# Cloud Connector — deployment placeholder image.
#
# Tiny, dependency-free Node app deployed by arm/main.bicep in place of the
# real service images so the managed-app install succeeds with no registry
# credential. Build and push it to a PUBLIC, anonymously-pullable registry.
#
# Runs as root on purpose: the UI Container App has targetPort 80, and a
# non-root user cannot bind ports below 1024 in a Container Apps container.
# The image has no attack surface — it only serves a static HTTP 200.
FROM node:20-alpine
WORKDIR /app
COPY server.js ./
ENV PORT=80
EXPOSE 80
CMD ["node", "server.js"]
