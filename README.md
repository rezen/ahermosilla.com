## Development

```sh
docker build -t mywww .
docker run -it -p 4000:4000 -v $(pwd):/app mywww
```