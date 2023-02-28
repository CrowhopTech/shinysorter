# https://nx.dev/node-server-tutorial/5-docker-target
FROM docker.io/node:gallium-alpine

ENV HOST=0.0.0.0
ENV PORT=6060

WORKDIR /app

RUN addgroup --system queryserver && \
    adduser --system -G queryserver queryserver

COPY dist/apps/queryserver queryserver
RUN chown -R queryserver:queryserver .

# SUPABASE_ADDRESS like "http://127.0.0.1:8000"
# ENV SUPABASE_ADDRESS ""
# ENV SUPABASE_KEY ""
# ENV BUCKET_NAME "files"
# ENV THUMBS_BUCKET_NAME "thumbs"
# ENV IMPORT_DIRECTORY=/import

CMD [ "node", "queryserver" ]