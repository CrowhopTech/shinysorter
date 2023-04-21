# https://nx.dev/node-server-tutorial/5-docker-target
FROM docker.io/node:gallium-alpine

RUN ["apk", "add", "--no-cache", "ffmpeg", "python3", "make", "gcc", "py3-magic", "lua-file-magic", "perl-file-mmagic", "libc-dev", "build-base"]

WORKDIR /app

RUN addgroup --system importer && \
    adduser --system -G importer importer

COPY dist/apps/importer importer
# Hack required to make mmmagic work
COPY node_modules/mmmagic/build build
RUN chown -R importer:importer .

RUN mkdir /import

# SUPABASE_ADDRESS like "http://127.0.0.1:8000"
ENV SUPABASE_ADDRESS ""
ENV SUPABASE_KEY ""
ENV BUCKET_NAME "files"
ENV THUMBS_BUCKET_NAME "thumbs"
ENV IMPORT_DIRECTORY=/import

CMD [ "node", "importer" ]