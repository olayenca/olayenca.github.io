  #!/bin/sh

export COMPOSE_FILE="test/docker-compose.test.yml"

docker-compose down \
&& docker-compose build \
&& docker-compose run test.spec
