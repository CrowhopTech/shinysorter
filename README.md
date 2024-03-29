# Shiny Sorter
*An easy-to-use system for tagging large amounts of files with user input*

## Features

*Coming soon!*

## Architecture
There are two primary design decisions to be aware of.

First and foremost, this is built on top of the Supabase stack. This is because Supabase provided a proven stack to run common services like a database and object store, but also provided a common API for all of these features and room to implement more complex features later such as per-user files and tags.

Secondly, this is built on top of Kubernetes (but can be converted into Docker Swarm or run piecemeal if needed), mainly because it's what I'm experienced with from work, but also because it provides maximum customization as far as where it can run (storage, compute, OS, etc.). It is installed with a helm chart.

### Deployed Components
* Supabase Stack
* WebDAV Server (exposes an easy filesystem to dump files to for import)
* Shiny Sorter Web Content (nginx, serves an Angular site)
* Shiny Sorter Query Server (serves as a proxy for more complex queries to PostgreSQL inside Supabase)
* Shiny Sorter Importer (imports files from the WebDAV server and uploads them to Supabase Storage, also computes md5sums and fuzzy image hashes)
* Shiny Sorter Backup Tool (CLI utility for dumping the contents of storage and PostgreSQL to a tarball (in case you don't trust your backups, like me))

## Development

### Web Development Config
To run the web development server locally, you must change `apps/web/src/assets/app.config.json` to contain:
* The address of the Supabase API: looks like `http://<address>:8000`
* The Supabase key: is a JWT
* The address of the query server: looks like `http://<address>:3268/query`

After this is done, you can run `nx run web:serve:development` and develop as normal. The path will have a `/replacemebasehref` in it:
this is expected, and is a token we replace at runtime in the Docker image to enable dynamic base paths.

### Query Server Development
Running the query server is much simpler: it is simply `PG_CONNECTION_STRING="postgres://postgres:<pgpass>@<address>:5432/postgres" nx run queryserver:serve`. This Postgres connection string can be obtained by using a locally running Supabase install, or a full deployment.

### Importer Development
The importer can be provided with an env file. For example:
```
SUPABASE_ADDRESS=http://<address>:8000
SUPABASE_KEY="<JWT Supabase key>"
BUCKET_NAME=files
THUMBS_BUCKET_NAME=thumbs
IMPORT_DIRECTORY=<existing directory of your choosing, such as 'import'>
```
You can then run `env-cmd -f <env file> nx run importer:serve`

### Backup Tool
# TODO: The backup tool has a less official development method for now.