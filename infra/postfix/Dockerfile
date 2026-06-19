# infra/postfix/Dockerfile

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    postfix \
    postfix-ldap \
    libsasl2-modules \
    && rm -rf /var/lib/apt/lists/*

# Copy config files
COPY main.cf /etc/postfix/main.cf
COPY master.cf /etc/postfix/master.cf
COPY ldap-accounts.cf /etc/postfix/ldap-accounts.cf

# Postfix requires these directories
RUN mkdir -p /var/spool/postfix/private

EXPOSE 25

CMD ["postfix", "start-fg"]