IMAGE=dragonballdle
PORT=8080

# Roda localmente em modo desenvolvimento
dev:
	docker build -t $(IMAGE)-dev .
	docker run --rm -p $(PORT):80 --name $(IMAGE)-dev $(IMAGE)-dev

# Build de produção
build:
	docker build -t $(IMAGE) .

# Sobe o container de produção
up:
	docker run -d --name $(IMAGE) \
		-p 80:80 \
		-p 443:443 \
		-v /etc/letsencrypt:/etc/letsencrypt \
		$(IMAGE):latest

# Para e remove o container
down:
	docker stop $(IMAGE) || true
	docker rm $(IMAGE) || true

# Rebuild e restart
restart: down build up

# Logs do container
logs:
	docker logs -f $(IMAGE)

# Acessa o shell do container
shell:
	docker exec -it $(IMAGE) sh

.PHONY: dev build up down restart logs shell