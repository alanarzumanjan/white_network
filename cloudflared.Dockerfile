FROM cloudflare/cloudflared:latest

COPY .cloudflared /etc/cloudflared

ENTRYPOINT ["cloudflared", "tunnel", "--config", "/etc/cloudflared/config.yml", "run"]