docker run --name postgres --rm ^
  -e POSTGRES_PASSWORD=keyoarbcat ^
  -p 5432:5432 ^
  -v db-data:/var/lib/postgresql ^
  -d postgres:16.13-alpine3.23
